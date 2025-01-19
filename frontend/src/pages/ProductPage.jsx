
import { Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CommentsSection from '../components/CommentsSection';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("Failed to fetch product details");
      const data = await res.json();
      setProduct(data.product);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  return (
    <Flex align={'center'} justify={'center'} py={6}>
      <VStack spacing={8} w={'full'} maxW={'container.md'}>
        {isLoading ? (
          <Spinner size="xl" />
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : product ? (
          <>
            <ProductCard product={product} />
            <CommentsSection resourceId={id} />
          </>
        ) : (
          <Text color="gray.500">No product found.</Text>
        )}
      </VStack>
    </Flex>
  );
}
