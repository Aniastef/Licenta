import { Button, Divider, Flex, Spinner, Text, useToast, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CommentsSection from '../components/CommentsSection';
import { Select } from '@chakra-ui/react';
import ReviewsSection from '../components/ReviewsSection';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('reviews');

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch product details');
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
    <Flex direction="column">
      <ProductCard product={product} />
      <Divider my={4} />

      <Flex gap={4} ml={20} mt={6} mb={6} px={4}>
        <Button
          bg={activeSection === 'reviews' ? 'yellow.300' : 'gray.200'}
          onClick={() => setActiveSection('reviews')}
        >
          See reviews
        </Button>
        <Button
          bg={activeSection === 'comments' ? 'blue.300' : 'gray.200'}
          onClick={() => setActiveSection('comments')}
        >
          See comments
        </Button>
      </Flex>

      {activeSection === 'reviews' && <ReviewsSection productId={id} />}
      {activeSection === 'comments' && <CommentsSection resourceId={id} resourceType="Product" />}
      <Divider my={4} />
    </Flex>
  );
}
