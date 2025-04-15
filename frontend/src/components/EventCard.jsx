import React, { useEffect, useRef, useState } from "react";
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
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import RectangleShape from "../assets/rectangleShape";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { useParams } from "react-router-dom";
import useLoadGoogleMapsScript from "../hooks/useLoadGoogleMapsScript";

const EventCard = ({ event, currentUserId, fetchEvent }) => {
  const mapRef = useRef(null);
  const { isLoaded, error } = useLoadGoogleMapsScript("AIzaSyAy0C3aQsACcFAPnO-BK1T4nLpSQ9jmkPs");

  const [googleMaps, setGoogleMaps] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isInterested = event?.interestedParticipants?.some((user) => user._id === currentUserId);
  const isGoing = event?.goingParticipants?.some((user) => user._id === currentUserId);
  const isEventOwner = event?.user?._id === currentUserId;

  useEffect(() => {
    if (isLoaded && event?.coordinates && mapRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: event.coordinates.lat, lng: event.coordinates.lng },
        zoom: 12,
      });

      new google.maps.Marker({
        position: { lat: event.coordinates.lat, lng: event.coordinates.lng },
        map,
        title: event.location,
      });
    }
  }, [isLoaded, event]);

  if (!event) {
    return (
      <Box>
        <Text>Loading event details...</Text>
      </Box>
    );
  }

  const markInterested = async () => {
    try {
      const response = await fetch(`/api/events/${event._id}/interested`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
        credentials: "include",
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

  const openGoogleMaps = () => {
    if (event.coordinates && event.coordinates.lat && event.coordinates.lng) {
      const { lat, lng } = event.coordinates;
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(googleMapsUrl, "_blank");
    } else {
      console.error("Coordinates are missing for this event.");
      alert("Unable to open map. Coordinates not available.");
    }
  };
  
  

  return (
    <Box mt={8}>
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

      <Box overflow="hidden">
        <Image
          src={event.coverImage || "https://via.placeholder.com/800"}
          alt={event.name}
          w="100%"
          h="400px"
          objectFit="cover"
        />
      </Box>

      <Flex justify="space-between" align="center">
        <RectangleShape
          bgColor="blue.300"
          title={`Created by: ${event.user?.firstName || "Unknown"} ${event.user?.lastName || "User"}`}
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

        {event.location && (
          <Box mt={4} mx={8}>
            <Heading size="md" mb={2}>Map</Heading>
            <div
              ref={mapRef}
              style={{ width: "100%", height: "300px", borderRadius: "12px" }}
            ></div>
            <Button
              mt={4}
              colorScheme="blue"
              onClick={openGoogleMaps}
            >
              Open in Google Maps
            </Button>
          </Box>
        )}
      </Flex>

      <Flex mx={8} mt={6} direction="column" gap={2}>
        <Heading size="md">Ticket & Info</Heading>
        <Text><strong>Capacity:</strong> {event.capacity || "Unlimited"}</Text>
        <Text><strong>Ticket Type:</strong> {event.ticketType}</Text>
        <Text><strong>Price:</strong> {event.price > 0 ? `${event.price} RON` : "Free"}</Text>
        <Text><strong>Language:</strong> {event.language?.toUpperCase() || "N/A"}</Text>
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

      <Flex mt={4} gap={4}>
        <Menu>
          <MenuButton as={Button}>
            {`Going (${event.goingParticipants?.length || 0})`}
          </MenuButton>
          <MenuList>
            {event.goingParticipants?.length > 0 ? (
              event.goingParticipants.map((user) => (
                <MenuItem key={user._id}>
                  <Flex align="center" gap={3}>
                    <Avatar size="sm" src={user.profilePicture || "https://i.pravatar.cc/150"} />
                    <Text>{`${user.firstName} ${user.lastName}`}</Text>
                  </Flex>
                </MenuItem>
              ))
            ) : (
              <MenuItem>No participants</MenuItem>
            )}
          </MenuList>
        </Menu>

        <Menu>
          <MenuButton as={Button}>
            {`Interested (${event.interestedParticipants?.length || 0})`}
          </MenuButton>
          <MenuList>
            {event.interestedParticipants?.length > 0 ? (
              event.interestedParticipants.map((user) => (
                <MenuItem key={user._id}>
                  <Flex align="center" gap={3}>
                    <Avatar size="sm" src={user.profilePicture || "https://i.pravatar.cc/150"} />
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
    </Box>
  );
};

export default EventCard;
