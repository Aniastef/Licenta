import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Flex,
  Button,
  Text,
  Image,
  Grid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Input,
  Tag,
  useDisclosure,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const GalleryCard = ({ gallery, currentUserId, fetchGallery }) => {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterText, setFilterText] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

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
      console.log("Removing product ID:", productId, "from gallery:", gallery);

      const endpoint =
        gallery._id === "all-products-gallery"
          ? `/api/products/${productId}` 
          : `/api/galleries/${gallery._id}/remove-product/${productId}`; 

      const res = await fetch(endpoint, {
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

  return (
    <Box mt={8} px={4}>
      <Heading size="lg" mb={4}>{gallery.name}</Heading>
      <Image
        src={gallery.coverPhoto || "https://via.placeholder.com/800"}
        alt="Gallery Cover"
        w="full"
        h="300px"
        objectFit="cover"
      />

      <Flex justify="space-between" my={4}>
        {gallery._id !== "all-products-gallery" ? (
          <Button colorScheme="blue" onClick={onOpen}>
            Add Existing Product
          </Button>
        ) : (
          <Button colorScheme="green" onClick={() => navigate("/create/product")}>
            Create New Product
          </Button>
        )}
      </Flex>

      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
        {gallery.products.map((product) => (
          <Box key={product._id} bg="gray.200" p={4} borderRadius="md">
            <Image
              src={product.images[0] || "https://via.placeholder.com/150"}
              alt={product.name}
              w="100%"
              h="150px"
              objectFit="cover"
            />
            <Heading size="md">{product.name}</Heading>
            <Text>{product.price} RON</Text>

            {/* ✅ Afișăm "For Sale", "Not for Sale" și stocul */}
            <Tag 
              colorScheme={product.forSale ? (product.quantity > 0 ? "green" : "red") : "gray"}
              mt={2}
            >
              {!product.forSale ? "Not for Sale" : product.quantity > 0 ? `Stock: ${product.quantity} left` : "Out of Stock"}
            </Tag>

            <Text mt={2}>{product.description}</Text>

            <Button
              colorScheme="red"
              size="sm"
              mt={2}
              onClick={() => removeProductFromGallery(product._id)}
            >
              {gallery.name === "All Products" ? "Delete Product" : "Remove from Gallery"}
            </Button>
          </Box>
        ))}
      </Grid>

      {/* Modal pentru alegerea produselor existente */}
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
            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
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
                    
                    {/* ✅ Afișăm "For Sale", "Not for Sale" și stocul */}
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
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GalleryCard;
