import {
  Box,
  Flex,
  Text,
  Image,
  Textarea,
  IconButton,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  FormControl,
  FormLabel,
  Select,
  ModalFooter,
} from '@chakra-ui/react';
import { useRecoilValue } from 'recoil';
import { useRef, useState } from 'react';
import userAtom from '../atoms/userAtom';
import sticky from '../assets/sticky.svg';
import editIcon from '../assets/editIcon.svg';
import soundcloudIcon from '../assets/soundcloud.svg';
import spotifyIcon from '../assets/spotify.svg';
import linkedinIcon from '../assets/linkedin.svg';
import instagramIcon from '../assets/instagram.svg';
import facebookIcon from '../assets/facebook.svg';
import webpageIcon from '../assets/webpage.svg';
import emailIcon from '../assets/email.svg';
import phoneIcon from '../assets/phone.svg';
import messageIcon from '../assets/message.svg';
import heartIcon from '../assets/heart.svg';
import ageIcon from '../assets/age.svg';
import professionIcon from '../assets/profession.svg';
import locationIcon from '../assets/location.svg';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.toLocaleDateString('en-US', { day: '2-digit' });
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const year = date.toLocaleDateString('en-US', { year: 'numeric' });
  return { day, month, year };
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const UserHeader = ({ user }) => {
  const currentUser = useRecoilValue(userAtom);
  const [isEditing, setIsEditing] = useState(false);
  const [quote, setQuote] = useState(user.quote || '');
  const textareaRef = useRef(null);
  const CHAR_LIMIT = 400;
  const LINE_LIMIT = 12;
  const LINE_HEIGHT = 18;
  const toast = useToast();
  const latestProducts = user.products?.slice(0, 6);
  const navigate = useNavigate();

  const [activeGalleryFilter, setActiveGalleryFilter] = useState('owning');
  const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure();
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const ownedGalleries = user.galleries?.filter((g) => g.owner === user._id);
  const collaboratedGalleries = user.galleries?.filter((g) => g.owner !== user._id);
  const favoriteGalleries = [];
  const createdEvents = user.events || [];
  const goingEvents = user.eventsMarkedGoing || [];
  const interestedEvents = user.eventsMarkedInterested || [];
  console.log('Created events:', createdEvents);
  console.log('Going events:', goingEvents);
  console.log('Interested events:', interestedEvents);

  const [galleryFilter, setGalleryFilter] = useState('owning');
  const [eventFilter, setEventFilter] = useState('created');
  const filteredGalleries =
    activeGalleryFilter === 'owning'
      ? ownedGalleries
      : activeGalleryFilter === 'collaborating'
        ? collaboratedGalleries
        : favoriteGalleries;

  const handleSubmitReport = async () => {
    if (!reportReason) {
      toast({ title: 'Please select a reason for the report.', status: 'error', duration: 3000 });
      return;
    }
    setIsReporting(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({
          reportedUserId: user._id,
          reason: reportReason,
          details: reportDetails,
        }),
      });

      if (res.ok) {
        toast({ title: 'Report submitted successfully.', description: 'Thank you for your feedback.', status: 'success', duration: 3000 });
        onReportClose(); 
        setReportReason('');
        setReportDetails('');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit report');
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setIsReporting(false);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: 'Quote saved.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const saveQuote = async () => {
    try {
      const response = await fetch('/api/users/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ quote }),
      });

      if (!response.ok) {
        throw new Error('Failed to save quote');
      }

      const data = await response.json();
      toast({
        title: data.message || 'Quote saved successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving quote:', error);
      toast({
        title: 'Error saving quote',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length > CHAR_LIMIT) return;
    const textarea = textareaRef.current;
    if (textarea) {
      const lineCount = Math.round(textarea.scrollHeight / LINE_HEIGHT);
      if (lineCount > LINE_LIMIT) return;
    }
    setQuote(value);
  };

  const contactItems = [
    { icon: messageIcon, label: 'Message me', alwaysVisible: true },
    { icon: phoneIcon, label: user.phone },
    { icon: emailIcon, label: user.email },
    { icon: facebookIcon, label: user.facebook },
    { icon: instagramIcon, label: user.instagram },
    { icon: linkedinIcon, label: user.linkedin },
    { icon: webpageIcon, label: user.webpage },
    { icon: spotifyIcon, label: user.spotify },
    { icon: soundcloudIcon, label: user.soundcloud },
  ];

  const userAge = calculateAge(user.dateOfBirth);

  const aboutMeItemsLeft = [
    { icon: ageIcon, label: userAge ? `${userAge} years old` : null },
    { icon: professionIcon, label: user.profession },
  ];

  const displayLocation = (() => {
    const parts = [];
    if (user.city) {
      parts.push(user.city);
    }
    if (user.country) {
      parts.push(user.country);
    }
    if (parts.length > 0) {
      return parts.join(', ');
    }
    return user.location || 'Not specified';
  })();

  const aboutMeItemsRight = [
    { icon: locationIcon, label: displayLocation },
    { icon: heartIcon, label: user.hobbies },
  ];

  return (
    <Flex direction="column" px={6} py={12} maxW="1300px" mx="auto">
      {}
      <Flex justify="space-between" align="flex-start" gap={15}>
        {}
        <Flex direction="column" align="center" gap={2}>
          <Box
            borderRadius="full"
            w="300px"
            h="300px"
            overflow="hidden"
            bg="gray.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="5xl"
            fontWeight="bold"
            color="gray.600"
          >
            {user.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={`${user.firstName} ${user.lastName}`}
                w="100%"
                h="100%"
                objectFit="cover"
              />
            ) : (
              `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
            )}
          </Box>
        </Flex>

        {}
        <Flex direction="column" flex={1} maxW="450px">
          <Flex align="center" gap={2}>
            <Text fontWeight="bold" fontSize="2xl">
              Hello! I’m <br />
              <Text fontSize="3xl" as="span" fontWeight="bold">
                {user.firstName} {user.lastName}
              </Text>
            </Text>
          </Flex>
          <Text mb="10px" fontSize="sm" lineHeight="1.7" whiteSpace="pre-wrap">
            {user.bio || 'No biography provided.'}
          </Text>
        </Flex>

        <Box
          position="relative"
          w="390px"
          h="310px"
          textAlign="left"
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Image mt={1} src={sticky} w="100%" h="auto" />

          <Box position="absolute" top="45px" px={9} w="100%">
            <Textarea
              ref={textareaRef}
              value={quote}
              onChange={handleChange}
              fontStyle="italic"
              fontSize="sm"
              resize="none"
              rows={12}
              maxW="305px"
              bg="transparent"
              border="none"
              lineHeight="1.2"
              overflow="hidden"
              _focus={{ outline: 'none', boxShadow: 'none' }}
            />
            <Text
              fontSize="xs"
              color={
                quote.length >= CHAR_LIMIT - 20 || quote.split('\n').length >= LINE_LIMIT
                  ? 'red.500'
                  : 'gray.500'
              }
              textAlign="right"
            >
              {quote.length}/{CHAR_LIMIT} characters · {quote.split('\n').length}/{LINE_LIMIT} lines
            </Text>
          </Box>

          <IconButton
            icon={
              isEditing ? (
                <Text fontSize="xs" fontWeight="semibold">
                  Save
                </Text>
              ) : (
                <Image src={editIcon} w="16px" h="16px" />
              )
            }
            position="absolute"
            bottom="20px"
            left="50px"
            size="xs"
            bg="whiteAlpha.700"
            _hover={{ bg: 'whiteAlpha.900' }}
            borderRadius="full"
            onClick={() => {
              if (isEditing) saveQuote();
              else setIsEditing(true);
            }}
            aria-label={isEditing ? 'Save quote' : 'Edit quote'}
            zIndex={2}
          />
        </Box>
      </Flex>

      {}

      <Flex align="flex-start" gap={10}>
        <Flex ml={45} direction="column" align="start" gap={3}>
          <Text fontWeight="bold" fontSize="2xl">
            @{user.username}
          </Text>
          {contactItems.map((item, idx) => {
            const isMessage = item.label === 'Message me';
            const isUrl = typeof item.label === 'string' && item.label.startsWith('http');
            const isEmail = typeof item.label === 'string' && item.label.includes('@');

            const getDisplayLabel = (url, icon) => {
              if (!url || typeof url !== 'string') return '';
              const isSocial = [facebookIcon, instagramIcon, linkedinIcon].includes(icon);

              try {
                const parsedUrl = new URL(url);
                if (isSocial) {
                  const pathParts = parsedUrl.pathname.split('/').filter((p) => p);
                  return (
                    pathParts[pathParts.length - 1] || parsedUrl.hostname.replace(/^www\./, '')
                  );
                }
                return parsedUrl.hostname.replace(/^www\./, '');
              } catch {
                return url;
              }
            };

            const displayLabel = isUrl ? getDisplayLabel(item.label, item.icon) : item.label;

            return isMessage ? (
              <Flex key={idx} align="center" gap={3}>
                <Image src={item.icon} w="18px" h="18px" />
                <Text
                  fontSize="sm"
                  color="blue.500"
                  cursor="pointer"
                  _hover={{ textDecoration: 'underline' }}
                  onClick={() => navigate(`/messages/${user._id}`)}
                >
                  {item.label}
                </Text>
              </Flex>
            ) : item.label ? (
              <Flex key={idx} align="center" gap={3}>
                <Image src={item.icon} w="18px" h="18px" />
                {isEmail ? (
                  <a href={`mailto:${item.label}`}>
                    <Text fontSize="sm" color="blue.500" _hover={{ textDecoration: 'underline' }}>
                      {item.label}
                    </Text>
                  </a>
                ) : isUrl ? (
                  <a href={item.label} target="_blank" rel="noopener noreferrer">
                    <Text fontSize="sm" color="blue.500" _hover={{ textDecoration: 'underline' }}>
                      {displayLabel}
                    </Text>
                  </a>
                ) : (
                  <Text fontSize="sm">{item.label}</Text>
                )}
              </Flex>
            ) : null;
          })}
          {currentUser?._id !== user._id && (
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={onReportOpen}
              >
                Report User
              </Button>
            )}
        </Flex>

        {}
        <Flex direction={'column'} ml={65} textAlign="center">
          <Text textAlign="left" fontWeight="bold" fontSize="lg" mb={2}>
            About me
          </Text>

          <Flex gap={10}>
            {aboutMeItemsLeft.some((item) => item.label) && (
              <Flex gap={2} direction="column">
                {aboutMeItemsLeft.map(
                  (item, idx) =>
                    item.label && (
                      <Flex key={idx} gap={2} align="center">
                        <Image src={item.icon} w="16px" h="16px" />
                        <Text>{item.label}</Text>
                      </Flex>
                    ),
                )}
              </Flex>
            )}

            {aboutMeItemsRight.some((item) => item.label) && (
              <Flex gap={2} direction="column">
                {aboutMeItemsRight.map(
                  (item, idx) =>
                    item.label && (
                      <Flex key={idx} gap={2} align="center">
                        <Image src={item.icon} w="16px" h="16px" />
                        <Text>{item.label}</Text>
                      </Flex>
                    ),
                )}
              </Flex>
            )}
          </Flex>

          <Flex mt={23} gap={20} direction={'column'} textAlign="center">
            <Tabs variant="unstyled" align="center">
              <TabList justifyContent="left" gap={100} flexWrap="wrap">
                <Tab _selected={{ bg: 'orange.400', color: 'white' }}>Artworks</Tab>
                <Tab _selected={{ bg: 'green.400', color: 'white' }}>Galleries</Tab>
                <Tab _selected={{ bg: 'purple.400', color: 'white' }}>Events</Tab>
                <Tab _selected={{ bg: 'blue.400', color: 'white' }}>Articles</Tab>
              </TabList>

              <TabPanels>
                {}
                <TabPanel>
                  <Flex wrap="wrap" gap={7} maxW="1400px" mx="auto" justify="left">
                    {latestProducts && latestProducts.length > 0 ? (
                      latestProducts.map((product) => (
                        <Box
                          _hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
                          transition="all 0.2s"
                          cursor="pointer"
                          onClick={() => navigate(`/products/${product._id}`)}
                          key={product._id}
                          w="200px"
                          borderWidth="1px"
                          borderRadius="md"
                          overflow="hidden"
                        >
                          <Box h="200px" bg="purple.200">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.title}
                                w="100%"
                                h="100%"
                                objectFit="cover"
                              />
                            ) : product.videos?.[0] ? (
                              <Box
                                as="video"
                                src={product.videos[0]}
                                muted
                                loop
                                autoPlay
                                playsInline
                                preload="metadata"
                                w="100%"
                                h="100%"
                                objectFit="cover"
                              />
                            ) : (
                              <Flex
                                align="center"
                                justify="center"
                                w="100%"
                                h="100%"
                                bg="gray.200"
                                color="gray.600"
                                fontWeight="bold"
                                fontSize="lg"
                              >
                                {product.title}
                              </Flex>
                            )}
                          </Box>
                          <Box p={4}>
                            <Text fontWeight="bold" mb={1} isTruncated>
                              {product.title}
                            </Text>
                            {typeof product.price === 'number' ? (
                              <Text>{product.price.toFixed(2)} EUR</Text>
                            ) : (
                              <Text color="gray.500">Not for sale</Text>
                            )}
                            {product.category && (
                              <Text fontSize="xs" mt={1} color="gray.600" isTruncated>
                                Category: {product.category}
                              </Text>
                            )}
                            <Text fontSize="xs" mt={2} isTruncated>
                              {product.tags?.join(', ')}
                            </Text>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Text>No artworks found.</Text>
                    )}
                  </Flex>
                  <Box mt={6} textAlign="center">
                    <Link to={`/${user.username}/all-products`}>
                      <Text
                        fontWeight="bold"
                        color="blue.500"
                        _hover={{ textDecoration: 'underline' }}
                        cursor="pointer"
                      >
                        See all user's artworks →
                      </Text>
                    </Link>
                  </Box>
                </TabPanel>

                {}
                <TabPanel>
                  <Flex direction="column" align="center" gap={4} maxW="800px" mx="auto">
                    <Flex gap={4}>
                      <Button
                        bg={activeGalleryFilter === 'owning' ? 'yellow.400' : 'yellow.200'}
                        onClick={() => setActiveGalleryFilter('owning')}
                        borderRadius="full"
                      >
                        Owning
                      </Button>
                      <Button
                        bg={activeGalleryFilter === 'collaborating' ? 'yellow.400' : 'yellow.200'}
                        onClick={() => setActiveGalleryFilter('collaborating')}
                        borderRadius="full"
                      >
                        Collaborating
                      </Button>
                    </Flex>

                    <Flex direction="column" gap={4} w="500px">
                      {filteredGalleries.length > 0 ? (
                        filteredGalleries.slice(0, 4).map((gallery) => (
                          <Box
                            key={gallery._id}
                            borderWidth="1px"
                            borderRadius="md"
                            overflow="hidden"
                            _hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
                            transition="all 0.2s"
                            cursor="pointer"
                            onClick={() => navigate(`/galleries/${gallery._id}`)}
                          >
                            <Box
                              h="150px"
                              overflow="hidden"
                              bg="blue.400"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              {gallery.coverPhoto ? (
                                <Image
                                  src={gallery.coverPhoto}
                                  alt={gallery.name}
                                  w="400px"
                                  h="100%"
                                  objectFit="cover"
                                />
                              ) : (
                                <Text
                                  fontWeight="bold"
                                  color="white"
                                  fontSize="lg"
                                  textAlign="center"
                                  px={2}
                                >
                                  {gallery.name}
                                </Text>
                              )}
                            </Box>
                            <Box p={4}>
                              <Text fontWeight="bold" fontSize="md" mb={1} isTruncated>
                                {gallery.name}
                              </Text>
                              <Text fontSize="sm" color="gray.600" mb={1} isTruncated>
                                {gallery.category || 'No category specified'}
                              </Text>
                              <Text fontSize="xs" color="gray.500" isTruncated>
                                {Array.isArray(gallery.tags) && gallery.tags.length > 0
                                  ? gallery.tags.join(', ')
                                  : 'No tags'}
                              </Text>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Text>No galleries found.</Text>
                      )}
                    </Flex>

                    <Box mt={4}>
                      <Link to={`/${user.username}/all-galleries`}>
                        <Text
                          fontWeight="bold"
                          color="blue.500"
                          _hover={{ textDecoration: 'underline' }}
                        >
                          See all user's galleries →
                        </Text>
                      </Link>
                    </Box>
                  </Flex>
                </TabPanel>

                {}
                {}
                {}
                <TabPanel>
                  <Flex justifyContent="center" gap={5} mb={5} wrap="wrap">
                    <Button
                      onClick={() => setEventFilter('created')}
                      bg={eventFilter === 'created' ? 'yellow.400' : 'yellow.200'}
                    >
                      Created events
                    </Button>
                    <Button
                      onClick={() => setEventFilter('going')}
                      bg={eventFilter === 'going' ? 'yellow.400' : 'yellow.200'}
                    >
                      Events marked going
                    </Button>
                    <Button
                      onClick={() => setEventFilter('interested')}
                      bg={eventFilter === 'interested' ? 'yellow.400' : 'yellow.200'}
                    >
                      Events marked interested
                    </Button>
                  </Flex>

                  <Flex wrap="wrap" gap={7} maxW="1400px" mx="auto" justify="center">
                    {(eventFilter === 'created'
                      ? createdEvents
                      : eventFilter === 'going'
                        ? goingEvents
                        : interestedEvents
                    )
                      ?.slice(0, 4)
                      .map((event) => {
                        const { day, month, year } = formatDate(event.date);
                        return (
                          <Link to={`/events/${event._id}`} key={event._id}>
                            <Box
                              w="340px"
                              borderWidth="1px"
                              borderRadius="md"
                              overflow="hidden"
                              _hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
                              transition="all 0.2s"
                            >
                              <Box h="150px" overflow="hidden">
                                {event.coverImage ? (
                                  <Image
                                    src={event.coverImage}
                                    alt={event.name}
                                    w="100%"
                                    h="100%"
                                    objectFit="cover"
                                  />
                                ) : (
                                  <Box
                                    w="100%"
                                    h="100%"
                                    bg="orange.300"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <Text
                                      fontWeight="bold"
                                      color="white"
                                      fontSize="lg"
                                      textAlign="center"
                                      px={2}
                                    >
                                      {event.name}
                                    </Text>
                                  </Box>
                                )}
                              </Box>
                              <Flex p={4} gap={3} align="center">
                                <Flex direction="column" align="center" minW="50px">
                                  <Text fontWeight="bold" fontSize="lg">
                                    {day}
                                  </Text>
                                  <Text fontWeight="bold" fontSize="sm">
                                    {month}
                                  </Text>
                                  <Text fontWeight="bold" fontSize="sm">
                                    {year}
                                  </Text>
                                </Flex>
                                <Box textAlign="left" flex="1" overflow="hidden">
                                  <Text fontSize="md" fontWeight="bold" isTruncated>
                                    {event.name || 'Nume eveniment'}
                                  </Text>
                                  {event.category && (
                                    <Text fontSize="sm">Category: {event.category}</Text>
                                  )}
                                  <Text fontSize="sm" isTruncated>
                                    {event.location || 'TBA'}
                                  </Text>
                                  <Text fontSize="xs">{event.time || 'TBA'}</Text>
                                </Box>
                              </Flex>
                            </Box>
                          </Link>
                        );
                      })}
                  </Flex>

                  <Box mt={6} textAlign="center">
                    <Link to={`/${user.username}/all-events`}>
                      <Text
                        fontWeight="bold"
                        color="blue.500"
                        _hover={{ textDecoration: 'underline' }}
                        cursor="pointer"
                      >
                        See all user's events →
                      </Text>
                    </Link>
                  </Box>
                </TabPanel>

                {}
                <TabPanel>
                  <Flex direction="column" align="center" gap={6}>
                    <Flex direction="column" w="100%" maxW="800px" gap={4}>
                      {user.articles?.length > 0 ? (
                        user.articles.map((article) => (
                          <Box
                            key={article._id}
                            p={4}
                            borderWidth="1px"
                            borderRadius="md"
                            shadow="md"
                            _hover={{ boxShadow: 'lg', transform: 'scale(1.01)' }}
                            transition="all 0.2s"
                            cursor="pointer"
                            onClick={() => navigate(`/articles/${article._id}`)}
                            bg="white"
                            px={6}
                            py={12}
                            sx={{
                              backgroundImage: `
    repeating-linear-gradient(to bottom, transparent, transparent 29px, #cbd5e0 30px),
    linear-gradient(to right, #dc2626 1px, transparent 2px)
  `,
                              backgroundSize: '100% 30px, 1px 100%',
                              backgroundPosition: 'left 40px top, left 40px top',
                              backgroundRepeat: 'repeat-y, no-repeat',
                            }}
                          >
                            <Text fontWeight="bold" fontSize="xl" mb={1}>
                              {article.title}
                            </Text>
                            {article.subtitle && (
                              <Text fontSize="md" color="gray.600">
                                {article.subtitle}
                              </Text>
                            )}
                            {article.category && (
                              <Text fontSize="sm" color="teal.600">
                                Category: {article.category}
                              </Text>
                            )}
                            <Text fontSize="sm" color="gray.500" mt={2}>
                              {article.content
                                ? article.content.replace(/<[^>]+>/g, '').slice(0, 50) + '...'
                                : ''}
                            </Text>
                          </Box>
                        ))
                      ) : (
                        <Text>No articles yet.</Text>
                      )}
                    </Flex>

                    <Box mt={4}>
                      <Link to={`/${user.username}/articles`}>
                        <Text
                          fontWeight="bold"
                          color="blue.500"
                          _hover={{ textDecoration: 'underline' }}
                        >
                          See all articles →
                        </Text>
                      </Link>
                    </Box>
                  </Flex>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>
        </Flex>
      </Flex>
      <Modal isOpen={isReportOpen} onClose={onReportClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Report {user.firstName} {user.lastName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Reason</FormLabel>
                <Select
                  placeholder="Select a reason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                >
                  <option value="Spam">Spam</option>
                  <option value="Harassment">Harassment or Hateful Speech</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Impersonation">Impersonation</option>
                  <option value="Other">Other (please specify in details)</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Details (optional)</FormLabel>
                <Textarea
                  placeholder="Provide any additional details here."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onReportClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleSubmitReport}
              isLoading={isReporting}
            >
              Submit Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    
    </Flex>
    
    
  );
};

export default UserHeader;
