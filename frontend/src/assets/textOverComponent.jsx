import React from 'react';
import { Box, Image, Text, Textarea } from '@chakra-ui/react';
import img from '../assets/textOver.png';
const TextOverImage = () => {
  return (
    <Box position="relative" w="full" h="300px">
      {}
      <Image
        src={img}
        alt="Background"
        w="full"
        h="full"
        objectFit="cover"
      />

      {}
      <Text
        position="absolute"
        top="5%"
        left="6%" 
        fontSize="lg"
        color="black"
        textAlign="left"
        maxW="40%"
      >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit." Lorem ipsLorem ipsum dolor sit
        amet, consectetur adipiscing elit." um doloLorem ipsum dolor sit amet, consectetur
        adipiscing elit." sit amet,Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        consectetur adipiscing elit.
      </Text>
    </Box>
  );
};

export default TextOverImage;
