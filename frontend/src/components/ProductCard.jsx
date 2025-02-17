import React, { useState } from "react";
import {
  Box,
  Text,
  Image,
  Flex,
  Button,
  useToast,
} from "@chakra-ui/react";
import RectangleShape from "../assets/rectangleShape";
import { useCart } from "./CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const toast = useToast();

  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!product) {
    return (
      <Box>
        <Text>Loading product details...</Text>
      </Box>
    );
  }

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

  return (
    <Box mt={8} position="relative">
      <Flex direction={"row"} justify="space-between">
        {/* ✅ Informațiile produsului rămân afișate indiferent de stoc */}
        <Flex direction="column" position="relative" height="auto" width="600px">
          <RectangleShape
            bgColor="blue.300"
            title={product.name}
            position="relative"
            minW="600px"
            maxW="600px"
          />
          
          <Flex align="center" mt={4}>
            {/* ✅ Prețul rămâne afișat doar dacă produsul este de vânzare */}
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

            {/* ✅ Mesaj clar pentru stoc și disponibilitate */}
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={product.forSale 
                ? product.quantity > 0 ? "green.500" : "red.500" 
                : "gray.500"}
              ml={5}
            >
              {!product.forSale ? "Not for sale" : product.quantity > 0 ? `Stock: ${product.quantity} left` : "Out of stock"}
            </Text>
          </Flex>

          <Box ml={5} mt={5} maxW="450px">
            <Text mt={5} fontWeight={"bold"}>
              Created by {product.user?.firstName || "Unknown"} {product.user?.lastName || "User"}
            </Text>

            {/* ✅ Descrierea nu dispare dacă produsul este "Out of Stock" sau "Not for Sale" */}
            <Box mt={4} maxHeight={!showFullDescription ? "400px" : "auto"} overflow="hidden">
              <Text fontSize="lg" color="gray.600">
                {product.description || "No description available."}
              </Text>
            </Box>
            <Button size="sm" mt={4} bg={"yellow.300"} onClick={() => setShowFullDescription(!showFullDescription)}>
              {showFullDescription ? "Show Less" : "Show More"}
            </Button>
          </Box>
        </Flex>

        {/* ✅ Butoane rămân active, dar dezactivăm "Add to Cart" dacă produsul nu mai este de vânzare sau nu are stoc */}
        <Flex mt={50} mr={200} direction="column" gap={4}>
          <Flex justify="space-between">
            <Button
              bg="yellow.300"
              borderRadius="lg"
              width={190}
              height="50px"
              onClick={handleAddToCart}
              isDisabled={!product.forSale || product.quantity === 0} // ✅ Dezactivează butonul dacă nu e de vânzare sau nu are stoc
            >
              {!product.forSale ? "Not for Sale" : product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>

            <Button
              bg="pink.300"
              borderRadius="lg"
              width={190}
              height="50px"
              onClick={() => alert(`${product.name} has been added to your favorites!`)}
            >
              Add to Favorites
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

export default ProductCard;
