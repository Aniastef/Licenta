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
  Tag,
  TagLabel,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from "@chakra-ui/react";
import RectangleShape from "../assets/rectangleShape";


const EventCard = ({ event, currentUserId, fetchEvent }) => {
  if (!event) {
    return (
      <Box>
        <Text>Loading event details...</Text>
      </Box>
    );
  }
  console.log("lala: "+ currentUserId);
  console.log("lalsa: "+ event.user?._id);

  const [selectedImage, setSelectedImage] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isInterested = event?.interestedParticipants?.some(
    (user) => user._id === currentUserId
  );
  const isGoing = event?.goingParticipants?.some(
    (user) => user._id === currentUserId
  );

  const isEventOwner = event.user?._id === currentUserId;

  const markInterested = async () => {
    try {
      const response = await fetch(`/api/events/${event._id}/interested`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });

      if (response.ok) {
        fetchEvent(); // Reîncarcă datele evenimentului
      } else {
        const error = await response.json();
        alert(error.error || "Failed to mark as interested");
      }
    } catch (err) {
      console.error("Error marking interested:", err);
    }
  };

  const markGoing = async () => {
    try {
      const response = await fetch(`/api/events/${event._id}/going`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });

      if (response.ok) {
        fetchEvent(); // Reîncarcă datele evenimentului
      } else {
        const error = await response.json();
        alert(error.error || "Failed to mark as going");
      }
    } catch (err) {
      console.error("Error marking going:", err);
    }
  };

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
      <Flex justify="space-between" align="center" >
        <RectangleShape
          bgColor="blue.300"
          title={`Created by: ${event.user?.firstName || "Unknown"} ${
            event.user?.lastName || "User"
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
          title={`Date: ${
            new Date(event.date).toLocaleDateString() || "Not specified"
          }`}
          minW="200px"
          maxW="300px"
          textAlign="center"
        />
      </Flex>

      {/* Butoane pentru interes și participare */}
      {!isEventOwner && (
        <Flex mt={4} gap={4}>
        <Button bg={isGoing ? "gray.400" : "green.300"} onClick={markGoing}>
          {isGoing ? "Unmark Going" : "Mark if Going"}
        </Button>
        <Button bg={isInterested ? "gray.400" : "yellow.300"} onClick={markInterested}>
          {isInterested ? "Unmark Interested" : "Mark if Interested"}
        </Button>
      </Flex>
      )}

{/* Dropdown-uri pentru participanți */}
<Flex mt={4} gap={4}>
  {/* Dropdown pentru Going */}
  <Menu>
    <MenuButton as={Button}>
      {`Going (${event.goingParticipants?.length || 0})`}
    </MenuButton>
    <MenuList>
      {event.goingParticipants?.length > 0 ? (
        event.goingParticipants.map((user) => (
          <MenuItem key={user._id}>
            <Flex align="center" gap={3}>
              <Avatar
                size="sm"
                src={user.profilePic || "https://via.placeholder.com/150"}
                name={`${user.firstName} ${user.lastName}`}
              />
              <Text>{`${user.firstName} ${user.lastName}`}</Text>
            </Flex>
          </MenuItem>
        ))
      ) : (
        <MenuItem>No participants</MenuItem>
      )}
    </MenuList>
  </Menu>

  {/* Dropdown pentru Interested */}
  <Menu>
    <MenuButton as={Button} >
      {`Interested (${event.interestedParticipants?.length || 0})`}
    </MenuButton>
    <MenuList>
      {event.interestedParticipants?.length > 0 ? (
        event.interestedParticipants.map((user) => (
          <MenuItem key={user._id}>
            <Flex align="center" gap={3}>
              <Avatar
                size="sm"
                src={user.profilePic || "https://via.placeholder.com/150"}
                name={`${user.firstName} ${user.lastName}`}
              />
              <Text>{`${user.firstName} ${user.lastName}`}</Text>
            </Flex>
          </MenuItem>
        ))
      ) : (
        <MenuItem>No participants</MenuItem>
      )}
    </MenuList>
  </Menu>
</Flex>
      {/* Tag-uri ale evenimentului */}
      <Box mx={8} mt={6}>
        <Heading size="md" mb={4}>
          Tags
        </Heading>
        <Flex wrap="wrap" gap={2}>
          {event.tags && event.tags.length > 0 ? (
            event.tags.map((tag, index) => (
              <Tag
                key={index}
                size="md"
                borderRadius="full"
                variant="solid"
                bg="yellow.500"
                color="white"
              >
                <TagLabel>{tag}</TagLabel>
              </Tag>
            ))
          ) : (
            <Text color="gray.500">No tags available for this event.</Text>
          )}
        </Flex>
      </Box>

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
