import React, { useState } from "react";
import {
  Box,
  Heading,
  Flex,
  Button,
  Text,
  Image,
  Select,
  Input,
  Grid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";

const GalleryCard = ({ gallery, currentUserId, fetchGallery }) => {
  const [selectedImage, setSelectedImage] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleImageClick = (image) => {
    setSelectedImage(image);
    onOpen();
  };

  const addProductToGallery = async (productId) => {
    try {
      const res = await fetch(`/api/galleries/${gallery._id}/add-product/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to add product");
      fetchGallery();
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };



  return (
    <Box mt={8} px={4}>
      <Heading size="lg" mb={4}>{gallery.name}</Heading>
      <Image src={gallery.coverPhoto || "https://via.placeholder.com/800"} alt="Gallery Cover" w="full" h="300px" objectFit="cover" />

      <Flex justify="space-between" my={4}>
        <Button colorScheme="blue" onClick={() => alert("Open modal to select existing product")}>
          Add Existing Product
        </Button>
      </Flex>

      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
        {gallery.products?.map((product) => (
          <Box key={product._id} bg="gray.200" p={4} borderRadius="md">
            <Image src={product.coverPhoto || "https://via.placeholder.com/150"} alt={product.name} w="100%" h="150px" objectFit="cover" />
            <Heading size="md">{product.name}</Heading>
            <Text>${product.price}</Text>
            <Text>{product.description}</Text>
            <Button colorScheme="red" onClick={() => addProductToGallery(product._id)}>Add to Gallery</Button>
          </Box>
        ))}
      </Grid>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Image src={selectedImage} alt="Selected" borderRadius="md" w="100%" h="auto" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GalleryCard;
