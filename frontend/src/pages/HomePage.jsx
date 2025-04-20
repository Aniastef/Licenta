import React from "react";
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
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import homeCover from "../assets/homeCover.jpg";
import eventHome from "../assets/eventHome.jpg";
import RectangleShape from "../assets/rectangleShape";
import Carousel from "../components/PhotoCarousel";
import TextOverImage from "../assets/textOverComponent";
import ContactBar from "../components/ContactBar";
import video1 from "../assets/1.mp4";
import video2 from "../assets/2.mp4";
import video3 from "../assets/3.mp4";
import video4 from "../assets/4.mp4";
import video5 from "../assets/5.mp4";
import TestimonialCarousel from "../components/testimonialsCarousel";


const HomePage = () => {
  // State pentru video curent
const [videoIndex, setVideoIndex] = React.useState(0);
const videoList = [video1, video2, video3, video4, video5];

const circularPositions = [
  { top: "8%", left: "50%", transform: "translate(-50%, -50%)" },
  { top: "22%", left: "78%", transform: "translate(-50%, -50%)" },
  { top: "72%", left: "78%", transform: "translate(-50%, -50%)" },
  { top: "92%", left: "50%", transform: "translate(-50%, -50%)" },
  { top: "72%", left: "22%", transform: "translate(-50%, -50%)" },
  { top: "22%", left: "22%", transform: "translate(-50%, -50%)" },
];


  return (
    <Box >

      {/* Intro Section */}
      <Flex
  direction={{ base: "column", md: "row" }}
  maxW="1200px"
  mx="auto"
  px={{ base: 4, md: 8 }}
  py={12}
  align="center"
  justify="space-between"
  gap={{ base: 10, md: 6 }}
>
  {/* Imagine */}
{/* Imagine / video + buline dedesubt */}
<Box>
  <Box
    position="relative"
    left={{ base: 0, md: "-70px" }}
    w={{ base: "100%", md: "480px" }}
    h={{ base: "auto", md: "520px" }}
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
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  </Box>

  {/* Bule decorative - în afara video */}
  <HStack spacing={6} pl={{ base: 2, md: 6 }} mt={4}>
    <Box w="24px" h="24px" bg="#b75c5c" borderRadius="full" />
    <Box w="24px" h="24px" bg="#b48f33" borderRadius="full" />
    <Box w="24px" h="24px" bg="#b48f33" borderRadius="full" />
    <Box w="24px" h="24px" bg="#b48f33" borderRadius="full" />
    <Box w="24px" h="24px" bg="#b48f33" borderRadius="full" />
    
  </HStack>
</Box>





  {/* Conținut */}
  <VStack align="start" spacing={6} flex="1">
    <Grid templateColumns="repeat(3, 1fr)" gap={4} alignSelf="center">
      {[
        { label: "Sculpture", color: "#b3a133" },
        { label: "Crafting", color: "#b3a133" },
        { label: "Teaching", color: "#b3a133" },
        { label: "Paintings", color: "#6ac6dc" },
        { label: "Music", color: "#6ac6dc" },
        { label: "Poetry", color: "#6ac6dc" },
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
        >
          {label}
        </Button>
      ))}
    </Grid>

    <Text fontSize="3xl" fontWeight="bold" textAlign="center" w="full">
      Everyone has a story and <br /> each story is art.
    </Text>

    <Text fontSize="md" color="gray.700" textAlign="left">
      text lung cu chestii       text lung cu chestii interesante text lung cu chestii interesante text lung cu chestii interesante text lung cu chestii interesante text lung cu chestii interesante...
      text lung cu chestii interesante text lung cu chestii interesante text lung cu chestii interesante text lung cu chestii interesante text lung cu chestii interesante...
      interesante text lung      text lung cu chestii interesante text lung cu chestii interesante text lung cu chestii interesante text lung cu chestii interesante text lung cu chestii interesante...
      cu chestii interesant      text lung cu chestii interesante text lung cu chestii interesante text lung cu chestii interesante text lung cu chestii interesante text lung cu chestii interesante...
      e text lung cu chestii interesante text lung cu chestii interesante text lung cu chestii interesante...
    </Text>

    <Button
      bg="#2f5e56"
      color="white"
      px={8}
      py={4}
      borderRadius="20px"
      _hover={{ bg: "#244b46" }}
      alignSelf="center"
    >
      Explore our many galleries.
    </Button>
  </VStack>
</Flex>





      {/* Gallery Preview */}
     {/* Gallery Section – ajustat ca în mockup */}
<Box px={6} py={12} maxW="1100px" mx="auto">
  <Flex justify="space-between" align="center" mb={6}>
    <Text fontSize="2xl" fontWeight="semibold">
      Explore different pieces of art
    </Text>
    <Button
      size="sm"
      bg="#8b7c3a"
      color="white"
      borderRadius="20px"
      _hover={{ bg: "#766a31" }}
    >
      See all products
    </Button>
  </Flex>

  <Grid
    templateColumns={{
      base: "repeat(auto-fill, minmax(140px, 1fr))",
      sm: "repeat(2, 1fr)",
      md: "repeat(4, 1fr)",
    }}
    gap={6}
  >
    {Array.from({ length: 8 }).map((_, i) => (
     <Box
     bg="gray.300" // <-- fundal gri aici
     borderRadius="xl"
     boxShadow="lg"
     overflow="hidden"
     transition="all 0.2s ease-in-out"
     _hover={{
       transform: "translateY(-6px)",
       boxShadow: "2xl",
     }}
   >
     <Image
       src="/link/catre/poza.jpg"
       alt="Product image"
       w="full"
       h="180px"
       objectFit="cover"
     />
     <Box p={4} textAlign="center">
       <Text fontSize="lg"  mb={2}>
         product name
       </Text>
       <Button
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


      {/* Mood Section */}
      <Box
  py={10}
  px={4}
  bgImage="url('/path/to/background.jpg')"
  bgSize="cover"
  bgPosition="center"
  position="relative" // pentru a permite poziționarea absolută în interior
>
  <Text textAlign="center" fontWeight="semibold" fontSize="2xl" mb={6}>
    read about different perspectives and moods...
  </Text>

  {/* Bule colț dreapta sus */}
  <HStack spacing={4} position="absolute" top={4} right={6}>
    <Box boxSize={6} bg="green.600" borderRadius="full" />
    <Box boxSize={6} bg="gray.800" borderRadius="full" />
  </HStack>

  <HStack spacing={6} justify="center">
    <TestimonialCarousel />
  </HStack>
</Box>

<Box mb={100} px={6} >
      {/* Title */}
      <Text textAlign="center" fontWeight="semibold" fontSize="2xl" mb={10}>
        express your interest in various amazing events happening around you..
      </Text>

      {/* Event 1 - shape left */}
      <Flex
        justify="flex-start"
        align="center"
        mb={12}
        ml={{ base: 0, md: "-10" }}
      >
        <Box
          bg="gray.400"
          w="60%"
          h="180px"
          borderTopRightRadius="100px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="semibold"
        >
          poza eveniment
        </Box>

        <Box
          bg="gray.300"
          p={4}
          ml={-4}
          boxShadow="md"
          zIndex={1}
        >
          <Text fontWeight="bold">Art & Expression</Text>
          <Text fontSize="sm">May 12, 2025</Text>
          <Text fontSize="sm">Timișoara</Text>
        </Box>
      </Flex>

      {/* Event 2 - shape right */}
      <Flex
        justify="flex-end"
        align="center"
        mb={12}
        mr={{ base: 0, md: "-10" }}
      >
        <Box
          bg="gray.300"
          p={4}
          mr={-4}
          boxShadow="md"
          zIndex={1}
        >
          <Text fontWeight="bold">Urban Symphony</Text>
          <Text fontSize="sm">May 15, 2025</Text>
          <Text fontSize="sm">Bucharest</Text>
        </Box>

        <Box
          bg="gray.700"
          w="60%"
          h="180px"
          borderTopLeftRadius="100px"
          color="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="semibold"
        >
          poza eveniment
        </Box>
      </Flex>

      <Flex justify="space-between" align="center" mt={8}>
        <Button
          size="sm"
          bg="#8b7c3a"
          color="white"
          borderRadius="20px"
          _hover={{ bg: "#c35b4e" }}
        >
          Explore all the events
        </Button>

        <HStack spacing={3}>
          <Box w="20px" h="20px" bg="#b75c5c" borderRadius="full" />
          <Box w="20px" h="20px" bg="#b48f33" borderRadius="full" />
        </HStack>
      </Flex>
    </Box>




      {/* People Section */}
      <Box mt={20} mb={20} px={10} position="relative" h="500px">
        {/* Central Text */}
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

        {/* Circular Avatars */}
        {circularPositions.map((pos, i) => (
          <VStack
            key={i}
            spacing={0.5}
            position="absolute"
            top={pos.top}
            left={pos.left}
            transform={pos.transform}
          >
            <Avatar size="2xl" bg="gray.300">
              user
            </Avatar>
            <Text fontSize="sm" mt={1}>Name</Text>
            <Text fontSize="xs">occupation</Text>
          </VStack>
        ))}
      </Box>

     

       {/* Summary Section */}
       <Box textAlign="center" mb={20} mt={35}>
        <Text fontWeight="semibold" mb={6} fontSize="xl">
          As a summary, ART CORNER gives you the possibility to
        </Text>

        <Grid
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
          gap={10}
          justifyItems="center"
          px={{ base: 4, md: 20 }}
        >
          {[
            { text: "Travel your art through the whole world.", shape: true },
            { text: "Collaborate with different people.", shape: false },
            { text: "Share your thoughts.", shape: true },
            { text: "Make friends that share the same vision as you.", shape: false },
            { text: "Sell unique pieces of art.", shape: true },
            { text: "Participate to amazing events.", shape: false },
          ].map(({ text, shape }, idx) => (
            <Box
              key={idx}
              p={4}
              w="100%"
              maxW="240px"
              h="120px"
              bg={shape ? "#2F855A" : "transparent"}
              color={shape ? "white" : "green.700"}
              borderRadius={shape ? "0 60px 0 0" : "none"}
              border={shape ? "none" : "2px solid transparent"}
              fontSize="sm"
              display="flex"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              fontWeight={shape ? "medium" : "normal"}
            >
              {text}
            </Box>
          ))}
        </Grid>
      </Box>

  
      <ContactBar />
    </Box>
  );
};

export default HomePage;
