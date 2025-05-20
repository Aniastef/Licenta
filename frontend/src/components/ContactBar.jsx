import React from "react";
import { Box, Flex, Text, Circle, Image, HStack, Link } from "@chakra-ui/react";
import phoneIcon from "../assets/phone.svg";
import emailIcon from "../assets/email.svg";
import facebookIcon from "../assets/facebook.svg";
import instagramIcon from "../assets/instagram.svg";
import navbarBg from "../assets/navbar.svg"; // imaginea decorativă

const ContactBar = () => {
  return (
    <Box w="100%" mt={20} position="relative" overflow="visible">
      
      {/* Fundal inversat cu imaginea SVG */}
      <Image
        src={navbarBg}
        alt="contact shape"
        w="100%"
        transform="rotate(180deg)"
        position="absolute"
        top="-76px"
        left="0"
        zIndex={1}
        pointerEvents="none"
      />

      {/* Conținut Contact */}
      <Flex
        position="relative"
        zIndex={2}
        direction="column"
        align="center"
        justify="center"
        px={10}
        py={10}
        textAlign="center"
      >
        <Text fontWeight="bold" fontSize="2xl" mt={0} mb={4}>
          Got any questions?
        </Text>

        <HStack spacing={3} mb={2}>
          <Image src={phoneIcon} boxSize="20px" />
          <Text>+40 723 123 456</Text>
        </HStack>

        <HStack spacing={3} mb={2}>
          <Image src={emailIcon} boxSize="20px" />
          <Text>contact@artcorner.com</Text>
        </HStack>

        <HStack spacing={3} mb={2}>
          <Image src={facebookIcon} boxSize="20px" />
          <Link href="https://facebook.com/artcorner" isExternal color="blue.700">
            facebook.com/artcorner
          </Link>
        </HStack>

        <HStack spacing={3}>
          <Image src={instagramIcon} boxSize="20px" />
          <Link href="https://instagram.com/artcorner" isExternal color="purple.600">
            @artcorner
          </Link>
        </HStack>
      </Flex>
    </Box>
  );
};

export default ContactBar;
