import React from "react";
import { Box, Flex, Text, Link } from "@chakra-ui/react";

const ContactBar = () => {
  return (
    <Box bg="gray.200" py={6} px={10} w="full">
      <Flex justifyContent="space-between" alignItems="center">
        {/* Secțiunea stângă */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Do you have any questions?
          </Text>
          <Link href="/faq" color="black" fontSize="md" _hover={{ textDecoration: "underline" }}>
            Check the FAQ
          </Link>
        </Box>

        {/* Secțiunea dreaptă */}
        <Box textAlign="right">
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Contact us
          </Text>
          <Text fontSize="md">Phone Number</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default ContactBar;
