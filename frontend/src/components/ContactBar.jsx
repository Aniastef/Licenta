import React from "react";
import { Box, Flex, Text, Circle } from "@chakra-ui/react";

const ContactBar = () => {
  return (
    <Box w="100%" mt={0} p={0} overflow="hidden">
      <Flex
        w="100%"
        align="center"
        justify="center"
        position="relative"
        bg="white"
        p={0}
        m={0}
      >
        {/* Left Circle */}
        <Circle size="20px" bg="#8b7255" position="absolute" left={6} bottom={4} />

        {/* Right Circle */}
        <Circle size="20px" bg="#66c4d0" position="absolute" right={6} bottom={4} />

        {/* Central Box */}
        <Box
          bg="#bd9332"
          color="black"
          px={10}
          py={10}
          borderTopLeftRadius="150px"
          borderTopRightRadius="150px"
          textAlign="center"
          w={{ base: "90%", md: "400px" }}
          m={0}
        >
          <Text fontWeight="bold" fontSize="lg" mb={2}>
            Got any questions?
          </Text>
          <Text fontSize="sm">Phone number</Text>
          <Text fontSize="sm">E-mail</Text>
          <Text fontSize="sm">Facebook</Text>
          <Text fontSize="sm">Instagram</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default ContactBar;
