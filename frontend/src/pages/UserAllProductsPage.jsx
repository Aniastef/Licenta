import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Flex,
  Input,
  Select,
  Button,
  Image,
  Spinner,
  Heading,
  HStack,
  SimpleGrid,
  Tag,
  VStack,
} from "@chakra-ui/react";
import { useParams, Link } from "react-router-dom";

const UserAllProductsPage = () => {
  const { username } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [mediaTypeFilter, setMediaTypeFilter] = useState(""); // "" înseamnă "toate"

  useEffect(() => {
    fetchUserProducts();
  }, [username]);

  const fetchUserProducts = async () => {
    try {
      const res = await fetch(`/api/products/user/${username}`, {
        credentials: "include",
      });
      const data = await res.json();
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
    } catch (err) {
      console.error("Error fetching user products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let updated = [...products];

    if (searchTerm.trim()) {
      updated = updated.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortOption === "price-asc") {
      updated.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOption === "price-desc") {
      updated.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (mediaTypeFilter) {
      updated = updated.filter((p) => {
        if (mediaTypeFilter === "images") return p.images?.length > 0;
        if (mediaTypeFilter === "videos") return p.videos?.length > 0;
        if (mediaTypeFilter === "audios") return p.audios?.length > 0;
        if (mediaTypeFilter === "writing") return p.writing?.length > 0;
        return true;
      });
    }
    

    setFilteredProducts(updated);
  }, [searchTerm, sortOption, mediaTypeFilter, products]);

  return (
    <Box p={4} maxW="1200px" mx="auto">
      <Heading mb={4}>{username}'s Products</Heading>

      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="300px"
        />
        <Select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          maxW="200px"
        >
          <option value="latest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </Select>
        <Select
  value={mediaTypeFilter}
  onChange={(e) => setMediaTypeFilter(e.target.value)}
  maxW="200px"
>
  <option value="">All Types</option>
  <option value="images">Image</option>
  <option value="videos">Video</option>
  <option value="audios">Audio</option>
  <option value="writing">Writing</option>
</Select>

      </Flex>

      {loading ? (
        <Flex justify="center">
          <Spinner size="xl" />
        </Flex>
      ) : filteredProducts.length === 0 ? (
        <Text>No products found.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
          {filteredProducts.map((product) => (
            <Link to={`/products/${product._id}`} key={product._id}>
              <Box
                bg="gray.100"
                borderRadius="md"
                boxShadow="md"
                overflow="hidden"
                border="1px solid #ccc"
                _hover={{ boxShadow: "lg", transform: "scale(1.02)" }}
                transition="all 0.2s"
                cursor="pointer"
              >
                <Box h="270px" bg="gray.200">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  ) : (
                    <Flex
                      align="center"
                      justify="center"
                      w="100%"
                      h="100%"
                      bg="gray.200"
                      color="gray.600"
                      fontWeight="bold"
                      fontSize="lg"
                    >
                      {product.name}
                    </Flex>
                  )}
                </Box>

                <Box textAlign="center" py={3} px={2}>
                  <Text fontWeight="bold" noOfLines={1}>{product.name}</Text>

                  {product.forSale && product.price > 0 && (
                    <Text fontSize="sm" color="green.600">
                      For Sale: {product.price} RON
                    </Text>
                  )}

                  {product.forSale && product.price > 0 && (
                    <Text fontSize="sm" color="gray.600">
                      Stock: {product.quantity}
                    </Text>
                  )}

                  {product.galleries?.length > 0 && (
                    <Text fontSize="xs" color="purple.500" mt={1}>
                      Gallery: {product.galleries[0].name || "-"}
                    </Text>
                  )}
                </Box>
              </Box>
            </Link>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default UserAllProductsPage;
