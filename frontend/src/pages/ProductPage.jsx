'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Stack,
  Spinner,
  Textarea,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProductPage() {
  const { id } = useParams(); // Hook-ul este apelat la nivel de top
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const fetchProductAndComments = async () => {
    setIsLoading(true);
    try {
      const fetchProduct = async () => {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product details");
        const data = await res.json();
        setProduct(data.product);
      };

      const fetchComments = async () => {
        const res = await fetch(`/api/comments?resourceId=${id}&resourceType=Product`);
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data = await res.json();
        setComments(data);
      };

      await Promise.all([fetchProduct(), fetchComments()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProductAndComments();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          userId: "64a7c92b5f4c91a4d80f7b16",
          resourceId: id,
          resourceType: "Product",
        }),
      });

      if (!res.ok) throw new Error("Failed to add comment");

      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err.message);
    }
  };

  return (
    <Flex align={'center'} justify={'center'} py={6}>
      <VStack spacing={8} w={'full'} maxW={'container.md'}>
        {isLoading ? (
          <Spinner size="xl" />
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : product ? (
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
            <Box mt={8}>
              <Heading as="h2" size="md" mb={4}>
                Comments
              </Heading>
              <Stack spacing={4}>
                {comments.map((comment, index) => (
                  <Box
                    key={index}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    bg={useColorModeValue("gray.50", "gray.800")}
                  >
                    <Text>{comment.content}</Text>
                  </Box>
                ))}
                {comments.length === 0 && <Text color="gray.500">No comments yet.</Text>}
              </Stack>
              <Box mt={4}>
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button
                  mt={2}
                  colorScheme="purple"
                  onClick={handleAddComment}
                  isDisabled={!newComment.trim()}
                >
                  Add Comment
                </Button>
              </Box>
            </Box>
          </Stack>
        ) : (
          <Text color="gray.500">No product found.</Text>
        )}
      </VStack>
    </Flex>
  );
}
