import React from "react";
import {
  Box,
  HStack,
  Flex,
  Image,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import userAtom from "../atoms/userAtom";
import { useRecoilValue } from "recoil";
import useLogout from "../hooks/useLogout";
import cartIcon from "../assets/cart.png";
import { useCart } from "../components/CartContext"; 
import { CartContext } from "../components/CartContext";
import { useContext } from "react";

const Navbar = () => {
  const user = useRecoilValue(userAtom); 
  const handleLogout = useLogout(); 
  const { cart } = useCart(); 
  const cartCount = cart.length;

  return (
    <Box bg="white" py={4} px={8} boxShadow="sm">
      <HStack as="nav" justifyContent="space-between" align="center">
        <Text fontFamily="logo" fontSize="3xl" fontWeight="bold">
          Art Corner
        </Text>

        <HStack fontSize="xl" spacing={20}>
          <Link to="/home">Home</Link>
          <Link to="/orders">My orders</Link>
          <Link to="/galleries">Galleries</Link>
          <Link to="/products">Products</Link>
          <Link to="/events">Events</Link>
          <Link to="/cart">
            <Button variant="ghost" colorScheme="teal" display="flex" alignItems="center" gap={2}>
              <Image src={cartIcon} alt="Cart" boxSize="24px" />
              {cartCount > 0 && <Text fontSize="md">({cartCount})</Text>}
            </Button>
          </Link>

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
                <MenuItem as={Link} to={`/profile/${user.username}`}>
                  My Page
                </MenuItem>
                <MenuItem as={Link} to="/messages">
                  Messages
                </MenuItem>
                <MenuItem as={Link} to="/update">
                  Edit Profile
                </MenuItem>
                <MenuItem as={Link} to="/blocked-users">
                  Blocked Users
                </MenuItem>
                <MenuItem as={Link} to="/calendar">
                  Calendar
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Link to="/auth">Auth</Link>
          )}
        </HStack>
      </HStack>
    </Box>
  );
};

export default Navbar;
