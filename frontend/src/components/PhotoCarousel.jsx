import React from "react";
import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react";

const Carousel = () => {
  const scrollLeft = () => {
    const carousel = document.getElementById("carousel");
    carousel.scrollLeft -= 200; // Derulează 200px la stânga
  };

  const scrollRight = () => {
    const carousel = document.getElementById("carousel");
    carousel.scrollLeft += 200; // Derulează 200px la dreapta
  };

  return (
    <Box position="relative" w="full">
      {/* Buton pentru derulare la stânga */}
      <Button
        onClick={scrollLeft}
        position="absolute"
        left="10px"
        top="50%"
        transform="translateY(-50%)"
        zIndex="2"
        bg="white"
        boxShadow="md"
        _hover={{ bg: "gray.100" }}
      >
        {"<"}
      </Button>

      {/* Containerul caruselului */}
      <Flex
        id="carousel"
        overflowX="scroll" // Permite derularea pe axa X
        scrollBehavior="smooth" // Face derularea să fie lină
        whiteSpace="nowrap" // Elementele rămân pe un singur rând
        gap={6} // Spațiu între elemente
        px={8} // Padding lateral
        py={8} // Padding vertical
        css={{
          '&::-webkit-scrollbar': {
            display: 'none', // Ascunde bara de derulare în browsere bazate pe WebKit
          },
          '-ms-overflow-style': 'none', // Ascunde bara de derulare în Internet Explorer
          'scrollbar-width': 'none', // Ascunde bara de derulare în Firefox
        }}
      >
        {Array(10)
          .fill("")
          .map((_, index) => (
            <VStack key={index} minW="200px" spacing={4}>
              <Box
                w="full"
                h="200px"
                bg="gray.200"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text>Photography {index + 1}</Text>
              </Box>
              <Text>Photography</Text>
            </VStack>
          ))}
      </Flex>

      {/* Buton pentru derulare la dreapta */}
      <Button
        onClick={scrollRight}
        position="absolute"
        right="10px"
        top="50%"
        transform="translateY(-50%)"
        zIndex="2"
        bg="white"
        boxShadow="md"
        _hover={{ bg: "gray.100" }}
      >
        {">"}
      </Button>
    </Box>
  );
};

export default Carousel;
