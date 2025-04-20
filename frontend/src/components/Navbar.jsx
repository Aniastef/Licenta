import React from "react";
import {
  Box,
  HStack,
  VStack,
  Flex,
  Image,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Input,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useLogout from "../hooks/useLogout";
import cartIcon from "../assets/cart.png";
import { useCart } from "../components/CartContext";
import NotificationDrawer from "./NotificationDrawer";
import LogoFlowers from "../assets/logoflowers.svg";


const Navbar = () => {
  const user = useRecoilValue(userAtom);
  const handleLogout = useLogout();
  const { cart } = useCart();
  const cartCount = cart.length;

  return (
    <Box bg="white" py={4} px={8} boxShadow="sm">
      {/* LOGO + SUBTITLU */}
      <VStack spacing={1} textAlign="center" mb={4}>
  <HStack spacing={2} justify="center">
    <Text fontFamily="logo" fontSize="3xl" fontWeight="bold">
      Art Corner
    </Text>
    <Image src={LogoFlowers} alt="Logo icon" boxSize="28px" />
  </HStack>
  <Text fontSize="md" fontStyle="italic" color="gray.800">
    - a place to explore your passions -
  </Text>
</VStack>


      {/* MENIU + SEARCH */}
      <Flex justify="space-between" align="center" flexWrap="wrap">
        <HStack spacing={6} fontSize="lg" flexWrap="wrap">
          <Link to="/home">Home</Link>
          <Link to="/orders">My orders</Link>
          <Link to="/galleries">Galleries</Link>
          <Link to="/products">Products</Link>
          <Link to="/events">Events</Link>
          <Link to="/messages">Messages</Link>

          {/* 👤 PROFILE */}
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
                <MenuItem as={Link} to="/messages">Messages</MenuItem>
                <MenuItem as={Link} to="/update">Edit Profile</MenuItem>
                <MenuItem as={Link} to="/blocked-users">Blocked Users</MenuItem>
                <MenuItem as={Link} to="/calendar">Calendar</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Link to="/auth">Auth</Link>
          )}
        </HStack>

        {/* SEARCH + CART + NOTIFICATIONS */}
        <HStack spacing={4} mt={{ base: 4, md: 0 }}>
          <Input
            placeholder="Search"
            borderRadius="full"
            borderColor="gray.400"
            width="200px"
            size="sm"
          />

          <Link to="/cart">
            <Button variant="ghost" display="flex" alignItems="center" gap={2}>
              <Image src={cartIcon} alt="Cart" boxSize="24px" />
              {cartCount > 0 && <Text fontSize="md">({cartCount})</Text>}
            </Button>
          </Link>

          {user && <NotificationDrawer />}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
