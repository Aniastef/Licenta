import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const RectangleShape = ({
  bgColor,
  title,
  minW = '400px',
  maxW,
  minH = '60px',
  textAlign,
  rotation,
  left,
  right,
  position,
}) => {
  return (
    <Box
      bg={bgColor}
      borderRadius="sm" 
      minW={minW} 
      maxW={maxW} 
      minH={minH} 
      px={3} 
      py={4}
      sx={{ transform: `rotate(${rotation})` }}
      textAlign={textAlign} 
      position={position}
      left={left}
      right={right}
      display="flex" 
      alignItems="center" 
    >
      {title && <Text fontSize="lg">{title}</Text>}
    </Box>
  );
};

export default RectangleShape;
