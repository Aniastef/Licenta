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
  useDisclosure,
} from "@chakra-ui/react";

const GalleryCard = ({ gallery, currentUserId, fetchGallery }) => {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

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

    if (isModalOpen) {
      fetchAvailableProducts();
    }
  }, [isModalOpen, gallery._id]);

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

      // Reîmprospătează galeria curentă
      await fetchGallery();

      // Elimină produsul din lista locală și filtrată
      setAvailableProducts((prev) => prev.filter((product) => product._id !== productId));
      setFilteredProducts((prev) => prev.filter((product) => product._id !== productId));
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  return (
    <Box mt={8} px={4}>
      <Heading size="lg" mb={4}>{gallery.name}</Heading>
      <Image src={gallery.coverPhoto || "https://via.placeholder.com/800"} alt="Gallery Cover" w="full" h="300px" objectFit="cover" />

      <Flex justify="space-between" my={4}>
        <Button colorScheme="blue" onClick={() => setIsModalOpen(true)}>
          Add Existing Product
        </Button>
      </Flex>

      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
        {gallery.products.map((product) => (
          <Box key={product._id} bg="gray.200" p={4} borderRadius="md">
            <Image src={product.images[0] || "https://via.placeholder.com/150"} alt={product.name} w="100%" h="150px" objectFit="cover" />
            <Heading size="md">{product.name}</Heading>
            <Text>${product.price}</Text>
            <Text>{product.description}</Text>
          </Box>
        ))}
      </Grid>

      {/* Modal pentru alegerea produselor existente */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl" isCentered>
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
                    <Text>${product.price}</Text>
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
