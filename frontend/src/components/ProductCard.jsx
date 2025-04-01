import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Image,
  Flex,
  Button,
  useToast,
  Grid,
  VStack,
} from "@chakra-ui/react";
import RectangleShape from "../assets/rectangleShape";
import { useCart } from "./CartContext";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link as RouterLink } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const user = useRecoilValue(userAtom);
  const toast = useToast();
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

        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setIsFavorite(data.some((favProduct) => favProduct._id === product._id));
        }
      } catch (error) {
        console.error("Error checking favorite:", error);
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
          credentials: "include",
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
      }
    } catch (error) {
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
      {!product ? (
        <Text>Loading product details...</Text>
      ) : (
        <Flex direction="row" justify="space-between">
          <Flex direction="column" position="relative" height="auto" width="600px">
            <RectangleShape
              bgColor="blue.300"
              title={product.name}
              position="relative"
              minW="600px"
              maxW="600px"
            />
            {product.averageRating > 0 && (
            <Text fontSize="lg" fontWeight="semibold" color="yellow.500" ml={2} mt={2}>
              {"★".repeat(Math.round(product.averageRating)) + "☆".repeat(5 - Math.round(product.averageRating))}{" "}
              ({product.averageRating} / 5)
            </Text>
          )}


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
              <Text mt={5} fontWeight="bold">
                Created by {product.user?.firstName || "Unknown"} {product.user?.lastName || "User"}
              </Text>
              <Text fontSize="lg" color="gray.600" mt={4}>
                {product.description || "No description available."}
              </Text>
            </Box>

            {/* Images */}
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

            {/* Videos */}
            {product.videos?.length > 0 && (
              <VStack align="start" mt={6}>
                <Text fontWeight="bold">Videos:</Text>
                {product.videos.map((url, idx) => (
                  <video key={idx} src={url} controls width="300" style={{ borderRadius: "8px" }} />
                ))}
              </VStack>
            )}

            {/* Audios */}
            {product.audios?.length > 0 && (
              <VStack align="start" mt={6}>
                <Text fontWeight="bold">Audio Recordings:</Text>
                {product.audios.map((url, idx) => (
                  <audio key={idx} src={url} controls style={{ width: "300px" }} />
                ))}
              </VStack>
            )}

            {/* Navigation for images */}
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
                    setCurrentIndex((prev) =>
                      Math.min(prev + imagesPerPage, product.images.length - imagesPerPage)
                    )
                  }
                  disabled={currentIndex >= product.images.length - imagesPerPage}
                  bg="orange.300"
                >
                  Next
                </Button>
              </Flex>
            )}
          </Flex>

          {/* Action buttons */}
          <Flex mt={50} mr={100} direction="column" gap={4}>
            {product.user._id === user._id ? (
              <Button
                as={RouterLink}
                to={`/update/product/${product._id}`}
                bg="blue.400"
                borderRadius="lg"
                width={190}
                height="50px"
                _hover={{ bg: "blue.500" }}
              >
                Edit Product
              </Button>
            ) : (
              <Button
                bg="yellow.300"
                borderRadius="lg"
                width={190}
                height="50px"
                onClick={handleAddToCart}
                isDisabled={!product.forSale || product.quantity === 0}
              >
                {!product.forSale
                  ? "Not for Sale"
                  : product.quantity > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </Button>
            )}

            <Button
              bg={isFavorite ? "red.400" : "pink.300"}
              borderRadius="lg"
              width={190}
              height="50px"
              onClick={handleAddToFavorites}
            >
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

export default ProductCard;
