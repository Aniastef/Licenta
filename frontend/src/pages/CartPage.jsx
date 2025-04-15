import {
  Box,
  Button,
  Flex,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCart } from "../components/CartContext";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const CartPage = () => {
  const { cart, updateCartQuantity, removeFromCart } = useCart();
  const [stockLimitItemId, setStockLimitItemId] = useState(null); // 🆕
  const navigate = useNavigate();

  const handleDecrease = (item) => {
    setStockLimitItemId(null); // 🧹 curățăm eroarea dacă se scade
    if (item.quantity <= 1) {
      removeFromCart(item.product._id);
    } else {
      updateCartQuantity(item.product._id, item.quantity - 1);
    }
  };

  const handleIncrease = (item) => {
    const max = item.product.quantity;
    if (item.quantity >= max) {
      setStockLimitItemId(item.product._id); // 🚨 marcăm doar produsul respectiv
      return;
    }
    setStockLimitItemId(null);
    updateCartQuantity(item.product._id, item.quantity + 1);
  };

  const calculateTotal = () => {
    return cart
      .reduce((sum, item) => {
        const price = Number(item.product.price);
        const qty = Number(item.quantity);
        return sum + (isNaN(price) || isNaN(qty) ? 0 : price * qty);
      }, 0)
      .toFixed(2);
  };

  return (
    <Box p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Coșul meu
      </Text>
      <VStack spacing={4} align="stretch">
        {Array.isArray(cart) &&
          cart.map((item) => {
            const isStockLimit = item.quantity >= item.product.quantity;

            return (
              <Box
                key={`${item._id}-${item.product._id}`}
                p={4}
                borderWidth={1}
                borderRadius="lg"
              >
                <Flex direction={{ base: "column", md: "row" }} gap={4}>
                <Link to={`/products/${item.product._id}`}>

                  <Image
                    boxSize="100px"
                    src={item.product.images?.[0] || "https://i.pravatar.cc/150"}
                    fallbackSrc="https://i.pravatar.cc/150"
                    alt={item.product.name}
                    objectFit="cover"
                    borderRadius="md"
                  />
                   </Link>
                  <Box>
                  <Link to={`/products/${item.product._id}`}>

                    <Text fontWeight="bold">{item.product.name}</Text>
                    </Link>

                    <Text>Preț: {item.product.price} RON</Text>
                    <Text>Cantitate: {item.quantity}</Text>

                    <Flex mt={2} gap={2}>
                      <Button size="sm" onClick={() => handleDecrease(item)}>
                        -
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleIncrease(item)}
                        isDisabled={isStockLimit}
                      >
                        +
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => removeFromCart(item.product._id)}
                      >
                        Șterge
                      </Button>
                    </Flex>

                    {stockLimitItemId === item.product._id && (
                      <Text color="red.500" fontSize="sm" mt={2}>
                        Ai atins limita de stoc disponibil
                      </Text>
                    )}
                  </Box>
                </Flex>
              </Box>
            );
          })}
      </VStack>

      <Text fontSize="xl" mt={6} fontWeight="semibold">
        Total: {calculateTotal()} RON
      </Text>
      {cart.length > 0 && (
  <Button
    mt={4}
    colorScheme="green"
    onClick={() => navigate("/checkout")}
  >
    Go to Checkout
  </Button>
)}


    </Box>
  );
};

export default CartPage;
