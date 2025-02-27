import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Image,
  Flex,
  Button,
  useToast,
  Grid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import RectangleShape from "../assets/rectangleShape";
import { useCart } from "./CartContext";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const user = useRecoilValue(userAtom);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const imagesPerPage = 4;

  useEffect(() => {
    if (!user?.username || !product?._id) return;
  
    const checkIfFavorite = async () => {
      try {
        const res = await fetch(`/api/users/favorites/${user.username}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
  
        if (!res.ok) {
          console.error(`API Error ${res.status}: ${res.statusText}`);
          return;
        }
  
        const data = await res.json();
        if (!Array.isArray(data)) {
          console.error("Unexpected response format:", data);
          return;
        }
  
        setIsFavorite(data.some((favProduct) => favProduct._id === product._id));
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };
  
    checkIfFavorite();
  }, [user?.username, product?._id]);
  
  
  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Product added!",
      description: `${product.name} was added to your cart.`,
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top-right",
    });
  };

  const handleAddToFavorites = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add favorites.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    try {
      const res = await fetch(`/api/products/favorites/${product._id}`, {
        method: isFavorite ? "DELETE" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (res.ok) {
        setIsFavorite(!isFavorite);
        toast({
          title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
          description: `${product.name} was ${isFavorite ? "removed from" : "added to"} your favorites.`,
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top-right",
        });
      } else {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error adding/removing favorite:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  return (
    <Box mt={8} position="relative">
      {/** ✅ Asigură că `product` este definit */}
      {!product ? (
        <Text>Loading product details...</Text>
      ) : (
        <Flex direction={"row"} justify="space-between">
          <Flex direction="column" position="relative" height="auto" width="600px">
            <RectangleShape
              bgColor="blue.300"
              title={product.name}
              position="relative"
              minW="600px"
              maxW="600px"
            />

            <Flex align="center" mt={4}>
              {product.forSale && (
                <Button
                  bg="green.200"
                  borderRadius="lg"
                  width={190}
                  height="50px"
                  position="absolute"
                  right="-20"
                  top="10"
                >
                  Price: {product.price} RON
                </Button>
              )}

              <Text
                fontSize="lg"
                fontWeight="bold"
                color={product.forSale ? (product.quantity > 0 ? "green.500" : "red.500") : "gray.500"}
                ml={5}
              >
                {!product.forSale
                  ? "Not for sale"
                  : product.quantity > 0
                  ? `Stock: ${product.quantity} left`
                  : "Out of stock"}
              </Text>
            </Flex>

            <Box ml={5} mt={5} maxW="450px">
              <Text mt={5} fontWeight={"bold"}>
                Created by {product.user?.firstName || "Unknown"} {product.user?.lastName || "User"}
              </Text>

              <Text fontSize="lg" color="gray.600" mt={4}>
                {product.description || "No description available."}
              </Text>
            </Box>
          </Flex>

          <Flex mt={50} mr={100} direction="column" gap={4}>
            <Button
              bg="yellow.300"
              borderRadius="lg"
              width={190}
              height="50px"
              onClick={handleAddToCart}
              isDisabled={!product.forSale || product.quantity === 0}
            >
              {!product.forSale ? "Not for Sale" : product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>

            <Button
              bg={isFavorite ? "red.400" : "pink.300"}
              borderRadius="lg"
              width={190}
              height="50px"
              onClick={handleAddToFavorites}
            >
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </Button>

            {/** ✅ Verifică dacă `product.images` există înainte de a le accesa */}
            {product.images?.length > 0 && (
              <Grid templateColumns="repeat(2, 1fr)" gap={4} maxW="400px" mt={5}>
                {product.images.slice(currentIndex, currentIndex + imagesPerPage).map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`Product Image ${index + 1}`}
                    borderRadius="md"
                    objectFit="cover"
                    maxW="150px"
                    maxH="150px"
                    w="100%"
                    h="auto"
                  />
                ))}
              </Grid>
            )}

            {/* Butoane de navigare imagini */}
            {product.images?.length > imagesPerPage && (
              <Flex justify="space-between" mt={4}>
                <Button
                  onClick={() => setCurrentIndex((prev) => Math.max(prev - imagesPerPage, 0))}
                  disabled={currentIndex === 0}
                  bg="orange.300"
                >
                  Previous
                </Button>
                <Button
                  onClick={() =>
                    setCurrentIndex((prev) => Math.min(prev + imagesPerPage, product.images.length - imagesPerPage))
                  }
                  disabled={currentIndex >= product.images.length - imagesPerPage}
                  bg="orange.300"
                >
                  Next
                </Button>
              </Flex>
            )}
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

export default ProductCard;
