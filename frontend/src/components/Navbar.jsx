import React from "react";
import {
  Box,
  HStack,
  Link,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";
import userAtom from "../atoms/userAtom";
import { useRecoilValue } from "recoil";
import useLogout from "../hooks/useLogout";

const Navbar = () => {
  const user = useRecoilValue(userAtom); 
  const handleLogout = useLogout(); 

  console.log(user);

  return (
    <Box bg="white" py={4} px={8} boxShadow="sm">
      <HStack as="nav" justifyContent="space-between" align="center">
        {/* Logo-ul (stânga) */}
        <Text fontFamily= "logo" fontSize="3xl" fontWeight="bold">
          Art Corner
        </Text>

        {/* Linkuri de navigație */}
        <HStack fontSize="xl" spacing={20}>
          <Link href="/home" _hover={{ textDecoration: "none", color: "black" }}>
            Home
          </Link>
          <Link href="/galleries" _hover={{ textDecoration: "none", color: "black" }}>
            Galleries
          </Link>
          <Link href="/products" _hover={{ textDecoration: "none", color: "black" }}>
            Products
          </Link>
          <Link href="/events" _hover={{ textDecoration: "none", color: "black" }}>
            Events
          </Link>
          <Link href="/events" _hover={{ textDecoration: "none", color: "black" }}>
            Search
          </Link>

           {/* Afișăm Profile dacă user-ul este logat, Auth altfel */}
           {user ? (
            <Menu>
              <MenuButton
                
                bg="white"
                _hover={{ bg: "gray.100" }}
                _active={{ bg: "gray.200" }}
              >
                Profile ▼
              </MenuButton>
              <MenuList>
                <MenuItem as={Link} href={`/profile/${user.username}`}>
                  My Page
                </MenuItem>
                <MenuItem as={Link} href="/messages">
                  Messages
                </MenuItem>
                <MenuItem as={Link} href="/update">
                  Edit Profile
                </MenuItem>
                <MenuItem as={Link} href="/calendar">
                  Calendar
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Link href="/auth" _hover={{ textDecoration: "none", color: "black" }}>
              Auth
            </Link>
          )}
        </HStack>
      </HStack>
    </Box>
  );
};

export default Navbar;
