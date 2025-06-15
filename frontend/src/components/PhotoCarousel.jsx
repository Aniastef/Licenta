import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Image, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Carousel = () => {
  const [topRated, setTopRated] = useState([]);

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        const res = await fetch('/api/products', {
          credentials: 'include',
        });
        const data = await res.json();
        const sorted = data.products
          .filter((p) => p.images && p.images.length > 0)
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 10);
        setTopRated(sorted);
      } catch (err) {
        console.error('Error loading top-rated products:', err);
      }
    };
    fetchTopRated();
  }, []);

  const scrollLeft = () => {
    const carousel = document.getElementById('carousel');
    carousel.scrollLeft -= 200;
  };

  const scrollRight = () => {
    const carousel = document.getElementById('carousel');
    carousel.scrollLeft += 200;
  };

  return (
    <Box position="relative" w="full">
      <Button
        onClick={scrollLeft}
        position="absolute"
        left="10px"
        top="50%"
        transform="translateY(-50%)"
        zIndex="2"
        bg="white"
        boxShadow="md"
        _hover={{ bg: 'gray.100' }}
      >
        {'<'}
      </Button>

      <Flex
        id="carousel"
        overflowX="scroll"
        scrollBehavior="smooth"
        whiteSpace="nowrap"
        gap={6}
        px={8}
        py={8}
        css={{
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {topRated.map((product) => (
          <VStack key={product._id} minW="200px" spacing={3}>
            <Link to={`/products/${product._id}`}>
              <Image
                src={product.images[0]}
                alt={product.name}
                w="200px"
                h="200px"
                objectFit="cover"
                borderRadius="md"
              />
            </Link>
            <Text fontWeight="semibold" noOfLines={1}>
              {product.name}
            </Text>
            <Text color="yellow.500" fontSize="sm">
              {'★'.repeat(Math.round(product.averageRating)) +
                '☆'.repeat(5 - Math.round(product.averageRating))}{' '}
              ({product.averageRating}/5)
            </Text>
          </VStack>
        ))}
      </Flex>

      <Button
        onClick={scrollRight}
        position="absolute"
        right="10px"
        top="50%"
        transform="translateY(-50%)"
        zIndex="2"
        bg="white"
        boxShadow="md"
        _hover={{ bg: 'gray.100' }}
      >
        {'>'}
      </Button>
    </Box>
  );
};

export default Carousel;
