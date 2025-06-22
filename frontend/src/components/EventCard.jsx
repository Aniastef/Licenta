import React, { useEffect, useRef, useState } from 'react';
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
  VStack,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import useLoadGoogleMapsScript from '../hooks/useLoadGoogleMapsScript';
import { useCart } from '../components/CartContext';
import { DownloadIcon } from '@chakra-ui/icons';

const EventCard = ({ event, currentUserId, fetchEvent }) => {
  const navigate = useNavigate();
  const { isLoaded } = useLoadGoogleMapsScript('YOUR_API_KEY');
  const [selectedImage, setSelectedImage] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isAttachmentsVisible, setIsAttachmentsVisible] = useState(false);
  const { addToCart } = useCart();
  const toast = useToast();

  const isInterested = event?.interestedParticipants?.some((user) => user._id === currentUserId);
  const isGoing = event?.goingParticipants?.some((user) => user._id === currentUserId);
  const isEventOwner = event?.user?._id === currentUserId;

  const mapRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    if (isLoaded && event?.coordinates?.lat && event?.coordinates?.lng && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: event.coordinates.lat, lng: event.coordinates.lng },
        zoom: 12,
      });

      new window.google.maps.Marker({
        position: { lat: event.coordinates.lat, lng: event.coordinates.lng },
        map,
        title: event.location,
      });
    }
  }, [isLoaded, event]);

  const scrollLeft = () => {
    if (galleryRef.current) {
      galleryRef.current.scrollLeft -= 320;
    }
  };

  const scrollRight = () => {
    if (galleryRef.current) {
      galleryRef.current.scrollLeft += 320;
    }
  };

  const handleDownload = (fileName, fileUrl) => {
    if (!fileUrl || typeof fileUrl !== 'string') {
      alert('URL-ul is invalid or missing.');
      return;
    }
    try {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Download failed:', err);
      alert(`Error downloading the file: ${err.message}`);
    }
  };

  if (!event) {
    return (
      <Box p={5} textAlign="center">
        <Text>Loading event details...</Text>
      </Box>
    );
  }

  const markInterested = async () => {
    try {
      const response = await fetch(`/api/events/${event._id}/interested`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: currentUserId }),
      });
      if (response.ok) fetchEvent();
      else alert((await response.json()).error || 'Failed to mark as interested');
    } catch (err) {
      console.error('Error marking interested:', err);
    }
  };

  const markGoing = async () => {
    try {
      const response = await fetch(`/api/events/${event._id}/going`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: currentUserId }),
      });
      if (response.ok) fetchEvent();
      else alert((await response.json()).error || 'Failed to mark as going');
    } catch (err) {
      console.error('Error marking going:', err);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/events/${event._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        alert('Event deleted successfully');
        navigate('/events');
      } else {
        alert(data.error || 'Failed to delete event');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('An error occurred while deleting.');
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    onOpen();
  };

  const openGoogleMaps = () => {
    if (event.coordinates?.lat && event.coordinates?.lng) {
      window.open(
        `https://www.google.com/maps?q=${event.coordinates.lat},${event.coordinates.lng}`,
        '_blank',
      );
    } else {
      alert('Unable to open map. Coordinates not available.');
    }
  };

  const handleAddToCart = () => {
    addToCart({
      product: {
        ...event,
        _id: event._id,
        itemType: 'Event',
        quantity: event.capacity || 1,
      },
      quantity: 1,
    });

    toast({
      title: 'Ticket Added!',
      description: `A ticket for "${event.name}" has been added to your cart.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });
  };

  return (
    <Flex direction={'column'}>
      <Flex justifyContent="center" alignItems="center" px={4} pt={4} position="relative">
        <Text fontWeight="bold" fontSize="2xl" textAlign="center">
          {event.name || 'Event name'}
        </Text>
        <Flex position="absolute" right={4} gap={2}>
          {isEventOwner && (
            <>
              <Button colorScheme="purple" onClick={() => navigate(`/edit/event/${event._id}`)}>
                Edit Event
              </Button>
              <Button colorScheme="red" onClick={handleDeleteEvent}>
                Delete Event
              </Button>
            </>
          )}
        </Flex>
      </Flex>

      <Box mt={2} borderRadius="md" overflow="hidden" w="100%" maxW="1200px" mx="auto">
        <Box position="relative" paddingTop="33.125%">
          <Image
            src={event.coverImage}
            alt="Event Cover"
            objectFit="cover"
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            borderRadius="md"
          />
        </Box>
      </Box>

      <Flex justifyContent="space-between" mt={3} px={4}>
        <Box bg="goldenrod" color="black" borderRadius="full" px={6} py={1} fontWeight="bold">
          {new Date(event.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </Box>
        {currentUserId && !isEventOwner && (
          <Flex gap={4}>
            <Button bg={isGoing ? 'gray.400' : 'red.300'} onClick={markGoing}>
              {isGoing ? 'Unmark Going' : 'Mark if Going'}
            </Button>
            <Button bg={isInterested ? 'gray.400' : 'yellow.300'} onClick={markInterested}>
              {isInterested ? 'Unmark Interested' : 'Mark if Interested'}
            </Button>
            {event.ticketType?.toLowerCase() === 'paid' && (
              <Button colorScheme="green" onClick={handleAddToCart}>
                Add Ticket to Cart
              </Button>
            )}
          </Flex>
        )}
        <Box bg="goldenrod" color="black" borderRadius="full" px={6} py={1} fontWeight="bold">
          {event.location || 'Location unknown'}
        </Box>
      </Flex>

      <Flex mt={3} justifyContent="space-between" px={4} direction={{ base: 'column', lg: 'row' }}>
        <Flex maxW="800px" mx={{ base: 'auto', lg: 8 }} direction="column" gap={2} flex="2">
          <Text>
            <strong>Info</strong>
          </Text>
          <Text>
            <strong>Category:</strong> {event.category || 'Universal'}
          </Text>
          <Text>
            <strong>Capacity:</strong> {event.capacity || 'Unlimited'}
          </Text>
          <Text>
            <strong>Ticket Type:</strong> {event.ticketType}
          </Text>
          <Text>
            <strong>Price:</strong> {event.price > 0 ? `${event.price} EUR` : 'Free'}
          </Text>
          <Text>
            <strong>Language:</strong> {event.language?.toUpperCase() || 'N/A'}
          </Text>
          <Text>
            <strong>Created by:</strong>{' '}
            {event.user ? (
              <Text
                as="span"
                color="blue.500"
                cursor="pointer"
                onClick={() => navigate(`/profile/${event.user.username}`)}
                _hover={{ textDecoration: 'underline' }}
              >
                {event.user.firstName} {event.user.lastName}
              </Text>
            ) : (
              'N/A'
            )}
          </Text>

          {event.description && (
            <>
              {event.description.length > 300 ? (
                <>
                  <Collapse startingHeight={100} in={isDescriptionExpanded}>
                    <Box dangerouslySetInnerHTML={{ __html: event.description }} />
                  </Collapse>
                  <Button
                    variant="link"
                    colorScheme="blue"
                    mt={2}
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  >
                    {isDescriptionExpanded ? 'see less' : 'see more'}
                  </Button>
                </>
              ) : (
                <Box dangerouslySetInnerHTML={{ __html: event.description }} />
              )}
            </>
          )}

          <Flex direction={'row'} gap={2} mt={4}>
            <Menu>
              <MenuButton
                as={Button}
              >{`Going (${event.goingParticipants?.length || 0})`}</MenuButton>
              <MenuList>
                {event.goingParticipants?.length > 0 ? (
                  event.goingParticipants.map((user) => (
                    <MenuItem key={user._id} onClick={() => navigate(`/profile/${user.username}`)}>
                      <Flex align="center" gap={3}>
                        <Avatar size="sm" src={user.profilePicture} />
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
              <MenuButton
                as={Button}
              >{`Interested (${event.interestedParticipants?.length || 0})`}</MenuButton>
              <MenuList>
                {event.interestedParticipants?.length > 0 ? (
                  event.interestedParticipants.map((user) => (
                    <MenuItem key={user._id} onClick={() => navigate(`/profile/${user.username}`)}>
                      <Flex align="center" gap={3}>
                        <Avatar size="sm" src={user.profilePicture} />
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

        {event.coordinates?.lat && event.coordinates?.lng && (
          <Flex direction={'column'} alignItems="center" gap={2} flex="1" mt={{ base: 4, lg: 0 }}>
            <Box align="center" mx={8}>
              <div
                ref={mapRef}
                style={{ width: '400px', height: '300px', borderRadius: '12px' }}
              ></div>
              <Button mt={4} colorScheme="green" onClick={openGoogleMaps}>
                Open in Google Maps
              </Button>
            </Box>
          </Flex>
        )}
      </Flex>

      {event.gallery?.length > 0 && (
        <Box mx={8} position="relative" mt={8}>
          <Flex justifyContent="center" alignItems="center" position="relative" mb={2}>
            <Box bg="goldenrod" color="black" borderRadius="full" px={6} py={1} fontWeight="bold">
              Event Gallery
            </Box>
          </Flex>
          <Button
            onClick={scrollLeft}
            position="absolute"
            left="0"
            top="50%"
            transform="translateY(-50%)"
            zIndex="1"
            bg="white"
            boxShadow="md"
          >
            {'<'}
          </Button>
          <Flex
            ref={galleryRef}
            overflowX="scroll"
            scrollBehavior="smooth"
            gap={4}
            py={4}
            css={{
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            {event.gallery.map((imgUrl, idx) => (
              <Image
                key={idx}
                src={imgUrl}
                alt={`Gallery image ${idx + 1}`}
                borderRadius="md"
                objectFit="cover"
                h="300px"
                minW="300px"
                cursor="pointer"
                onClick={() => handleImageClick(imgUrl)}
              />
            ))}
          </Flex>
          <Button
            onClick={scrollRight}
            position="absolute"
            right="0"
            top="50%"
            transform="translateY(-50%)"
            zIndex="1"
            bg="white"
            boxShadow="md"
          >
            {'>'}
          </Button>
        </Box>
      )}

      {event.attachments && event.attachments.length > 0 && (
        <Box mx={8} mt={8} textAlign="center">
          <Button
            onClick={() => setIsAttachmentsVisible(!isAttachmentsVisible)}
            colorScheme="purple"
            mb={4}
          >
            {isAttachmentsVisible
              ? 'Hide Attachments'
              : `Show Attachments (${event.attachments.length})`}
          </Button>
          <Collapse in={isAttachmentsVisible} animateOpacity>
            <VStack spacing={3} align="stretch" maxW="lg" mx="auto">
              {event.attachments.map((attachment, index) => (
                <Flex
                  key={index}
                  justifyContent="space-between"
                  alignItems="center"
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  _hover={{ bg: 'gray.100' }}
                >
                  <Text fontWeight="medium">{attachment.fileName}</Text>
                  <IconButton
                    icon={<DownloadIcon />}
                    aria-label={`Download ${attachment.fileName}`}
                    colorScheme="purple"
                    variant="ghost"
                    onClick={() => handleDownload(attachment.fileName, attachment.fileUrl)}
                  />
                </Flex>
              ))}
            </VStack>
          </Collapse>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton bg="whiteAlpha.700" _hover={{ bg: 'white' }} />
          <ModalBody p={0}>
            <Image
              src={selectedImage}
              alt="Selected"
              w="100%"
              h="auto"
              maxH="90vh"
              objectFit="contain"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default EventCard;
