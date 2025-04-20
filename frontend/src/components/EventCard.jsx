import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Heading,
  Flex,
  Button,
  Text,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  ModalCloseButton,
  SimpleGrid,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import RectangleShape from "../assets/rectangleShape";
import useLoadGoogleMapsScript from "../hooks/useLoadGoogleMapsScript";

const EventCard = ({ event, currentUserId, fetchEvent }) => {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const { isLoaded } = useLoadGoogleMapsScript("YOUR_API_KEY");
  const [selectedImage, setSelectedImage] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showGallery, setShowGallery] = useState(false);

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

  // const handleDownload = (fileName, base64Data) => {
  //   if (!base64Data || typeof base64Data !== "string" || !base64Data.includes(",")) {
  //     alert("Invalid or missing file data.");
  //     return;
  //   }

  //   try {
  //     const byteString = atob(base64Data.split(",")[1]);
  //     const mimeString = base64Data.split(",")[0].split(":")[1].split(";")[0];
  //     const ab = new ArrayBuffer(byteString.length);
  //     const ia = new Uint8Array(ab);
  //     for (let i = 0; i < byteString.length; i++) {
  //       ia[i] = byteString.charCodeAt(i);
  //     }
  //     const blob = new Blob([ab], { type: mimeString });
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = fileName;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     window.URL.revokeObjectURL(url);
  //   } catch (err) {
  //     console.error("Download failed:", err);
  //     alert("Error downloading file.");
  //   }
  // };

  if (!event) {
    return <Box><Text>Loading event details...</Text></Box>;
  }

  const markInterested = async () => {
    try {
      const response = await fetch(`/api/events/${event._id}/interested`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: currentUserId }),
      });
      if (response.ok) fetchEvent();
      else alert((await response.json()).error || "Failed to mark as interested");
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
      if (response.ok) fetchEvent();
      else alert((await response.json()).error || "Failed to mark as going");
    } catch (err) {
      console.error("Error marking going:", err);
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    onOpen();
  };

  const openGoogleMaps = () => {
    if (event.coordinates?.lat && event.coordinates?.lng) {
      window.open(`https://www.google.com/maps?q=${event.coordinates.lat},${event.coordinates.lng}`, "_blank");
    } else {
      alert("Unable to open map. Coordinates not available.");
    }
  };

  return (
    <Box mt={8}>
      <Flex justifyContent="space-between" alignItems="center">
        <Text mx={5} fontSize="lg" color="gray.500">{event.status || "Upcoming Event"}</Text>
        <RectangleShape bgColor="yellow.300" title={event.name} minW="500px" maxW="500px" textAlign="center" />
      </Flex>

      <Box overflow="hidden">
        <Image src={event.coverImage || "https://via.placeholder.com/800"} alt={event.name} w="100%" h="400px" objectFit="cover" />
      </Box>
      

      <Flex justify="space-between" align="center">
        <RectangleShape bgColor="blue.300" title={`Created by: ${event.user?.firstName || "Unknown"} ${event.user?.lastName || "User"}`} minW="200px" maxW="300px" textAlign="center" />
        <RectangleShape bgColor="yellow.300" title={`Location: ${event.location || "Not specified"}`} minW="200px" maxW="300px" textAlign="center" />
      </Flex>

      {event.coordinates?.lat && event.coordinates?.lng && (
        <Box mt={4} mx={8}>
          <Heading size="md" mb={2}>Map</Heading>
          <div ref={mapRef} style={{ width: "100%", height: "300px", borderRadius: "12px" }}></div>
          <Button mt={4} colorScheme="blue" onClick={openGoogleMaps}>Open in Google Maps</Button>
        </Box>
      )}

      <Flex mx={8} mt={6} direction="column" gap={2}>
        <Heading size="md">Ticket & Info</Heading>
        <Text><strong>Capacity:</strong> {event.capacity || "Unlimited"}</Text>
        <Text><strong>Ticket Type:</strong> {event.ticketType}</Text>
        <Text><strong>Price:</strong> {event.price > 0 ? `${event.price} RON` : "Free"}</Text>
        <Text><strong>Language:</strong> {event.language?.toUpperCase() || "N/A"}</Text>
      </Flex>
      <Box mt={4} mx={8}>
  <Flex gap={4} align="center">
  <Text fontWeight="semibold" fontSize="md">
  📅 {new Date(event.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  })}{" "}
  {event.time && (
    <>
      <span>🕒 {event.time}</span>
    </>
  )}
</Text>

  </Flex>
</Box>
      {Array.isArray(event.attachments) && event.attachments.length > 0 && (
        <Box mx={8} mt={6}>
          <Heading size="md" mb={2}>Attachments</Heading>
          {event.attachments.map((att, index) => (
            <Text key={index}>
              <Button
                variant="link"
                color="blue.500"
                onClick={() => window.open(att.fileUrl, "_blank")}
                >
                {att.fileName}
              </Button>
            </Text>
          ))}
        </Box>
      )}

      {event.gallery?.length > 0 && (
        <Flex mt={4} mx={8}>
          <Button onClick={() => setShowGallery(!showGallery)}>
            {showGallery ? "Hide Gallery" : "Show Gallery"}
          </Button>
        </Flex>
      )}

      {!isEventOwner && (
        <Flex mt={4} gap={4}>
          <Button bg={isGoing ? "gray.400" : "green.300"} onClick={markGoing}>{isGoing ? "Unmark Going" : "Mark if Going"}</Button>
          <Button bg={isInterested ? "gray.400" : "yellow.300"} onClick={markInterested}>{isInterested ? "Unmark Interested" : "Mark if Interested"}</Button>
        </Flex>
      )}

      {isEventOwner && (
        <Flex mt={4} mx={8}>
          <Button colorScheme="blue" onClick={() => navigate(`/events/${event._id}/edit`)}>Edit Event</Button>
        </Flex>
      )}

      <Flex mt={4} gap={4}>
        <Menu>
          <MenuButton as={Button}>{`Going (${event.goingParticipants?.length || 0})`}</MenuButton>
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
          <MenuButton as={Button}>{`Interested (${event.interestedParticipants?.length || 0})`}</MenuButton>
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

        <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalBody p={0}>
              <Image src={selectedImage} alt="Selected" w="100%" h="auto" />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Flex>

      {showGallery && (
        <Box mt={4} mx={8}>
          <SimpleGrid columns={[1, 2, 3]} spacing={4}>
            {event.gallery.map((imgUrl, idx) => (
              <Image
                key={idx}
                src={imgUrl}
                alt={`Gallery image ${idx + 1}`}
                borderRadius="md"
                objectFit="cover"
                w="100%"
                h="200px"
                cursor="pointer"
                onClick={() => handleImageClick(imgUrl)}
              />
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
};

export default EventCard;