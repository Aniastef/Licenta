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
    <Box p={4} maxW="1900px" mx="auto">
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
          <Tab>Favorite Products</Tab>
          <Tab>Favorite Articles</Tab>
        </TabList>

        <TabPanels>
          {}
          <TabPanel>
            {favoriteGalleries.length === 0 ? (
              <Text>No favorite galleries.</Text>
            ) : (
              <Flex wrap="wrap" justify="center" gap={6}>
                {favoriteGalleries.map((gallery) => (
                  <Link key={gallery._id} to={`/galleries/${gallery._id}`}>
                    <Box
                      bg="gray.100"
                      borderRadius="md"
                      boxShadow="md"
                      overflow="hidden"
                      border="1px solid #ccc"
                      _hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
                      transition="all 0.2s"
                      cursor="pointer"
                    >
                      <Box w="100%" h="250px" bg="gray.300" mb={3} overflow="hidden">
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
                      <Box textAlign="center" py={2} px={2}>
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
              <Flex wrap="wrap" justify="center" gap={6}>
                {favoriteProducts.map((product) => (
                  <Link to={`/products/${product._id}`} key={product._id}>
                    <Box
                      w="220px"
                      bg="white"
                      borderRadius="md"
                      boxShadow="md"
                      overflow="hidden"
                      border="1px solid #e2e8f0"
                      _hover={{ boxShadow: 'lg', transform: 'scale(1.03)' }}
                      transition="all 0.2s"
                      cursor="pointer"
                      display="flex"
                      flexDirection="column"
                    >
                      <Box h="270px" bg="gray.100">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
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
                          {product.name}
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
              </Flex>
            )}
          </TabPanel>

          {}
          <TabPanel>
            {favoriteArticles.length === 0 ? (
              <Text>No favorite articles.</Text>
            ) : (
              <Flex wrap="wrap" justify="center" gap={6}>
                {favoriteArticles.map((article) => (
                  <Box
                    key={article._id}
                    w="320px"
                    bg="white"
                    borderRadius="md"
                    shadow="md"
                    border="1px solid #e2e8f0"
                    overflow="hidden"
                    transition="all 0.2s"
                    _hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
                    cursor="pointer"
                    onClick={() => (window.location.href = `/articles/${article._id}`)}
                  >
                    {}
                    {article.coverImage && (
                      <Image
                        src={article.coverImage}
                        alt="Cover"
                        w="100%"
                        h="200px"
                        objectFit="cover"
                        borderTopRadius="md"
                      />
                    )}

                    {}
                    <Box
                      px={4}
                      py={4}
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
                      {article.category && (
                        <Text fontSize="xs" color="teal.600" mb={1}>
                          {article.category}
                        </Text>
                      )}

                      <Text
                        fontWeight="bold"
                        fontSize="lg"
                        noOfLines={2}
                        _hover={{ textDecoration: 'underline', color: 'blue.500' }}
                      >
                        {article.title}
                      </Text>

                      {article.subtitle && (
                        <Text fontSize="sm" color="gray.600" noOfLines={2} mt={1}>
                          {article.subtitle}
                        </Text>
                      )}

                      <Text fontSize="sm" color="gray.500" mt={2}>
                        {article.content?.replace(/<[^>]+>/g, '').slice(0, 60)}...
                      </Text>

                      <Text fontSize="xs" color="gray.400" mt={2}>
                        {new Date(article.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>

                      <Button
                        as={RouterLink}
                        to={`/articles/${article._id}`}
                        size="sm"
                        variant="link"
                        colorScheme="blue"
                        mt={2}
                      >
                        View Details →
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Flex>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default FavoritesPage;
