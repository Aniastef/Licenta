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
  Circle,
  Collapse,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import RectangleShape from "../assets/rectangleShape";
import useLoadGoogleMapsScript from "../hooks/useLoadGoogleMapsScript";
import { Carousel } from "react-responsive-carousel";

const EventCard = ({ event, currentUserId, fetchEvent }) => {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const { isLoaded } = useLoadGoogleMapsScript("YOUR_API_KEY");
  const [selectedImage, setSelectedImage] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showGallery, setShowGallery] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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
  }, [isLoaded, event]);const galleryRef = useRef(null);

  const scrollLeft = () => {
    if (galleryRef.current) {
      galleryRef.current.scrollLeft -= 200;
    }
  };
  
  const scrollRight = () => {
    if (galleryRef.current) {
      galleryRef.current.scrollLeft += 200;
    }
  };
  

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
    <Flex  direction={"column"} >
      <Flex justifyContent="center" alignItems="center" px={4} pt={4} position="relative">
  <Text fontWeight="bold" fontSize="2xl" textAlign="center">
    {event.name || "Event name"}
  </Text>
  <Flex position="absolute" right={4} gap={2}>
    <Circle size="30px" bg="yellow.400" />
    <Circle size="30px" bg="green.400" />
  </Flex>
</Flex>



      <Box  mt={2} borderRadius="md" overflow="hidden" display="flex" justifyContent="center">
      <Image
          src={event.coverImage || "https://via.placeholder.com/800"}
          alt="Event Cover"
          objectFit="cover"
          borderRadius="md"
          w="80%"
          h="450px"
        />
      </Box>

      <Flex justifyContent="space-between" mt={3}  px={4}>
      <Box bg="goldenrod" color="black" borderRadius="full" px={6} py={1} fontWeight="bold">
      {new Date(event.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}   
  </Box>
  {isEventOwner && (
        <Flex gap={4}>
          <Button bg={isGoing ? "gray.400" : "green.300"} onClick={markGoing}>{isGoing ? "Unmark Going" : "Mark if Going"}</Button>
          <Button bg={isInterested ? "gray.400" : "yellow.300"} onClick={markInterested}>{isInterested ? "Unmark Interested" : "Mark if Interested"}</Button>
        </Flex>
      )}
  <Box bg="goldenrod" color="black" borderRadius="full" px={6} py={1} fontWeight="bold">
    {event.location || "Location unknown yet"}
        </Box>
      </Flex>

      <Flex mt={3} justifyContent="space-between" px={4}>
      <Flex maxW="800px" mx={8} direction="column" gap={2}>
        <Text><strong>Info</strong></Text>
        <Text><strong>Capacity:</strong> {event.capacity || "Unlimited"}</Text>
        <Text><strong>Ticket Type:</strong> {event.ticketType}</Text>
        <Text><strong>Price:</strong> {event.price > 0 ? `${event.price} RON` : "Free"}</Text>
        <Text><strong>Language:</strong> {event.language?.toUpperCase() || "N/A"}</Text>
        {event.description && (
  <>
    {event.description.length > 300 ? (
      <>
        <Collapse startingHeight={100} in={isDescriptionExpanded}>
          <Text whiteSpace="pre-wrap">{event.description}</Text>
        </Collapse>
        <Button
          variant="link"
          colorScheme="blue"
          mt={2}
          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
        >
          {isDescriptionExpanded ? "see less" : "see more"}
        </Button>
      </>
    ) : (
      <Text whiteSpace="pre-wrap">{event.description}</Text>
    )}
  </>
)}
<Flex direction={"row"} gap={2} mt={event.description?.length > 300 ? 4 : 2}>

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
  </Flex>
      </Flex>

      <Flex direction={"column"} alignItems="center" gap={2}>

  {event.coordinates?.lat && event.coordinates?.lng ? (
    <Box align="center" mt={4} mx={8}>
      <div ref={mapRef} style={{ width: "400px", height: "300px", borderRadius: "12px" }}></div>
      <Button mt={4} colorScheme="green" onClick={openGoogleMaps}>Open in Google Maps</Button>
    </Box>
  ) : null}
</Flex>

        

      </Flex>

      {event.gallery?.length > 0 && (
        <Box mx={8} position="relative">
<Flex justifyContent="center" alignItems="center" position="relative" mt={8} mb={2}>
<Flex position="absolute" left={0} gap={2}>
    <Circle size="30px" bg="yellow.400" />
    <Circle size="30px" bg="green.400" />
  </Flex>
<Box bg="goldenrod" color="black" borderRadius="full" px={6} py={1} fontWeight="bold">
        Event Gallery
      </Box>
      <Flex position="absolute" right={0} gap={2}>
    <Circle size="30px" bg="yellow.400" />
    <Circle size="30px" bg="green.400" />
  </Flex>
</Flex>


          <Button onClick={scrollLeft} position="absolute" left="0" top="50%" transform="translateY(-50%)" zIndex="1" bg="white" boxShadow="md">{"<"}</Button>
          <Flex id="gallery-carousel" overflowX="scroll" scrollBehavior="smooth" gap={4} py={4} css={{ '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {event.gallery.map((imgUrl, idx) => (
              <Image key={idx} src={imgUrl} alt={`Gallery image ${idx + 1}`} borderRadius="md" objectFit="cover" h="300px" minW="300px" cursor="pointer" onClick={() => handleImageClick(imgUrl)} />
            ))}
          </Flex>
          <Button onClick={scrollRight} position="absolute" right="0" top="50%" transform="translateY(-50%)" zIndex="1" bg="white" boxShadow="md">{">"}</Button>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={0}>
            <Image src={selectedImage} alt="Selected" w="100%" h="auto" />
          </ModalBody>
        </ModalContent>
      </Modal>
      

      {showGallery && (
        <Box  mx={8}>
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

      
      
      </Flex>
  );
};

export default EventCard;