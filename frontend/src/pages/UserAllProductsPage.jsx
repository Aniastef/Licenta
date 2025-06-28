import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  Input,
  Select,
  Checkbox,
  CheckboxGroup,
  Stack,
  Image,
  Spinner,
  Heading,
  Button,
  SimpleGrid,
  Circle,
} from '@chakra-ui/react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';

const UserAllProductsPage = () => {
  const { username } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('latest');
  const [selectedMediaTypes, setSelectedMediaTypes] = useState([]);
  const [saleStatuses, setSaleStatuses] = useState([]);
  const [user, setUser] = useState(null);
  const currentUser = useRecoilValue(userAtom);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProducts();
  }, [username]);

  const fetchUserProducts = async () => {
    try {
      const res = await fetch(`/api/products/user/${username}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
      if (data.user) setUser(data.user);
    } catch (err) {
      console.error('Error fetching user products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let updated = [...products];

    if (searchTerm.trim()) {
      updated = updated.filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (sortOption === 'price-asc') {
      updated.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOption === 'price-desc') {
      updated.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (selectedMediaTypes.length > 0) {
      updated = updated.filter((p) => {
        return selectedMediaTypes.some((type) => {
          if (type === 'images') return Array.isArray(p.images) && p.images.length > 0;
          if (type === 'videos') return Array.isArray(p.videos) && p.videos.length > 0;
          if (type === 'audios') return Array.isArray(p.audios) && p.audios.length > 0;
          if (type === 'writing') return Array.isArray(p.writing) && p.writing.length > 0;
          return false;
        });
      });
    }

    if (saleStatuses.length > 0) {
      updated = updated.filter((p) => {
        const isForSale = p.price > 0;
        return (
          (isForSale && saleStatuses.includes('forSale')) ||
          (!isForSale && saleStatuses.includes('notForSale'))
        );
      });
    }

    setFilteredProducts(updated);
  }, [searchTerm, sortOption, selectedMediaTypes, saleStatuses, products]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        setFilteredProducts((prev) => prev.filter((p) => p._id !== productId));
      } else {
        const errorData = await res
          .json()
          .catch(() => ({ error: 'Failed to delete product (unknown error)' }));
        alert(errorData.error || `Failed to delete product. Status: ${res.status}`);
      }
    } catch (err) {
      console.error('Error deleting product:', err.message);
      alert('Error deleting product due to network or unexpected issue.');
    }
  };

  return (
    <Box p={4} maxW="1200px" mx="auto">
      <Flex justifyContent="center" alignItems="center" px={4} pt={4} position="relative">
        <Text fontWeight="bold" fontSize="2xl" textAlign="center">
          {user ? `${user.firstName} ${user.lastName}'s artworks` : `${username}'s Products`}
        </Text>

        <Flex position="absolute" right={4} gap={2}>
          {currentUser?.username?.toLowerCase() === username?.toLowerCase() && (
            <Button
              colorScheme="orange"
              ml={5}
              mb={4}
              onClick={() => (window.location.href = '/create/product')}
            >
              Create new artwork
            </Button>
          )}

          <Circle size="30px" bg="yellow.400" />
          <Circle size="30px" bg="green.400" />
        </Flex>
      </Flex>
      <Flex mt={2} justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Input
          placeholder="Search artworks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="300px"
        />
        <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)} maxW="200px">
          <option value="latest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </Select>
        <CheckboxGroup value={saleStatuses} onChange={setSaleStatuses}>
          <Stack direction="row" spacing={4}>
            <Checkbox value="forSale">For Sale</Checkbox>
            <Checkbox value="notForSale">Not For Sale</Checkbox>
          </Stack>
        </CheckboxGroup>

        <CheckboxGroup value={selectedMediaTypes} onChange={setSelectedMediaTypes}>
          <Stack direction="row" spacing={4}>
            <Checkbox value="images">Image</Checkbox>
            <Checkbox value="videos">Video</Checkbox>
            <Checkbox value="audios">Audio</Checkbox>
            <Checkbox value="writing">Writing</Checkbox>
          </Stack>
        </CheckboxGroup>
      </Flex>

      {loading ? (
        <Flex justify="center">
          <Spinner size="xl" />
        </Flex>
      ) : filteredProducts.length === 0 ? (
        <Flex justify="center" mt={10}>
          <Text fontSize="xl" color="gray.500">
            No artworks found.
          </Text>
        </Flex>
      ) : filteredProducts.length === 1 ? (
        <Flex justify="center">
          {}
          {}
          <Box
            bg="gray.100"
            borderRadius="md"
            boxShadow="md"
            overflow="hidden"
            border="1px solid #ccc"
            _hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
            transition="all 0.2s"
            cursor="pointer"
            w="300px"
            onClick={() => navigate(`/products/${filteredProducts[0]._id}`)}
          >
            {}
            <Box h="270px" bg="gray.200">
              {filteredProducts[0].images?.[0] ? (
                <Image
                  src={filteredProducts[0].images[0]}
                  alt={filteredProducts[0].title}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
              ) : (
                <Flex
                  align="center"
                  justify="center"
                  h="100%"
                  color="gray.600"
                  fontWeight="bold"
                  fontSize="lg"
                >
                  {filteredProducts[0].title}
                </Flex>
              )}
            </Box>

            {}
            <Box py={3} px={2} textAlign="center">
              <Text fontWeight="bold" noOfLines={1}>
                {filteredProducts[0].title}
              </Text>
              {typeof filteredProducts[0].price === 'number' && filteredProducts[0].price > 0 && (
                <Text fontSize="sm" color="green.600">
                  Price: {filteredProducts[0].price} EUR
                </Text>
              )}

              {filteredProducts[0].quantity > 0 && (
                <Text fontSize="sm" color="gray.600">
                  Stock: {filteredProducts[0].quantity}
                </Text>
              )}

              {}
              {currentUser?._id === user?._id && (
                <Button
                  mt={2}
                  size="sm"
                  colorScheme="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProduct(filteredProducts[0]._id);
                  }}
                >
                  Delete
                </Button>
              )}
            </Box>
          </Box>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4} mt={6}>
          {filteredProducts.map((product) => (
            <Box
              key={product._id}
              bg="gray.100"
              borderRadius="md"
              boxShadow="md"
              overflow="hidden"
              border="1px solid #ccc"
              _hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
              transition="all 0.2s"
              cursor="pointer"
              onClick={() => navigate(`/products/${product._id}`)}
            >
              {}
              <Box h="270px" bg="gray.200">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                ) : (
                  <Flex
                    align="center"
                    justify="center"
                    h="100%"
                    color="gray.600"
                    fontWeight="bold"
                    fontSize="lg"
                  >
                    {product.title}
                  </Flex>
                )}
              </Box>

              {}
              <Box textAlign="center" py={3} px={2}>
                <Text fontWeight="bold" noOfLines={1}>
                  {product.title}
                </Text>
                {typeof product.price === 'number' && product.price > 0 && (
                  <Text fontSize="sm" color="green.600">
                    Price: {product.price} EUR
                  </Text>
                )}

                {product.quantity > 0 && (
                  <Text fontSize="sm" color="gray.600">
                    Stock: {product.quantity}
                  </Text>
                )}

                {}
                {currentUser?._id === user?._id && (
                  <Button
                    mt={2}
                    size="sm"
                    colorScheme="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProduct(product._id);
                    }}
                  >
                    Delete
                  </Button>
                )}
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default UserAllProductsPage;
