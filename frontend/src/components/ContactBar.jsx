import React from "react";
import { Box, Flex, Text, Image, HStack, Link } from "@chakra-ui/react";
import phoneIcon from "../assets/phone.svg";
import emailIcon from "../assets/email.svg";
import facebookIcon from "../assets/facebook.svg";
import instagramIcon from "../assets/instagram.svg";
import contactBarBg from "../assets/contactBar.svg";

const ContactBar = () => {
  return (
    <Box
      w="100%"
      position="relative"
      minH="300px" // Ajustează această înălțime dacă e nevoie
      overflow="hidden"
    >
      {/* Fundal inversat cu imaginea SVG - poziționat absolut */}
      <Image
        src={contactBarBg}
        alt="contact shape"
        w="100%"
        h="100%"
        objectFit="cover"
        position="absolute"
        top="0"
        left="0"
        zIndex={1}
        pointerEvents="none"
      />

      {/* Conținut Contact - poziționat absolut peste imagine */}
      <Flex
        position="absolute"
        bottom="0"
        left="50%"
        transform="translateX(-50%)"
        zIndex={2}
        direction="column"
        align="center"
        justify="center"
        textAlign="center"
        w="100%"
        p={4}
      >
        <Text fontWeight="bold" fontSize="2xl" mb={4} >
          Got any questions?
        </Text>

        <HStack spacing={3} mb={2}>
          <Image src={phoneIcon} boxSize="20px" /> {/* Am șters filter="invert(1)" aici */}
          <Text >+40 723 123 456</Text>
        </HStack>

        <HStack spacing={3} mb={2}>
          <Image src={emailIcon} boxSize="20px" /> {/* Am șters filter="invert(1)" aici */}
          <Text >contact@artcorner.com</Text>
        </HStack>

        <HStack spacing={3} mb={2}>
          <Image src={facebookIcon} boxSize="20px" /> {/* Am șters filter="invert(1)" aici */}
          <Link href="https://facebook.com/artcorner" isExternal color="blue.700">
            facebook.com/artcorner
          </Link>
        </HStack>

        <HStack spacing={3}>
          <Image src={instagramIcon} boxSize="20px" /> {/* Am șters filter="invert(1)" aici */}
          <Link href="https://instagram.com/artcorner" isExternal color="purple.700">
            @artcorner
          </Link>
        </HStack>
      </Flex>
    </Box>
  );
};

export default ContactBar;