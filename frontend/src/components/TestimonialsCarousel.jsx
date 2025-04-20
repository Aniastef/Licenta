import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Avatar,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";

const testimonials = [
  {
    text: `It was the right thing at the right time! I was looking forward to that week since the beginning of the year with both fear and excitement. I knew deep inside that I'll be having the time of my life in ISWinT, and my gut feelings are never wrong.`,
    user: "ilef.t",
    name: "Ilef Toukebri",
    avatar: "/avatars/ilef.jpg",
  },
  {
    text: `Being part of ISWinT was an incredible adventure! I made unforgettable memories, formed priceless friendships, and met wonderful people. Every moment was filled with joy and excitement, creating bonds that will last a lifetime.`,
    user: "jimmyz",
    name: "Jimmy Mok Zheng",
    avatar: "/avatars/jimmy.jpg",
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
        <Box
          bg="gray.400"
          maxW="900px"
          p={8}
          borderRadius="60px"
          textAlign="left"
        >
          <Text fontSize="md" fontStyle="italic" mb={4}>
            {text}
          </Text>

          <Link to={`/profile/${user}`}>
            <Text fontWeight="medium" color="gray.600" textAlign="right">
              {name}
            </Text>
          </Link>
        </Box>

        <Avatar
          name={name}
          src={avatar}
          size="2xl"
          border="4px solid white"
          boxShadow="lg"
        />
      </Flex>

      <HStack >
        <IconButton icon={<ChevronLeftIcon />} onClick={prevSlide} aria-label="Previous" />
        <IconButton icon={<ChevronRightIcon />} onClick={nextSlide} aria-label="Next" />
      </HStack>
    </VStack>
  );
};

export default TestimonialCarousel;
