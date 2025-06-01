// __mocks__/ProductCard.jsx
import React from 'react';
import { Button, Text, Box } from '@chakra-ui/react';
import { useCart } from '../components/CartContext'; // Adjust path if needed

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  if (!product) return <Box>Loading Product...</Box>;

  return (
    <Box data-testid="product-card">
      <Text data-testid="product-title">{product.name}</Text>
      <Text data-testid="product-price">{product.price} EUR</Text>
      <Button
        data-testid="add-to-cart-button"
        onClick={() => addToCart({ product, quantity: 1 })}
      >
        Add to Cart
      </Button>
    </Box>
  );
};

export default ProductCard;