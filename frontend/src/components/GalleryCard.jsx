import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Flex,
  Button,
  Text,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Input,
  Tag,
  useDisclosure,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ReactSortable } from "react-sortablejs";

const GalleryCard = ({ gallery, currentUserId, fetchGallery }) => {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [products, setProducts] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const isOwner = gallery?.owner?._id === currentUserId;
  const isCollaborator = gallery?.collaborators?.some((c) => c._id === currentUserId);
  const canEdit = isOwner || isCollaborator;

  useEffect(() => {
    if (!Array.isArray(gallery?.products)) return;

    const ordered = [...gallery.products].sort((a, b) => a.order - b.order);
    const isDifferent =
      products.length !== ordered.length ||
      products.some((p, i) => p.product._id !== ordered[i]?.product?._id);

    if (isDifferent && ordered.every((p) => p?.product?._id)) {
      setProducts(ordered);
    }
  }, [gallery.products]);

  useEffect(() => {
    const fetchAvailableProducts = async () => {
      try {
        const res = await fetch(`/api/products/not-in-gallery/${gallery._id}`);
        const data = await res.json();
        setAvailableProducts(data.products || []);
        setFilteredProducts(data.products || []);
      } catch (err) {
        console.error("Error fetching available products:", err);
      }
    };

    if (isOpen) {
      fetchAvailableProducts();
    }
  }, [isOpen, gallery._id]);

  const handleFilterChange = (e) => {
    const searchText = e.target.value.toLowerCase();
    setFilterText(searchText);
    const filtered = availableProducts.filter((product) =>
      product.name.toLowerCase().includes(searchText)
    );
    setFilteredProducts(filtered);
  };

  const addProductToGallery = async (productId) => {
    try {
      const res = await fetch(`/api/galleries/${gallery._id}/add-product/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to add product");

      await fetchGallery();
      setAvailableProducts((prev) => prev.filter((product) => product._id !== productId));
      setFilteredProducts((prev) => prev.filter((product) => product._id !== productId));
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  const removeProductFromGallery = async (productId) => {
    try {
      const res = await fetch(`/api/galleries/${gallery._id}/remove-product/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to remove product");

      await fetchGallery();
    } catch (err) {
      console.error("Error removing product:", err);
    }
  };

  const handleSort = async (newList) => {
    const orderedIds = newList.map((item) => item.product?._id).filter(Boolean);
  
    if (orderedIds.length === 0) {
      console.warn("⚠️ No product IDs to sort.");
      return;
    }
  
    try {
      const res = await fetch(`/api/galleries/${gallery._id}/reorder-products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderedProductIds: orderedIds }),
      });
  
      if (!res.ok) {
        const data = await res.json();
        console.error("❌ Order update failed:", data.error);
      } else {
        await fetchGallery(); // actualizăm datele din server
      }
    } catch (err) {
      console.error("❌ Failed to update order", err);
    }
  };
  
  
  

  return (
    <Box mt={8} px={4}>
      <Heading size="lg" mb={2}>{gallery.name}</Heading>
      <Text fontSize="md" mb={4}>{gallery.description}</Text>
      <Image
        src={gallery.coverPhoto || "https://i.pravatar.cc/150"}
        alt="Gallery Cover"
        w="full"
        h="300px"
        objectFit="cover"
      />

      {gallery.collaborators?.length > 0 && (
        <Box mt={4}>
          <Heading size="sm">Collaborators:</Heading>
          {gallery.collaborators.map((user) => (
            <Text key={user._id}>• {user.username}</Text>
          ))}
        </Box>
      )}

      {canEdit && (
        <Flex justify="space-between" my={4} gap={4} wrap="wrap">
          <Button colorScheme="blue" onClick={onOpen}>Add Existing Product</Button>
          <Button colorScheme="gray" variant="outline" onClick={() => navigate(`/edit-gallery/${gallery._id}`)}>
            Edit Gallery
          </Button>
        </Flex>
      )}

<ReactSortable
  list={products}
  setList={setProducts}
  animation={200}
  onEnd={({ newIndex, oldIndex }) => {
    const newOrder = [...products];
    const movedItem = newOrder.splice(oldIndex, 1)[0];
    newOrder.splice(newIndex, 0, movedItem);
    setProducts(newOrder);
    handleSort(newOrder); // pasăm noua ordine
  }}
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  }}
>


        {products.map((item) => {
          const p = item.product;
          return (
            <Box key={p._id} bg="gray.100" p={4} borderRadius="md">
              <Image
                src={p.images?.[0] || "https://i.pravatar.cc/150"}
                alt={p.name}
                w="100%"
                h="150px"
                objectFit="cover"
              />
              <Heading size="sm" mt={2}>{p.name}</Heading>
              <Text>{p.price} RON</Text>
              <Tag
                colorScheme={p.forSale ? (p.quantity > 0 ? "green" : "red") : "gray"}
                mt={1}
              >
                {!p.forSale ? "Not for Sale" : p.quantity > 0 ? `Stock: ${p.quantity} left` : "Out of Stock"}
              </Tag>
              <Text mt={2}>{p.description}</Text>
              {canEdit && (
                <Button
                  colorScheme="red"
                  size="sm"
                  mt={2}
                  onClick={() => removeProductFromGallery(p._id)}
                >
                  Remove from Gallery
                </Button>
              )}
            </Box>
          );
        })}
      </ReactSortable>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalBody p={5}>
            <Heading size="md" mb={4}>Select a product to add</Heading>
            <Input
              placeholder="Filter products by name"
              value={filterText}
              onChange={handleFilterChange}
              mb={4}
            />
            <Flex wrap="wrap" gap={4}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Box key={product._id} bg="gray.200" p={4} borderRadius="md">
                    <Image
                      src={product.images[0] || "https://i.pravatar.cc/150"}
                      alt={product.name}
                      w="100%"
                      h="150px"
                      objectFit="cover"
                    />
                    <Heading size="sm">{product.name}</Heading>
                    <Text>{product.price} RON</Text>
                    <Tag
                      colorScheme={product.forSale ? (product.quantity > 0 ? "green" : "red") : "gray"}
                      mt={2}
                    >
                      {!product.forSale ? "Not for Sale" : product.quantity > 0 ? `Stock: ${product.quantity} left` : "Out of Stock"}
                    </Tag>
                    <Button
                      colorScheme="green"
                      size="sm"
                      mt={2}
                      onClick={() => addProductToGallery(product._id)}
                    >
                      Add
                    </Button>
                  </Box>
                ))
              ) : (
                <Text>No products match your search.</Text>
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GalleryCard;
