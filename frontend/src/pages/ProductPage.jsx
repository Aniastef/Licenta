'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Stack,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useShowToast from '../hooks/useShowToast';

export default function ProductPage() {
  const { id } = useParams(); // Hook-ul este apelat la nivel de top
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch product details');
      }
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  return (
    <Flex align={'center'} justify={'center'} py={6}>
      <VStack spacing={8} w={'full'} maxW={'container.md'}>
        {isLoading ? (
          <Spinner size="xl" />
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : product ? ( // Asigură-te că `product` nu este null
          <Stack spacing={3}>
            {product.images?.length > 0 ? (
              <Stack direction="row" spacing={4} overflowX="auto">
                {product.images.map((image, index) => (
                  <Image
                    key={index}
                    src={image || 'https://via.placeholder.com/400'}
                    alt={`${product.name} - Image ${index + 1}`}
                    borderRadius="md"
                    objectFit="contain"
                    w="200px"
                    h="150px"
                  />
                ))}
              </Stack>
            ) : (
              <Image
                src="https://via.placeholder.com/400"
                alt="Placeholder"
                borderRadius="md"
                objectFit="contain"
                w="800px"
                h="600px"
              />
            )}
            <Heading as="h1" size="lg">
              {product.name}
            </Heading>
            <Text fontSize="lg" color="gray.600">
              {product.description || 'No description available.'}
            </Text>
            <Text fontWeight="bold" fontSize="xl" color="purple.500">
              ${product.price}
            </Text>
            <Button
              mt={4}
              colorScheme="purple"
              onClick={() => navigate(-1)} // Navighează înapoi
            >
              Go Back
            </Button>
          </Stack>
        ) : (
          <Text color="gray.500">No product found.</Text>
        )}
      </VStack>
    </Flex>
  );
}
