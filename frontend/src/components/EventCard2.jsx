import React, { useState } from "react";
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
  useDisclosure,
} from "@chakra-ui/react";
import RectangleShape from "../assets/rectangleShape";
import cover from "../assets/homeCover.jpg";
import pisica from "../assets/pisica.jpg";

const EventPage = () => {
  const [showPictures, setShowPictures] = useState(false); // Control pentru poze
  const [selectedImage, setSelectedImage] = useState(""); // Imagine selectată pentru pop-up
  const { isOpen, onOpen, onClose } = useDisclosure(); // Control pentru modal

  const handleTogglePictures = () => {
    setShowPictures((prev) => !prev);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    onOpen();
  };

  const event = {
    name: "Art Exhibition",
    date: "2025-01-20",
    location: "Downtown Gallery",
    creator: "John Doe",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(20),
    images: [
      pisica,
      pisica,
      pisica,
      pisica,
    ], // Poze pentru eveniment
    coverPhoto: cover,
    status: "Event already held",
  };

  return (
    <Box mt={8}>
      {/* Titlu și status */}
      <Flex justifyContent="space-between" alignItems="center">
        <Text mx={5} fontSize="lg" color="gray.500">
          {event.status}
        </Text>
        <RectangleShape
          bgColor="yellow.300"
          title={event.name}
          minW="500px"
          maxW="500px"
          textAlign="center"
        />
      </Flex>

      {/* Imaginea de copertă */}
      <Box overflow="hidden">
        <Image
          src={event.coverPhoto}
          alt={event.name}
          w="100%"
          h="400px"
          objectFit="cover"
        />
      </Box>

      {/* Detalii despre eveniment */}
      <Flex justify="space-between" align="center">
        <RectangleShape
          bgColor="blue.300"
          title={`Created by: ${event.creator}`}
          minW="200px"
          maxW="300px"
          textAlign="center"
        />
        <RectangleShape
          bgColor="yellow.300"
          title={`Location: ${event.location}`}
          minW="200px"
          maxW="300px"
          textAlign="center"
        />
        <RectangleShape
          bgColor="orange.300"
          title={`Date: ${event.date}`}
          minW="200px"
          maxW="300px"
          textAlign="center"
        />
      </Flex>
       {/* Butoane pentru interes și participare */}
       <Flex mx={5} mt={4} gap={4}>
        <Button
          bg="green.300"
          borderRadius="lg"
          w="150px"
          h="50px"
          onClick={() => alert("Marked as going!")}
        >
          Mark if going
        </Button>
        <Button
          bg="yellow.300"
          borderRadius="lg"
          w="150px"
          h="50px"
          onClick={() => alert("Marked as interested!")}
        >
          Mark if interested
        </Button>
      </Flex>

      <Flex mx={8} direction="column">
        {/* Detalii suplimentare */}
        <Heading size="md" mt={6}>
          Details
        </Heading>

        <Text mt={3} fontSize="md" color="gray.600">
          {event.description}
        </Text>
        </Flex>

      {/* Buton pentru a afișa/ascunde pozele */}
      <Flex justifyContent="right" mt={10} gap={4}>
        <Button
          bg="orange.300"
          fontWeight={"normal"}
          borderRadius="none"
          w="600px"
          h="60px"
          justifyContent="flex-start" // Aliniază textul la stânga

       onClick={handleTogglePictures}
        >
          {showPictures ? "Hide Pictures" : "Show pictures from the event ▼"}
        </Button>
      </Flex>

      {/* Poze de la eveniment */}
      {showPictures && (
        <Box mt={6} mx={8}>
          <Heading size="md" mb={4}>
            Pictures from the event
          </Heading>
          <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            {event.images.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt={`Event Picture ${index + 1}`}
                borderRadius="md"
                cursor="pointer"
                w="100%"
                h="150px"
                objectFit="cover"
                onClick={() => handleImageClick(image)} // Deschide pop-up-ul
              />
            ))}
          </Grid>
        </Box>
      )}

      {/* Modal pentru afișarea imaginii mari */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Image
              src={selectedImage}
              alt="Selected"
              borderRadius="md"
              w="100%"
              h="auto"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EventPage;
