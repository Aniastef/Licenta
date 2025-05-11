import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  SimpleGrid,
  Spinner,
  Heading,
  Flex,
  Circle,
  Image,
} from "@chakra-ui/react";
import { useParams, Link } from "react-router-dom";

const FavoritesPage = () => {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({ favoriteProducts: [], favoriteGalleries: [] });

  useEffect(() => {
    const fetchFavorites = async () => {
        try {
          const res = await fetch(`/api/users/${username}/favorites-all`);
          if (!res.ok) {
            const errorText = await res.text(); // capture even if it's not JSON
            throw new Error(`Error ${res.status}: ${errorText}`);
          }
      
          const data = await res.json();
          setFavorites(data);
        } catch (err) {
          console.error("Failed to fetch favorites:", err.message);
        } finally {
          setLoading(false);
        }
      };
      

    fetchFavorites();
  }, [username]);

  const { favoriteProducts = [], favoriteGalleries = [] } = favorites;

  if (loading) return <Spinner size="xl" />;

  return (
    <Box p={4} maxW="1900px" mx="auto">
  {/* HEADER */}
  <Flex justifyContent="center" alignItems="center" mb={4} position="relative">
    <Heading size="lg">User favorites</Heading>
    <Flex position="absolute" right={4} gap={2}>
      <Circle size="30px" bg="yellow.400" />
      <Circle size="30px" bg="green.400" />
    </Flex>
  </Flex>

  {/* GALLERIES */}
  <Heading size="md" align="center" mb={2}>Favorite Galleries</Heading>
  {favoriteGalleries.length === 0 ? (
    <Text mb={4}>No favorite galleries.</Text>
  ) : (
    <Flex wrap="wrap" justify="center" gap={6} mb={10}>
      {favoriteGalleries.map((gallery) => (
        <Link key={gallery._id} to={`/galleries/${gallery.owner?.username}/${encodeURIComponent(gallery.name)}`}>
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
            <Box w="100%" h="250px" bg="gray.300" mb={3} overflow="hidden">
              {gallery.coverPhoto ? (
                <Image src={gallery.coverPhoto} alt={gallery.name} objectFit="cover" w="100%" h="100%" />
              ) : gallery.products?.[0]?.images?.[0] ? (
                <Image src={gallery.products[0].images[0]} alt={gallery.name} objectFit="cover" w="100%" h="100%" />
              ) : (
                <Flex align="center" justify="center" h="100%" bg="gray.400">
                  <Text>No cover photo</Text>
                </Flex>
              )}
            </Box>
            <Box textAlign="center" py={2} px={2}>
              <Text fontWeight="bold" mb={1}>{gallery.name}</Text>
              <Text fontSize="sm" color="gray.600">{gallery.products?.length || 0} products</Text>
              <Text fontSize="sm">
                <strong>Creator:</strong> {gallery.owner?.firstName} {gallery.owner?.lastName}
              </Text>
            </Box>
          </Box>
        </Link>
      ))}
    </Flex>
  )}

  {/* PRODUCTS */}
  <Heading align="center" size="md" mb={2}>Favorite Products</Heading>
  {favoriteProducts.length === 0 ? (
    <Text>No favorite products.</Text>
  ) : (
    <Flex wrap="wrap" justify="center" gap={6}>
      {favoriteProducts.map((product) => (
        <Link to={`/products/${product._id}`} key={product._id}>
          <Box
            w="100%"
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
                <Flex align="center" justify="center" h="100%" bg="gray.300" color="gray.600">
                  <Text>{product.name}</Text>
                </Flex>
              )}
            </Box>
            <Box textAlign="center" py={3} px={2}>
              <Text fontWeight="bold" noOfLines={1}>{product.name}</Text>
              {product.forSale && product.price > 0 && (
                <Text fontSize="sm" color="green.600">For Sale: {product.price} RON</Text>
              )}
              {product.forSale && product.price > 0 && (
                <Text fontSize="sm" color="gray.600">Stock: {product.quantity}</Text>
              )}
            </Box>
          </Box>
        </Link>
      ))}
    </Flex>
  )}
</Box>

  );
};

export default FavoritesPage;
