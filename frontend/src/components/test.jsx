import { Box, Flex, Image, Text } from '@chakra-ui/react';
import React from 'react';

const Test = () => {
    return (
        <Flex bg="pink.200" direction="column" px={6} py={12} maxW="1300px" mx="auto" >
        {/* <Box bgColor={"gray.500"}> aaaa</Box>
        <Box bgColor={"gray.500"}> aaaa</Box> */}
              <Flex bg="gray.200" justify="space-between" align="flex-start" gap={10}>
               <Box w="300px" h="300px" overflow="hidden" borderRadius="full">
                          <Image
                            src= "https://i.profession.cc/150"
                           
                            w="100%"
                            h="100%"
                            objectFit="cover"
                          />
                        </Box>
              </Flex>
              <Flex ml={20}  align="flex-start" gap={10}>
              <Box bgColor={"gray.500"}> aaaa</Box>
              <Box bgColor={"gray.500"}> aaaa</Box>
              </Flex>

        </Flex>
    );
};

export default Test;