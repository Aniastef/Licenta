import React from "react";
import { Box, Image, Text, Textarea } from "@chakra-ui/react";
import img from "../assets/textOver.png"
const TextOverImage = () => {
  return (
    <Box position="relative" w="full" h="300px">
      {/* Imaginea */}
      <Image
        src={img} // Înlocuiește cu imaginea ta
        alt="Background"
        w="full"
        h="full"
        objectFit="cover"
      />

      {/* Textul deasupra imaginii */}
      <Text
         position="absolute"
         top="5%" // Ajustează pentru poziționarea verticală
         left="6%" // Ajustează pentru poziționarea orizontală
         fontSize="lg"
         color="black"
         textAlign="left"
         maxW="40%"
      > 
        Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        Lorem ipsLorem ipsum dolor sit amet, consectetur adipiscing elit."
        um doloLorem ipsum dolor sit amet, consectetur adipiscing elit."
        sit amet,Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        consectetur adipiscing elit.
        <Text>Lorem ipsum </Text>
      </Text>
    </Box>
  );
};

export default TextOverImage;
