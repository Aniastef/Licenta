import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Image,
  Flex,
  Button,
  useToast,
  VStack,
  HStack,
  Input,
  useDisclosure, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Circle
} from "@chakra-ui/react";
import { useCart } from "./CartContext";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link as RouterLink } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import WaveformPlayer from "./WaveformPlayer";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useRef } from "react";


const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const user = useRecoilValue(userAtom);
  const toast = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [visibleImages, setVisibleImages] = useState([0, 1, 2]);
  const [quantity, setQuantity] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isLongDescription = product?.description?.length > 300;
  const {
    isOpen: isImageOpen,
    onOpen: openImage,
    onClose: closeImage,
  } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState(null);
  
  const imagesPerPage = 5; // Only show 3 images at a time
  const scrollRef = useRef();

  const scrollByAmount = (amount) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };
  
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
    addToCart({
      product,
      quantity, // folosește cantitatea aleasă de utilizator
    });
    toast({
      title: "Product added!",
      description: `${product.name} (x${quantity}) was added to your cart.`,
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

  const handleThumbnailChange = (direction) => {
    const newIndex = direction === "up" ? Math.max(currentIndex - 1, 0) : Math.min(currentIndex + 1, product.images.length - imagesPerPage);
    setCurrentIndex(newIndex);

    const newVisibleImages = [];
    for (let i = newIndex; i < newIndex + imagesPerPage; i++) {
      if (product.images[i]) newVisibleImages.push(i);
    }
    setVisibleImages(newVisibleImages);
  };

  if (!product) {
    return <Text>Loading product...</Text>;
  }
  
  return (
<Flex align="center" mt={8} position="relative" maxW="1800px" mx="auto">
{!product ? (
        <Text>Loading product details...</Text>
      ) : (
      <Flex align="flex-start" direction={"column"}>
        <Flex position="absolute" right={4} gap={2}>
            <Circle size="30px" bg="red.500" />
            <Circle size="30px" bg="blue.500" />
          </Flex>
      <Flex  direction="row" align="center" gap={4}>
      <Flex direction="column" align="center" gap={4}>
         <HStack spacing={4} mb={4} align="center" justify="center">
            <Button colorScheme="green" size="md" onClick={() => {/* Handle Switch to Writing */}}>
              Switch to writing
            </Button>
            <Button colorScheme="yellow" size="md" onClick={() => {/* Handle Switch to Video */}}>
              Switch to video
            </Button>
          </HStack>
          <Flex direction="row" align="flex-start" gap={10} pl={4}>
          {/* Left Section - Image Thumbnails */}
          <VStack  height="600px" align="start" spacing={3}>
            {/* Scrollable Thumbnails */}
            <Button
              onClick={() => handleThumbnailChange("up")}
              isDisabled={currentIndex === 0}
              mb={2}
            >
              ↑
            </Button>
            {visibleImages.map((index) => (
              <Image
                key={index}
                src={product.images[index]}
                alt={`Thumbnail Image ${index + 1}`}
                borderRadius="md"
                objectFit="cover"
                maxW="100px"
                maxH="100%px"
                w="100%px"
                h="auto"
                onClick={() => setCurrentIndex(index)} // Update the main image when a thumbnail is clicked
                cursor="pointer"
                border={currentIndex === index ? "2px solid green" : "none"} // Highlight the selected thumbnail
              />
            ))}
            <Button
              onClick={() => handleThumbnailChange("down")}
              isDisabled={currentIndex + imagesPerPage >= product.images.length}
              mt={2}
            >
              ↓
            </Button>
          </VStack>

          {/* Right Section - Main Image */}
          <Flex justify="center" mt={10}>
          <Image
            src={product.images[currentIndex]}
            alt={`Main Product Image`}
            borderRadius="md"
            objectFit="cover"
            maxW="500px"
            maxH="500px"
            w="100%"
            h="auto"
            loading="lazy"
            cursor="pointer"
            onClick={() => {
              setSelectedImage(product.images[currentIndex]);
              openImage();
            }}
          />

     
          </Flex>
        </Flex>
        </Flex>

        {/* partea cu detalii */}
        <Flex direction="column" align="flex-start" justify="flex-start"  ml={10}>
        <HStack justify="space-between" align="center" w="100%">
        <Text
  fontWeight="bold"
  fontSize="2xl"
  maxW="800px"
  whiteSpace="normal"
  wordBreak="break-word"
>
  {product.name}
</Text>
      <Button
        variant="ghost"
        colorScheme={isFavorite ? "red" : "gray"}
        onClick={handleAddToFavorites}
        fontSize="sm"
        leftIcon={<span>{isFavorite ? "❤️" : "🤍"}</span>}
        _hover={{ bg: "transparent", textDecoration: "underline" }}
      >
        {isFavorite ? "remove from favorites" : "add to favorites"}
      </Button>
    </HStack>

        <Text mt={7}>
          Created by {product.user?.firstName || "Unknown"} {product.user?.lastName || "User"}
        </Text>
        <Text mt={2}
          color={product.forSale ? (product.quantity > 0 ? "green.500" : "red.500") : "gray.500"}>
                {!product.forSale
                  ? "Not for sale"
                  : product.quantity > 0
                  ? `Stock: ${product.quantity} left`
                  : "Out of stock"}
        </Text>
        {product.user._id === user._id ? (
              <Button mt={2}
                as={RouterLink}
                to={`/update/product/${product._id}`}
                bg="red.400"
                borderRadius="lg"
                width={300}
                height="50px"
                _hover={{ bg: "red.500" }}
              >
                Edit Product
              </Button>
            ) : (
              <Flex direction="row">
              <Button
                bg="gray.300"
                borderRadius="2xl"
                width={300}
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
              <Button
                size="sm"
                onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                isDisabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                size="sm"
                width="50px"
                textAlign="center"
                isDisabled={!product.forSale || product.quantity === 0}
              />
              <Button
                size="sm"
                onClick={() => setQuantity((prev) => Math.min(prev + 1, product.quantity))}
                isDisabled={quantity >= product.quantity}
              >
                +
              </Button>

              </Flex>
            )}
            
            <Box mt={7}>
  <Text fontWeight="bold">Description:</Text>
  <Box mt={2} fontSize="md" color="gray.700">
  <Box
    maxW="500px"
    maxH="500px"
    overflow="hidden"
    textOverflow="ellipsis"
    whiteSpace="pre-wrap"
    wordBreak="break-word"
    dangerouslySetInnerHTML={{ __html: isLongDescription ? product.description.slice(0, 600) + "..." : product.description }}
  />
  {isLongDescription && (
    <Button mt={2} size="sm" colorScheme="blue" variant="link" onClick={onOpen}>
      See full description
    </Button>
  )}
</Box>

</Box>

          </Flex>
      
</Flex>
{product.audios?.length > 0 && (
  <Box maxW="1300px" mx="auto">

    <Flex align="center" gap={2} position="relative">
      {/* Scroll Left */}
      <IconButton
        icon={<ChevronLeftIcon boxSize={6} />}
        onClick={() => scrollByAmount(-400)}
        aria-label="Scroll left"
        bg="white"
        boxShadow="md"
        borderRadius="full"
        _hover={{ bg: "gray.100" }}
      />

      {/* Carusel */}
      <Box
        ref={scrollRef}
        overflowX="auto"
        overflowY="hidden"
        whiteSpace="nowrap"
        flex="1"
        px={4}
        css={{
          "&::-webkit-scrollbar": { height: "6px" },
          "&::-webkit-scrollbar-thumb": { background: "#ccc", borderRadius: "8px" },
        }}
      >
        <HStack spacing={4}>
          {product.audios.map((url, i) => (
            <Box
              key={i}
              minW="300px"
              maxW="300px"
              borderRadius="md"
              p={2}
              flexShrink={0}
            >
              <WaveformPlayer url={url} />
            </Box>
          ))}
        </HStack>
      </Box>

      {/* Scroll Right */}
      <IconButton
        icon={<ChevronRightIcon boxSize={6} />}
        onClick={() => scrollByAmount(400)}
        aria-label="Scroll right"
        bg="white"
        boxShadow="md"
        borderRadius="full"
        _hover={{ bg: "gray.100" }}
      />
    </Flex>
  </Box>
)}





        </Flex>
      )}
      
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Description</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <Box
        fontSize="md"
        color="gray.700"
        whiteSpace="pre-wrap"
        wordBreak="break-word"
        dangerouslySetInnerHTML={{ __html: product?.description || ""}}
      />
    </ModalBody>
  </ModalContent>
</Modal>
<Modal isOpen={isImageOpen} onClose={closeImage} size="4xl" isCentered>
  <ModalOverlay />
  <ModalContent bg="transparent" boxShadow="none">
    <ModalCloseButton color="white" />
    <ModalBody p={0}>
      <Image
        src={selectedImage}
        alt="Zoomed Image"
        w="100%"
        h="auto"
        borderRadius="lg"
        maxH="90vh"
        objectFit="contain"
      />
    </ModalBody>
  </ModalContent>
</Modal>


    </Flex>
  );
};

export default ProductCard;
