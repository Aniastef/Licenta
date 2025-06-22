import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Spinner,
  Heading,
  Flex,
  Circle,
  Image,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  SimpleGrid,
} from '@chakra-ui/react';
import { useParams, Link } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';

const FavoritesPage = () => {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({
    favoriteProducts: [],
    favoriteGalleries: [],
    favoriteArticles: [],
  });

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(`/api/users/${username}/favorites-all`);
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Error ${res.status}: ${errorText}`);
        }
        const data = await res.json();
        setFavorites(data);
      } catch (err) {
        console.error('Failed to fetch favorites:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [username]);

  const { favoriteProducts, favoriteGalleries, favoriteArticles } = favorites;

  if (loading) return <Spinner size="xl" />;

  return (
    <Box p={4} maxW="1300px" mx="auto">
      {}
      <Flex justifyContent="center" alignItems="center" mb={6} position="relative">
        <Heading size="lg">User favorites</Heading>
        <Flex position="absolute" right={4} gap={2}>
          <Circle size="30px" bg="yellow.400" />
          <Circle size="30px" bg="green.400" />
        </Flex>
      </Flex>

      {}
      <Tabs isFitted variant="enclosed">
        <TabList mb={4}>
          <Tab>Favorite Galleries</Tab>
          <Tab>Favorite Artworks</Tab>
          <Tab>Favorite ARTicles</Tab>
        </TabList>

        <TabPanels>
          {}
          <TabPanel>
            {favoriteGalleries.length === 0 ? (
              <Text>No favorite galleries.</Text>
            ) : (
              <Flex wrap="wrap" justify="center" gap={8}>
                {favoriteGalleries.map((gallery) => (
                  <Link key={gallery._id} to={`/galleries/${gallery._id}`}>
                    <Box
                      w="600px"
                      bg="gray.100"
                      borderRadius="md"
                      boxShadow="md"
                      overflow="hidden"
                      border="1px solid #ccc"
                      _hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
                      transition="all 0.2s"
                      cursor="pointer"
                      display="flex"
                      flexDirection="column"
                    >
                      <Box w="100%" h="220px" bg="gray.300" mb={3} overflow="hidden">
                        {gallery.coverPhoto ? (
                          <Image
                            src={gallery.coverPhoto}
                            alt={gallery.name}
                            objectFit="cover"
                            w="100%"
                            h="100%"
                          />
                        ) : gallery.products?.[0]?.images?.[0] ? (
                          <Image
                            src={gallery.products[0].images[0]}
                            alt={gallery.name}
                            objectFit="cover"
                            w="100%"
                            h="100%"
                          />
                        ) : (
                          <Flex align="center" justify="center" h="100%" bg="gray.400">
                            <Text>No cover photo</Text>
                          </Flex>
                        )}
                      </Box>
                      <Box
                        textAlign="center"
                        py={2}
                        px={2}
                        display="flex"
                        flexDir="column"
                        justifyContent="space-between"
                        flex="1"
                      >
                        <Text fontWeight="bold" mb={1}>
                          {gallery.name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {gallery.products?.length || 0} products
                        </Text>
                        <Text fontSize="sm">
                          <strong>Creator:</strong> {gallery.owner?.firstName}{' '}
                          {gallery.owner?.lastName}
                        </Text>
                      </Box>
                    </Box>
                  </Link>
                ))}
              </Flex>
            )}
          </TabPanel>

          {}
     <TabPanel>
            {favoriteProducts.length === 0 ? (
              <Text>No favorite products.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }}>
                {favoriteProducts.map((product) => (
                  <Link to={`/products/${product._id}`} key={product._id}>
                    <Box
                      bg="gray.100"
                      borderRadius="md"
                      boxShadow="md"
                      overflow="hidden"
                      w="270px"
                      border="1px solid #ccc"
                      _hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
                      transition="all 0.2s"
                      cursor="pointer"
                    >
                      <Box h="270px" w="270px" bg="gray.200">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            w="100%"
                            h="100%"
                            objectFit="cover"
                          />
                        ) : (
                          <Flex align="center" justify="center" h="100%" color="gray.500">
                            <Text>No image</Text>
                          </Flex>
                        )}
                      </Box>

                      <Box textAlign="center" py={3} px={2}>
                        <Text fontWeight="bold" noOfLines={1}>
                          {product.title}
                        </Text>
                        {product.forSale && product.price > 0 && (
                          <Text fontSize="sm" color="green.600">
                            For Sale: {product.price} EUR
                          </Text>
                        )}
                        {product.forSale && product.price > 0 && (
                          <Text fontSize="sm" color="gray.600">
                            Stock: {product.quantity}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  </Link>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>

          {}
         <TabPanel>
            {favoriteArticles.length === 0 ? (
              <Text>No favorite articles.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5} mt={6}>
                {favoriteArticles.map((article) => (
                  <Link to={`/articles/${article._id}`} key={article._id}>
                    <Box
                      borderWidth="1px"
                      borderRadius="md"
                      p={4}
                      bg="white"
                      shadow="sm"
                      _hover={{ boxShadow: 'md', transform: 'scale(1.01)' }}
                      transition="all 0.2s"
                      h="100%"
                      sx={{
                        backgroundImage: `
                          repeating-linear-gradient(to bottom, transparent, transparent 29px, #cbd5e0 30px),
                          linear-gradient(to right, #dc2626 1px, transparent 2px)
                        `,
                        backgroundSize: '100% 30px, 1px 100%',
                        backgroundPosition: 'left 40px top, left 40px top',
                        backgroundRepeat: 'repeat-y, no-repeat',
                      }}
                    >
                      {article.coverImage && (
                        <Image
                          src={article.coverImage}
                          alt="Cover"
                          w="100%"
                          h="150px"
                          objectFit="cover"
                          borderRadius="md"
                          mb={3}
                        />
                      )}
                      {article.category && (
                        <Text fontSize="sm" color="teal.600">
                          Category: {article.category}
                        </Text>
                      )}
                      <Text fontWeight="bold" fontSize="xl">
                        {article.title}
                      </Text>
                      {article.subtitle && (
                        <Text fontSize="md" color="gray.600">
                          {article.subtitle}
                        </Text>
                      )}
                      <Text fontSize="sm" mt={2} color="gray.500" noOfLines={2}>
                        {article.content?.replace(/<[^>]+>/g, '').slice(0, 50)}...
                      </Text>
                      <Text fontSize="xs" color="gray.400" mt={2}>
                        {new Date(article.createdAt).toLocaleString()}
                      </Text>
                    </Box>
                  </Link>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default FavoritesPage;