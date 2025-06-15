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
  const [showGallery, setShowGallery] = useState(false); // This state seems unused, consider removing it.
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // NOU: State pentru a controla vizibilitatea secțiunii de atașamente
  const [isAttachmentsVisible, setIsAttachmentsVisible] = useState(false);
  
  const { addToCart } = useCart();

  const isInterested = event?.interestedParticipants?.some((user) => user._id === currentUserId);
  const isGoing = event?.goingParticipants?.some((user) => user._id === currentUserId);
  const isEventOwner = event?.user?._id === currentUserId;

  const mapRef = useRef(null);

  useEffect(() => {
    if (isLoaded && event?.coordinates && mapRef.current) {
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

  const galleryRef = useRef(null);

  const scrollLeft = () => {
    if (galleryRef.current) {
      galleryRef.current.scrollLeft -= 320; // Increased scroll distance
    }
  };

  const scrollRight = () => {
    if (galleryRef.current) {
      galleryRef.current.scrollLeft += 320; // Increased scroll distance
    }
  };
  
  /**
   * ÎMBUNĂTĂȚIT: Funcția de descărcare a fișierelor.
   * Logica de conversie este corectă. Dacă descărcarea eșuează, problema este aproape sigur
   * legată de formatul datelor primite (base64Data).
   * * PENTRU DEBUG: Verifică în consolă dacă `base64Data` are formatul corect:
   * "data:[MIME_TYPE];base64,[...datele...]"
   * Exemplu: "data:application/pdf;base64,JVBERi0xLjQKJ..."
   */
  const handleDownload = (fileName, base64Data) => {
    // Log pentru a inspecta datele primite în consolă
    console.log('Attempting to download:', { fileName, base64Data: base64Data?.substring(0, 50) + '...' });

    if (!base64Data || typeof base64Data !== 'string' || !base64Data.includes(',')) {
      alert('Datele fișierului sunt invalide, lipsesc sau nu au formatul Data URI (data:...;base64,...).');
      return;
    }

    try {
      const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
      const byteString = atob(base64Data.split(',')[1]);
      
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type: mimeString });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Descărcarea a eșuat:', err);
      // Mesaj de eroare mai specific pentru a ajuta la depanare
      alert(`A apărut o eroare la descărcarea fișierului: ${err.message}`);
    }
  };

  if (!event) {
    return (
      <Box>
        <Text>Loading event details...</Text>
      </Box>
    );
  }

  // API Calls (no changes here)
  const markInterested = async () => { /* ... */ };
  const markGoing = async () => { /* ... */ };
  const handleDeleteEvent = async () => { /* ... */ };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    onOpen();
  };

  const openGoogleMaps = () => {
    if (event.coordinates?.lat && event.coordinates?.lng) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${event.coordinates.lat},${event.coordinates.lng}`,
        '_blank'
      );
    } else {
      alert('Unable to open map. Coordinates not available.');
    }
  };

  return (
    <Flex direction={'column'}>
        {/* Header, Cover Image, Info Section... no changes here */}
        {/* ... Codul existent pentru header, imagine, butoane principale, info, etc. ... */}
        
        <Flex justifyContent="center" alignItems="center" px={4} pt={4} position="relative">
            <Text fontWeight="bold" fontSize="2xl" textAlign="center">
                {event.name || 'Event name'}
            </Text>
            <Flex position="absolute" right={4} gap={2}>
                {isEventOwner && (
                <>
                    <Button
                    ml={2}
                    colorScheme="purple"
                    onClick={() => navigate(`/edit/event/${event._id}`)}
                    >
                    Edit Event
                    </Button>
                    <Button ml={2} colorScheme="red" onClick={handleDeleteEvent}>
                    Delete Event
                    </Button>
                </>
                )}
                <Circle size="30px" bg="yellow.400" />
                <Circle size="30px" bg="green.400" />
            </Flex>
        </Flex>

        <Box mt={2} borderRadius="md" overflow="hidden" w="100%" maxW="1200px" mx="auto">
            <Box position="relative" paddingTop="33.125%">
                {' '}
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
                    <Button
                    colorScheme="green"
                    onClick={() =>
                        addToCart({
                        product: {
                            ...event,
                            _id: event._id,
                            itemType: 'Event',
                            quantity: event.capacity || 1,
                        },
                        quantity: 1,
                        })
                    }
                    >
                    Add Ticket to Cart
                    </Button>
                )}
                </Flex>
            )}

            <Box bg="goldenrod" color="black" borderRadius="full" px={6} py={1} fontWeight="bold">
                {event.location || 'Location unknown yet'}
            </Box>
        </Flex>

        <Flex mt={3} justifyContent="space-between" px={4}>
            <Flex maxW="800px" mx={8} direction="column" gap={2}>
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

                <Flex direction={'row'} gap={2} mt={event.description?.length > 300 ? 4 : 2}>
                <Menu>
                    <MenuButton
                    as={Button}
                    >{`Going (${event.goingParticipants?.length || 0})`}</MenuButton>
                    <MenuList>
                    {event.goingParticipants?.length > 0 ? (
                        event.goingParticipants.map((user) => (
                        <MenuItem key={user._id}>
                            <Flex align="center" gap={3}>
                            <Avatar
                                size="sm"
                                src={user.profilePicture || 'https://i.pravatar.cc/150'}
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

                <Menu>
                    <MenuButton
                    as={Button}
                    >{`Interested (${event.interestedParticipants?.length || 0})`}</MenuButton>
                    <MenuList>
                    {event.interestedParticipants?.length > 0 ? (
                        event.interestedParticipants.map((user) => (
                        <MenuItem key={user._id}>
                            <Flex align="center" gap={3}>
                            <Avatar
                                size="sm"
                                src={user.profilePicture || 'https://i.pravatar.cc/150'}
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
            </Flex>

            <Flex direction={'column'} alignItems="center" gap={2}>
                {event.coordinates?.lat && event.coordinates?.lng ? (
                <Box align="center" mt={4} mx={8}>
                    <div
                    ref={mapRef}
                    style={{ width: '400px', height: '300px', borderRadius: '12px' }}
                    ></div>
                    <Button mt={4} colorScheme="green" onClick={openGoogleMaps}>
                    Open in Google Maps
                    </Button>
                </Box>
                ) : null}
            </Flex>
        </Flex>

      {/* MODIFICAT: Secțiunea Galeriei apare acum înaintea atașamentelor */}
      {event.gallery?.length > 0 && (
        <Box mx={8} position="relative">
          <Flex justifyContent="center" alignItems="center" position="relative" mt={8} mb={2}>
            <Box bg="goldenrod" color="black" borderRadius="full" px={6} py={1} fontWeight="bold">
              Event Gallery
            </Box>
          </Flex>

          <Button onClick={scrollLeft} position="absolute" left="0" top="50%" transform="translateY(-50%)" zIndex="1" bg="white" boxShadow="md">
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
              'msOverflowStyle': 'none',
              'scrollbarWidth': 'none',
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
          <Button onClick={scrollRight} position="absolute" right="0" top="50%" transform="translateY(-50%)" zIndex="1" bg="white" boxShadow="md">
            {'>'}
          </Button>
        </Box>
      )}

      {/* MODIFICAT: Secțiunea de Atașamente este acum aici, sub galerie și este colapsabilă */}
      {event.attachments && event.attachments.length > 0 && (
        <Box mx={8} mt={8} textAlign="center">
          {/* Buton pentru a afișa/ascunde atașamentele */}
          <Button 
            onClick={() => setIsAttachmentsVisible(!isAttachmentsVisible)}
            colorScheme="purple"
            mb={4}
          >
            {isAttachmentsVisible ? 'Hide Attachments' : `Show Attachments (${event.attachments.length})`}
          </Button>
          
          {/* Conținutul care se afișează/ascunde */}
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
                    onClick={() => handleDownload(attachment.fileName, attachment.fileData)}
                  />
                </Flex>
              ))}
            </VStack>
          </Collapse>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton bg="whiteAlpha.700" _hover={{ bg: 'white' }} />
          <ModalBody p={0}>
            <Image src={selectedImage} alt="Selected" w="100%" h="auto" />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* This block with `showGallery` seems redundant if the carousel is always visible */}
      {/* If you want a separate grid view, this is fine, otherwise it can be removed. */}
      {showGallery && (
        <Box mx={8}>
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