import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Image,
  Text,
  VStack,
  HStack,
  Avatar,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import video1 from '../assets/1.mp4';
import video2 from '../assets/2.mp4';
import video3 from '../assets/3.mp4';
import video4 from '../assets/4.mp4';
import video5 from '../assets/5.mp4';
import TestimonialCarousel from '../components/testimonialsCarousel';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [videoIndex, setVideoIndex] = React.useState(0);
  const videoList = [video1, video2, video3, video4, video5];
  const [topRated, setTopRated] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [randomUsers, setRandomUsers] = useState([]);
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  useEffect(() => {
    const fetchRandomUsers = async () => {
      try {
        const res = await fetch('/api/users/random-users');
        const data = await res.json();
        setRandomUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching random users:', err);
      }
    };

    fetchRandomUsers();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();

        const now = new Date();
        const upcoming = data.events
          .filter((e) => e.date && new Date(e.date) > now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 2);

        setUpcomingEvents(upcoming);
      } catch (err) {
        console.error('Error loading events:', err);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const sorted = data.products
          .filter((p) => p.images && p.images.length > 0)
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 8);
        setTopRated(sorted);
      } catch (err) {
        console.error('Error loading top-rated products:', err);
      }
    };
    fetchTopRated();
  }, []);

  const circularPositions = [
    { top: '8%', left: '50%', transform: 'translate(-50%, -50%)' },
    { top: '22%', left: '78%', transform: 'translate(-50%, -50%)' },
    { top: '72%', left: '78%', transform: 'translate(-50%, -50%)' },
    { top: '92%', left: '50%', transform: 'translate(-50%, -50%)' },
    { top: '72%', left: '22%', transform: 'translate(-50%, -50%)' },
    { top: '22%', left: '22%', transform: 'translate(-50%, -50%)' },
  ];

  return (
    <Box>
      {}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        maxW="1200px"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={12}
        align="center"
        justify="space-between"
        gap={{ base: 10, md: 6 }}
      >
        {}
        {}
        <Box>
          <Box
            position="relative"
            left={{ base: 0, md: '-70px' }}
            w={{ base: '100%', md: '480px' }}
            h={{ base: 'auto', md: '520px' }}
            borderTopLeftRadius="180px"
            borderBottomRightRadius="120px"
            borderBottomLeftRadius="0"
            borderTopRightRadius="0"
            overflow="hidden"
            flexShrink={0}
          >
            <video
              key={videoIndex}
              src={videoList[videoIndex]}
              autoPlay
              muted
              playsInline
              onEnded={() => {
                let next;
                do {
                  next = Math.floor(Math.random() * videoList.length);
                } while (next === videoIndex);
                setVideoIndex(next);
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>

          {}
          <HStack spacing={6} pl={{ base: 2, md: 6 }} mt={4}>
            <Box w="24px" h="24px" bg="#b75c5c" borderRadius="full" />
            <Box w="24px" h="24px" bg="#b48f33" borderRadius="full" />
            <Box w="24px" h="24px" bg="#b48f33" borderRadius="full" />
            <Box w="24px" h="24px" bg="#b48f33" borderRadius="full" />
            <Box w="24px" h="24px" bg="#b48f33" borderRadius="full" />
          </HStack>
        </Box>

        {}
        <VStack align="start" spacing={6} flex="1">
          <Grid templateColumns="repeat(3, 1fr)" gap={4} alignSelf="center">
            {[
              { label: 'Sculpture', color: '#b3a133' },
              { label: 'Crafting', color: '#b3a133' },
              { label: 'Teaching', color: '#b3a133' },
              { label: 'Paintings', color: '#6ac6dc' },
              { label: 'Music', color: '#6ac6dc' },
              { label: 'Poetry', color: '#6ac6dc' },
            ].map(({ label, color }) => (
              <Button
                key={label}
                bg={color}
                color="black"
                fontWeight="semibold"
                borderRadius="full"
                px={6}
                py={2}
                _hover={{ opacity: 0.85 }}
                onClick={() => handleCategoryClick(label)}
              >
                {label}
              </Button>
            ))}
          </Grid>

          <Text fontSize="3xl" fontWeight="bold" textAlign="center" w="full">
            Everyone has a story and <br /> each story is art.
          </Text>

          <Text fontSize="md" color="gray.700" textAlign="left">
            At Art Corner, we believe that every brushstroke, every melody, every sculpture, every
            verse holds a deeper meaning - a story waiting to be told. This platform was born out of
            a simple yet powerful idea: that art, in all its forms, can connect people across
            borders, cultures, and generations. Whether you're a seasoned artist or just beginning
            your journey, Art Corner welcomes you. Here, your voice matters. Share your passion,
            showcase your talent, and explore the works of others who, like you, see the world
            through a creative lens. Our global community is built on mutual inspiration,
            collaboration, and the courage to express what words sometimes cannot. From visual arts
            to music, poetry, teaching, and crafting - we celebrate every story, every medium, and
            every soul behind the art. Join us and be part of a movement that turns creativity into
            connection. Because your story deserves to be seen. Your art deserves to be felt.
          </Text>

          <Button
            as={Link}
            to="/galleries"
            bg="#2f5e56"
            color="white"
            px={8}
            py={4}
            borderRadius="20px"
            _hover={{ bg: '#244b46' }}
            alignSelf="center"
          >
            Explore our many galleries.
          </Button>
        </VStack>
      </Flex>

      {}
      {}
      <Box px={6} py={12} maxW="1100px" mx="auto">
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="2xl" fontWeight="semibold">
            Explore different pieces of art
          </Text>
          <Button
            as={Link}
            to="/products"
            size="sm"
            bg="#8b7c3a"
            color="white"
            borderRadius="20px"
            _hover={{ bg: '#766a31' }}
          >
            See all artworks
          </Button>
        </Flex>

        <Grid
          templateColumns={{
            base: 'repeat(auto-fill, minmax(140px, 1fr))',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          }}
          gap={6}
        >
          {topRated.map((product) => (
            <Box
              key={product._id}
              bg="gray.300"
              borderRadius="xl"
              boxShadow="lg"
              overflow="hidden"
              transition="all 0.2s ease-in-out"
              _hover={{
                transform: 'translateY(-6px)',
                boxShadow: '2xl',
              }}
            >
              <Box position="relative" w="full" pt="100%" overflow="hidden">
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  position="absolute"
                  top="0"
                  left="0"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
              </Box>
              <Box p={4} textAlign="center">
                <Text fontSize="lg" fontWeight={'semibold'} mb={2} noOfLines={1}>
                  {product.title}
                </Text>
                <Button
                  as={Link}
                  to={`/products/${product._id}`}
                  variant="link"
                  color="green.600"
                  fontWeight="semibold"
                  rightIcon={<span>&rarr;</span>}
                >
                  see more
                </Button>
              </Box>
            </Box>
          ))}
        </Grid>
      </Box>

      {}

      <VStack textAlign="center" mb={3}>
        <Box
          py={10}
          px={4}
          bgImage="url('/path/to/background.jpg')"
          bgSize="cover"
          bgPosition="center"
          position="relative"
        >
          <Text textAlign="center" fontWeight="semibold" fontSize="2xl" mb={6}>
            read about different perspectives and moods...
          </Text>

          {}
          <HStack spacing={4} position="absolute" top={4} right={6}>
            <Box boxSize={6} bg="green.600" borderRadius="full" />
            <Box boxSize={6} bg="gray.800" borderRadius="full" />
          </HStack>
          <Button
            as={Link}
            to="/articles"
            size="sm"
            bg="#2f5e56"
            color="white"
            borderRadius="20px"
            _hover={{ bg: '#244b46' }}
          >
            Dive into insightful ARTicles written by our creative community
          </Button>
          <HStack spacing={6} justify="center">
            <TestimonialCarousel />
          </HStack>
        </Box>
      </VStack>

      <Box mb={100} px={6}>
        <Text textAlign="center" fontWeight="semibold" fontSize="2xl" mb={10}>
          express your interest in various amazing events happening around you..
        </Text>

        {upcomingEvents.map((event, index) => (
          <Flex
            key={event._id}
            justify={index % 2 === 0 ? 'flex-start' : 'flex-end'}
            align="center"
            mb={12}
            ml={index % 2 === 0 ? { base: 0, md: '-10' } : 0}
            mr={index % 2 !== 0 ? { base: 0, md: '-10' } : 0}
            cursor="pointer"
            onClick={() => navigate(`/events/${event._id}`)}
            _hover={{ opacity: 0.95 }}
          >
            {index % 2 === 0 && (
              <Box
                bg="gray.400"
                w="60%"
                h="200px"
                border={'1px'}
                borderColor={'gray.500'}
                borderTopRightRadius="100px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="semibold"
                overflow="hidden"
              >
                {event.coverImage ? (
                  <Image src={event.coverImage} objectFit="cover" w="100%" h="100%" />
                ) : (
                  'poza eveniment'
                )}
              </Box>
            )}

            <Box
              bg="gray.300"
              p={4}
              mx={-4}
              boxShadow="md"
              zIndex={1}
              maxW="300px"
              textAlign="left"
            >
              <Text fontWeight="bold">{event.name}</Text>
              <Text fontWeight="semibold">Category: {event.category}</Text>
              <Text fontSize="sm">
                Taking place on {new Date(event.date).toLocaleDateString()}{' '}
                {event.time && (
                  <>
                    <span style={{ marginLeft: 6 }}>🕒</span> {event.time}
                  </>
                )}
              </Text>
              <Text fontSize="sm">{event.location}</Text>
            </Box>

            {index % 2 !== 0 && (
              <Box
                bg="gray.700"
                w="60%"
                h="200px"
                border={'1px'}
                borderColor={'gray.500'}
                borderTopLeftRadius="100px"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="semibold"
                overflow="hidden"
              >
                {event.coverImage ? (
                  <Image src={event.coverImage} objectFit="cover" w="100%" h="100%" />
                ) : (
                  'poza eveniment'
                )}
              </Box>
            )}
          </Flex>
        ))}

        <Flex justify="space-between" align="center" mt={8}>
          <Button
            as={Link}
            to="/events"
            size="sm"
            bg="#8b7c3a"
            color="white"
            borderRadius="20px"
            _hover={{ bg: '#c35b4e' }}
          >
            Explore all the events
          </Button>

          <HStack spacing={3}>
            <Box w="20px" h="20px" bg="#b75c5c" borderRadius="full" />
            <Box w="20px" h="20px" bg="#b48f33" borderRadius="full" />
          </HStack>
        </Flex>
      </Box>

      {}
      <Box mt={20} mb={20} px={10} position="relative" h="500px">
        {}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={1}
          textAlign="center"
        >
          <Text fontSize="xl" fontWeight="medium">
            ...made by different inspiring voices.
          </Text>
        </Box>

        {}
        {randomUsers.slice(0, circularPositions.length).map((user, i) => (
          <VStack
            key={i}
            spacing={0.5}
            position="absolute"
            top={circularPositions[i]?.top}
            left={circularPositions[i]?.left}
            transform={circularPositions[i]?.transform}
          >
            <Box
              as={Link}
              to={`/profile/${user.username}`}
              _hover={{ transform: 'scale(1.05)', transition: '0.2s' }}
            >
              <Avatar
                size="2xl"
                src={user.profilePicture || undefined}
                name={`${user.firstName} ${user.lastName}`}
              />
            </Box>
            <Text fontSize="sm" mt={1}>
              {user.firstName} {user.lastName}
            </Text>
            <Text fontSize="xs" color="gray.600">
              {user.profession || 'Artist'}
            </Text>
          </VStack>
        ))}
      </Box>

      {}
      <Box textAlign="center" mb={20} mt={35}>
        <Text fontWeight="semibold" mb={6} fontSize="xl">
          As a summary, ART CORNER gives you the possibility to
        </Text>

        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
          gap={10}
          justifyItems="center"
          px={{ base: 4, md: 20 }}
        >
          {[
            { text: 'Travel your art through the whole world.', shape: true },
            { text: 'Collaborate with different people.', shape: false },
            { text: 'Share your thoughts.', shape: true },
            { text: 'Make friends that share the same vision as you.', shape: false },
            { text: 'Sell unique pieces of art.', shape: true },
            { text: 'Participate to amazing events.', shape: false },
          ].map(({ text, shape }, idx) => (
            <Box
              key={idx}
              p={4}
              w="100%"
              maxW="240px"
              h="120px"
              bg={shape ? '#2F855A' : 'transparent'}
              color={shape ? 'white' : 'green.700'}
              borderRadius={shape ? '0 60px 0 0' : 'none'}
              border={shape ? 'none' : '2px solid transparent'}
              fontSize="sm"
              display="flex"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              fontWeight={shape ? 'medium' : 'normal'}
            >
              {text}
            </Box>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default HomePage;
