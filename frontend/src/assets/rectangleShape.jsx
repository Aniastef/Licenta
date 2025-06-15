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
      bg={bgColor} // Fundalul dreptunghiului
      borderRadius="sm" // Colțuri rotunjite
      minW={minW} // Lățime minimă
      maxW={maxW} // Lățime maximă
      minH={minH} // Înălțime minimă
      px={3} // Padding pe orizontală
      py={4}
      sx={{ transform: `rotate(${rotation})` }} // Rotire
      textAlign={textAlign} // Text centrat
      position={position}
      left={left}
      right={right}
      display="flex" // Activează layout-ul Flexbox
      alignItems="center" // Aliniere pe verticală
    >
      {title && <Text fontSize="lg">{title}</Text>}
    </Box>
  );
};

export default RectangleShape;
