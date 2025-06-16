import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Avatar, VStack, HStack, IconButton } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';

const testimonials = [
  {
    text: `Art Corner is so much more than just a platform for me. It has to be my biggest project, where I tried to make a place where every artist can share his thoughts freely and let himself be inspired by others. Art is amazing, it's an important part of our world and we all know it!`,
    user: 'stefania',
    name: 'Stefania Istvan',
    avatar: '/avatars/ilef.jpg',
  },
  {
    text: `Joining Art Corner felt like coming home. I connected with artists from different countries, shared my music, and even started collaborations I never imagined possible. It’s not just a platform - it’s a creative family.`,
    user: 'bogdanfona',
    name: 'Bogdan Fona',
    avatar: '/avatars/jimmy.jpg',
  },
];

const TestimonialCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const { text, user, name, country, avatar } = testimonials[index];

  const prevSlide = () => setIndex((index - 1 + testimonials.length) % testimonials.length);
  const nextSlide = () => setIndex((index + 1) % testimonials.length);

  return (
    <VStack spacing={6} py={10} px={4}>
      <Flex align="center" justify="center" gap={10} flexWrap="wrap">
        <Box bg="gray.400" maxW="900px" p={8} borderRadius="60px" textAlign="left">
          <Text fontSize="md" fontStyle="italic" mb={4}>
            {text}
          </Text>

          <Link to={`/profile/${user}`}>
            <Text fontWeight="medium" color="gray.600" textAlign="right">
              {name}
            </Text>
          </Link>
        </Box>

        <Avatar name={name} src={avatar} size="2xl" border="4px solid white" boxShadow="lg" />
      </Flex>

      <HStack>
        <IconButton icon={<ChevronLeftIcon />} onClick={prevSlide} aria-label="Previous" />
        <IconButton icon={<ChevronRightIcon />} onClick={nextSlide} aria-label="Next" />
      </HStack>
    </VStack>
  );
};

export default TestimonialCarousel;
