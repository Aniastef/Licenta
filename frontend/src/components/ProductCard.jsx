import React, { useState } from "react";
import {
  Box,
  Text,
  Image,
  Flex,
  Button,
  Grid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import RectangleShape from "../assets/rectangleShape";

const ProductCard = ({ product }) => {
  const [currentIndex, setCurrentIndex] = useState(0); // Index pentru navigare
  const { isOpen, onOpen, onClose } = useDisclosure(); // Control pentru Modal
  const [selectedImage, setSelectedImage] = useState(""); // Imagine selectată
  const [showFullDescription, setShowFullDescription] = useState(false); // Control pentru descriere

  const imagesPerPage = 4;
  const totalImages = product.images.length;
  const canGoBack = currentIndex > 0;
  const canGoNext = currentIndex + imagesPerPage < totalImages;

  const handleImageClick = (image) => {
    setSelectedImage(image);
    onOpen();
  };

  const handleToggleDescription = () => {
    setShowFullDescription((prev) => !prev);
  };

  return (
    <Box mt={8} position="relative">
      <Flex direction={"row"} justify="space-between">
        <Flex direction="column" position="relative" height="auto" width="600px">
          <RectangleShape
            bgColor="blue.300"
            title={product.name}
            position="relative"
            minW="600px"
            maxW="600px"
          />
          <Button
            bg="green.200"
            borderRadius="lg"
            width={190}
            height="50px"
            position="absolute"
            right="-20"
            top="10"
          >
            Price: ${product.price}
          </Button>
          <Box ml={5} mt={5} maxW="450px">
            <Text mt={5} fontWeight={"bold"}>
              Created by {product.user.firstName} {product.user.lastName}
            </Text>

            <Box
              mt={4}
              maxHeight={!showFullDescription ? "400px" : "auto"}
              overflow={!showFullDescription ? "hidden" : "visible"}
              position="relative"
            >
              <Text fontSize="lg" color="gray.600">
                {product.description || "No description available."}
              </Text>
              {!showFullDescription && (
                <Box
                  position="absolute"
                  bottom="0"
                  left="0"
                  w="100%"
                  h="50px"
                  bgGradient="linear(to-t, white, rgba(255, 255, 255, 0))"
                />
              )}
            </Box>
            <Button
              size="sm"
              mt={4}
              bg={"yellow.300"}
              onClick={handleToggleDescription}
            >
              {showFullDescription ? "Show Less" : "Show More"}
            </Button>
          </Box>
        </Flex>

        <Flex mt={50} mr={200} direction="column" gap={4}>
          <Flex justify="space-between">
            <Button
              bg="yellow.300"
              borderRadius="lg"
              width={190}
              height="50px"
              onClick={() => alert(`${product.name} has been added to your cart!`)}
            >
              Add to Cart
            </Button>
            <Button
              bg="pink.300"
              borderRadius="lg"
              width={190}
              height="50px"
              onClick={() =>
                alert(`${product.name} has been added to your favorites!`)
              }
            >
              Add to Favorites
            </Button>
          </Flex>

          <Grid templateColumns="repeat(2, 1fr)" gap={4} maxW="800px">
            {product.images
              .slice(currentIndex, currentIndex + imagesPerPage)
              .map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`Product Image ${index + 1}`}
                  borderRadius="md"
                  objectFit="contain"
                  maxW="250px"
                  maxH="250px"
                  w="100%"
                  h="auto"
                  cursor="pointer"
                  onClick={() => handleImageClick(image)}
                />
              ))}
          </Grid>

          <Flex justify="space-between" mt={4}>
            <Button
              onClick={() => setCurrentIndex((prev) => Math.max(prev - imagesPerPage, 0))}
              disabled={!canGoBack}
              bg="orange.300"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentIndex((prev) => Math.min(prev + imagesPerPage, totalImages))}
              disabled={!canGoNext}
              bg="orange.300"
            >
              Next
            </Button>
          </Flex>
        </Flex>

        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalBody>
              <Image src={selectedImage} alt="Selected" borderRadius="md" w="100%" h="auto" />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Flex>
    </Box>
  );
};

export default ProductCard;
