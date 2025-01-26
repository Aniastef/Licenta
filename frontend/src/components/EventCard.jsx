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

const EventCard = ({ event }) => {
  if (!event) {
    return (
      <Box>
        <Text>Loading event details...</Text>
      </Box>
    );
  }

  const [selectedImage, setSelectedImage] = useState(""); // Imagine selectată pentru pop-up
  const { isOpen, onOpen, onClose } = useDisclosure(); // Control pentru modal

  const handleImageClick = (image) => {
    setSelectedImage(image);
    onOpen();
  };

  return (
    <Box mt={8}>
      {/* Titlu și status */}
      <Flex justifyContent="space-between" alignItems="center">
        <Text mx={5} fontSize="lg" color="gray.500">
          {event.status || "Upcoming Event"}
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
          src={event.coverImage || "https://via.placeholder.com/800"}
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
          title={`Created by: ${event.user?.firstName || "Unknown"} ${
            event.user?.lastName || ""
          }`}
          minW="200px"
          maxW="300px"
          textAlign="center"
        />
        <RectangleShape
          bgColor="yellow.300"
          title={`Location: ${event.location || "Not specified"}`}
          minW="200px"
          maxW="300px"
          textAlign="center"
        />
        <RectangleShape
          bgColor="orange.300"
          title={`Date: ${new Date(event.date).toLocaleDateString() || "Not specified"}`}
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

      {/* Detalii suplimentare */}
      <Flex mx={8} direction="column">
        <Heading size="md" mt={6}>
          Details
        </Heading>
        <Text mt={3} fontSize="md" color="gray.600">
          {event.description || "No additional details available."}
        </Text>
      </Flex>

      {/* Poze de la eveniment */}
      {event.images && event.images.length > 0 && (
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
                onClick={() => handleImageClick(image)}
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

export default EventCard;
