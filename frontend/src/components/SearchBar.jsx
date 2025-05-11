import {
    Input,
    Select,
    Box,
    Button,
    HStack,
    VStack,
    Text,
    InputGroup,
    InputRightElement,
    Spinner,
  } from "@chakra-ui/react";
  import { SearchIcon } from "@chakra-ui/icons";
  import React, { useState, useEffect, useRef } from "react";
  import { useNavigate } from "react-router-dom";
  
  const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("all");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const timeoutRef = useRef(null);
  
    const fetchSuggestions = async (value) => {
      if (!value) return setSuggestions([]);
  
      try {
        setLoading(true);
        const res = await fetch(`/api/search?query=${value}&category=${category}`);
        const data = await res.json();
        setSuggestions(data || []);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      } finally {
        setLoading(false);
      }
    };
  
    const handleSearch = () => {
      if (searchTerm.trim()) {
        navigate(`/search?query=${encodeURIComponent(searchTerm)}&category=${category}`);
        setSuggestions([]);
      }
    };
  
    const handleInputChange = (e) => {
      const value = e.target.value;
      setSearchTerm(value);
  
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    };
  
    const handleSelectSuggestion = (item) => {
        if (item.type === "user") {
            navigate(`/profile/${item.username}`);
          } else if (item.type === "gallery") {
            navigate(`/galleries/${item.username}/${item.name}`);
          } else if (item.type === "event") {
            navigate(`/events/${item._id}`);
          } else {
            navigate(`/${item.type}s/${item._id}`);
          }
                setSuggestions([]);
    };
  
    return (
      <Box position="relative" zIndex="overlay">
        <HStack spacing={2}>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            size="sm"
            bg="white"
            borderColor="gray.300"
            width="150px"
          >
            <option value="all">All</option>
            <option value="products">Products</option>
            <option value="galleries">Galleries</option>
            <option value="events">Events</option>
            <option value="articles">Articles</option>
            <option value="users">Users</option>
          </Select>
  
          <InputGroup>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              size="sm"
              bg="white"
              borderColor="gray.300"
            />
            <InputRightElement width="2.5rem">
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <Button mb={2} size="md" bg="transparent" onClick={handleSearch}>
                  <SearchIcon />
                </Button>
              )}
            </InputRightElement>
          </InputGroup>
        </HStack>
  
        {suggestions.length > 0 && (
          <Box
            mt={1}
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            shadow="md"
            maxHeight="200px"
            overflowY="auto"
            position="absolute"
            width="full"
          >
           {suggestions.map((item) => (
  <Box
    key={item._id}
    px={4}
    py={2}
    cursor="pointer"
    _hover={{ bg: "gray.100" }}
    onClick={() => handleSelectSuggestion(item)}
  >
    <Text fontWeight="semibold">
      {item.name}
    </Text>
    <Text fontSize="xs" color="gray.500">
      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
    </Text>
  </Box>
))}

          </Box>
        )}
      </Box>
    );
  };
  
  export default SearchBar;
  