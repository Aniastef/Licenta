import React, { useState } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useLogout from "../hooks/useLogout";
import cartIcon from "../assets/cart.svg";
import { useCart } from "../components/CartContext";
import NotificationDrawer from "./NotificationDrawer";
import LogoFlowers from "../assets/logoflowers.svg";
import navbarBg from "../assets/navbar.svg"; // imaginea de fundal
import messagesIcon from "../assets/messagesIcon.svg"; // Iconița mesajelor
import useUnreadMessagesCount from "../hooks/useUnreadMessagesCount"; // Hook-ul cu numărul necitit
import { SearchIcon } from "@chakra-ui/icons"; // sus în importuri
import SearchBar from "./SearchBar";


const Navbar = () => {
  const user = useRecoilValue(userAtom);
  const handleLogout = useLogout();
  const { cart } = useCart();
  const cartCount = cart.length;
  const unreadMessages = useUnreadMessagesCount(); // Returnează 0, 1, 2, etc.
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  
  return (
    <Box
  bgImage={`url(${navbarBg})`}
  bgRepeat="no-repeat"
  bgSize="100% auto"
  bgPosition="top"
  px={10}
  pt={5}
  pb="190px" // 🧠 adaugă spațiu pentru a lăsa imaginea să coboare
  position="relative"
  zIndex={10}
>
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
        <Link to="/home"><Text _hover={{ textDecoration: "underline" }}>Home</Text></Link>
  <Link to="/orders"><Text _hover={{ textDecoration: "underline" }}>My orders</Text></Link>
  <Link to="/galleries"><Text _hover={{ textDecoration: "underline" }}>Galleries</Text></Link>
  <Link to="/products"><Text _hover={{ textDecoration: "underline" }}>Products</Text></Link>
  <Link to="/events"><Text _hover={{ textDecoration: "underline" }}>Events</Text></Link>
  <Link to="/articles"><Text _hover={{ textDecoration: "underline" }}>ARTicless</Text></Link>
 
  {user && (
    <Link to={`/favorites/${user.username}`}>
      <Text _hover={{ textDecoration: "underline" }}>Favorites</Text>
    </Link>
  )}
          {/* 👤 PROFILE */}
          {user ? (
            <Menu>
              <MenuButton
                _hover={{ textDecoration: "underline" }}
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

         <SearchBar/>

          <Link to="/cart">
            <Button variant="ghost" display="flex" alignItems="center" gap={2}>
              <Image src={cartIcon} alt="Cart" boxSize="24px" />
              {cartCount > 0 && <Text fontSize="md">({cartCount})</Text>}
            </Button>
          </Link>
          <Link to="/messages">
  <Button variant="ghost" display="flex" alignItems="center" gap={2} position="relative">
    <Image src={messagesIcon} alt="Messages" boxSize="26px" />
    {unreadMessages > 0 && (
      <Box
        position="absolute"
        top="-1"
        right="-1"
        bg="red.500"
        color="white"
        fontSize="xs"
        px="2"
        rounded="full"
      >
        {unreadMessages}
      </Box>
    )}
  </Button>
</Link>


          {user && <NotificationDrawer showBadge={true} />}
          </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
