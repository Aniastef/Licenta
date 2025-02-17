import React from "react";
import { useCart } from "../components/CartContext";
import { Box, Button, Text, VStack, Image, HStack, Divider, Tag, Wrap } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // ✅ Adaugă import

const CartPage = () => {
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate(); // ✅ Funcție pentru redirecționare

  console.log("Cart contents:", cart); // 🛠️ Debugging

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + item.product.price, 0).toFixed(2);
  };

  return (
    <VStack spacing={6} align="center" p={5} width="80%" mx="auto">
      <Text fontSize="2xl" fontWeight="bold">
        Shopping Cart
      </Text>

      {cart.length === 0 ? (
        <Text>Your cart is empty.</Text>
      ) : (
        cart.map((item, index) => (
          <Box key={index} p={4} borderWidth={1} borderRadius={8} width="100%">
            <HStack align="start" spacing={5}>
              {/* Imagine produs */}
              <Image
                src={item.product.images?.[0] || "/placeholder.jpg"}
                alt={item.product.name}
                boxSize="120px"
                objectFit="cover"
                borderRadius="md"
              />

              {/* Informații despre produs */}
              <VStack align="start" flex="1">
                <Text fontSize="lg" fontWeight="bold">
                  {item.product.name}
                </Text>
                <Text fontSize="md" color="gray.600">
                  {item.product.price.toFixed(2)} RON
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {item.product.description.slice(0, 100)}...
                </Text>

                {/* Tag-uri produs */}
                <Wrap>
                  {item.product.tags?.map((tag, i) => (
                    <Tag key={i} colorScheme="blue">
                      {tag}
                    </Tag>
                  ))}
                </Wrap>
              </VStack>

              {/* Buton de ștergere */}
              <Button colorScheme="red" onClick={() => removeFromCart(item.product._id)}>
                Remove
              </Button>
            </HStack>
          </Box>
        ))
      )}

      <Divider />

      {/* Total coș */}
      <Text fontSize="xl" fontWeight="bold">
        Total: {calculateTotal()} RON
      </Text>

      {/* Buton checkout */}
      {cart.length > 0 && (
       <Button colorScheme="green" onClick={() => navigate("/checkout")}>
       Go to Checkout
     </Button>
      )}
    </VStack>
  );
};

export default CartPage;
