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
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import homeCover from "../assets/homeCover.jpg"
import RectangleShape from "../assets/rectangleShape";
import Carousel from "../components/PhotoCarousel";
import TextOverImage from "../assets/textOverComponent";
import ContactBar from "../components/ContactBar";
import eventHome from "../assets/eventHome.jpg"

const HomePage = () => {
  return (
    <Box bg="white" color="black">
      {/* Header image */}
      <Image
        src={homeCover}
        alt="Header"
        w="full"
        h="300px"
        objectFit="cover"
      />

        {/* Secțiunea de text de întâmpinare */}
    <Flex justify="center" align="center" py={8} px={4} textAlign="center">
      <Text fontSize="lg" maxW="800px">
        ""Lorem ip        ""Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        ""Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        sum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
      </Text>
    </Flex>

    {/* Dreptunghiuri suprapuse */}
    <Flex justifyContent="left" position="relative" py={5} mt={4}>
      {/* Dreptunghi portocaliu rotit */}
      <RectangleShape
        bgColor="#E25822" // Culoare portocalie
        title="" // Fără text
        minW="603px"
        position="absolute" // Poziție absolută
        rotation="-10deg" // Rotire
        left="-3" // Aliniere exactă la marginea stângă
      />

      {/* Dreptunghi albastru */}
      <RectangleShape
        bgColor="#62cbe0" // Culoare albastră
        title="Explore our community and our various artists!"
        minW="600px"
        position="relative" // Poziție relativă pentru a fi deasupra portocaliului
        textAlign="left"
        py={4}
        left="-2"
      />
    </Flex>


    <Carousel></Carousel>

      {/* Secțiunea de testimonial */}
      <Flex justifyContent="right" mt={10}>
        {/* Dreptunghi albastru */}
      <RectangleShape
        bgColor="#62cbe0" // Culoare albastră
        title="Discover the most amazing stories of the most amazing artists!"
        minW="600px"
        position="relative" // Poziție relativă pentru a fi deasupra portocaliului
        textAlign="left"
        py={4}
        right="-2"
      />
    </Flex>
    <TextOverImage></TextOverImage>
     
     <Flex direction="row" alignItems="center" justifyContent="space-between"  py={20}>
        <VStack   spacing={0} >
      {/* Dreptunghi galben */}
      <RectangleShape
        bgColor="#d4af37" // Culoare galbenă
        title="Get yourself a nice piece of art from the sellers and review them for others to see."
        minW="500px"
        minH="120px"
        textAlign="left"
        zIndex="1" // Apare sub galben

      />

      {/* Dreptunghi albastru */}
      <RectangleShape
        bgColor="#62cbe0" // Culoare albastră
        title="Chat with them and make an appointment!"
        minW="200px"
        textAlign="left"
        zIndex="0" // Apare sub galben
        alignSelf="flex-end" // Aliniere la capătul dreptunghiului galben

      />
      <Text as={Link} to="/products" fontSize="xl" fontWeight="semibold" mt={10}>
        See all existing products!
      </Text>
    </VStack>
        <Image
          src={homeCover} // Înlocuiește cu imaginea ta
          alt="Art Image"
          borderRadius="md"
          maxW="600px"
          px={20}
          transform="rotate(-8deg)" // Rotire pentru imagine
        />
      </Flex>

      <Flex justifyContent="right" mt={5}>
      <RectangleShape
        bgColor="#62cbe0" // Culoare albastră
        title="Participate to various events happening around you!"
        minW="800px"
        textAlign="left"
        py={4}
        right="-2"
      />
      </Flex>
      <Flex mb={10} justifyContent="space-between" >
        {/* Dreptunghi albastru */}
        <VStack>
        <Text>
          Cartoon exposition in Wien
        </Text>
        <Image
          src={eventHome} // Înlocuiește cu imaginea ta
          alt="Art Image"
          borderRadius="md"
          minW="600px"
          maxW="600px"
          px={20}
        />
        </VStack>
        <Text as={Link} to="/products" 
        fontSize="xl" px={20} 
        fontWeight="semibold" 
        mt={10}
        color={"gray.500"}
        _hover={{ color: 'blue.500'}}
        >
          See all existing products!
        </Text>
     </Flex>
    <ContactBar/>
    </Box>
  );
};

export default HomePage;
