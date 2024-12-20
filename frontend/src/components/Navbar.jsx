import React from 'react';
import { Box, HStack, Link } from '@chakra-ui/react';

const Navbar = () => {
  return (
    <Box bg="beige" py={4} boxShadow="sm">
      <HStack as="nav" justifyContent="center" spacing={20}>
        <Link href="/home" fontSize="sm" fontWeight="bold" textTransform="uppercase">
          Home
        </Link>
        <Link href="/products" fontSize="sm" fontWeight="bold" textTransform="uppercase">
          Produse
        </Link>
        <Link href="/events" fontSize="sm" fontWeight="bold" textTransform="uppercase">
          Evenimente
        </Link>
        <Link href="/profile" fontSize="sm" fontWeight="bold" textTransform="uppercase">
          Profil
        </Link>
        <Link href="/contact" fontSize="sm" fontWeight="bold" textTransform="uppercase">
          Contact
        </Link>
        <Link href="/create" fontSize="sm" fontWeight="bold" textTransform="uppercase">
          Adauga produs
        </Link>
      </HStack>
    </Box>
  );
};

export default Navbar;
