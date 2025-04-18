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
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const GalleryCard = ({ gallery, currentUserId, fetchGallery }) => {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [products, setProducts] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const isOwner = gallery?.owner?._id === currentUserId;

  useEffect(() => {
    if (gallery?.products?.length && gallery.products.every(p => p?.product?._id)) {
      setProducts(gallery.products);
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

  const handleDragEnd = async (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;

    const updated = Array.from(products);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);

    setProducts(updated);

    try {
      const orderedIds = updated.map((item) => item.product._id);
      await fetch(`/api/galleries/${gallery._id}/reorder-products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderedProductIds: orderedIds }),
      });
    } catch (err) {
      console.error("Failed to update order", err);
    }
  };

  return (
    <Box mt={8} px={4}>
      <Heading size="lg" mb={2}>{gallery.name}</Heading>
      <Text fontSize="md" mb={4}>{gallery.description}</Text>
      <Image
        src={gallery.coverPhoto || "https://via.placeholder.com/800"}
        alt="Gallery Cover"
        w="full"
        h="300px"
        objectFit="cover"
      />

      {isOwner && (
        <Flex justify="space-between" my={4}>
          <Button colorScheme="blue" onClick={onOpen}>Add Existing Product</Button>
        </Flex>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="products" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem",
              }}
            >
              {products.map((item, index) => {
                const p = item.product;
                return (
                  <Draggable
                    key={p._id}
                    draggableId={p._id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Box bg="gray.200"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          transition: "transform 200ms ease",
                          boxShadow: snapshot.isDragging ? "0 0 10px rgba(0,0,0,0.3)" : "none",
                          background: "gray.100",
                          padding: "1rem",
                          borderRadius: "md",
                        }}
                      >
                        <Image
                          src={p.images?.[0] || "https://via.placeholder.com/150"}
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
                        {isOwner && (
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
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

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
                      src={product.images[0] || "https://via.placeholder.com/150"}
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
