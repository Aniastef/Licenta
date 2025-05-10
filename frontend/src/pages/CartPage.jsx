import {
  Box,
  Button,
  Flex,
  Image,
  Text,
  VStack,
  HStack,
  IconButton,
  Input,
  Circle,
} from "@chakra-ui/react";
import { useCart } from "../components/CartContext";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CloseIcon } from "@chakra-ui/icons";

const CartPage = () => {
  const { cart, updateCartQuantity, removeFromCart } = useCart();
  const [stockLimitItemId, setStockLimitItemId] = useState(null);
  const navigate = useNavigate();

  const handleDecrease = (item) => {
    setStockLimitItemId(null);
    if (item.quantity <= 1) {
      removeFromCart(item.product._id);
    } else {
      updateCartQuantity(item.product._id, item.quantity - 1);
    }
  };

  const handleIncrease = (item) => {
    if (item.quantity >= item.product.quantity) {
      setStockLimitItemId(item.product._id);
      return;
    }
    setStockLimitItemId(null);
    updateCartQuantity(item.product._id, item.quantity + 1);
  };

  const calculateTotal = () =>
    cart
      .reduce((sum, item) => {
        const price = Number(item.product.price);
        const qty = Number(item.quantity);
        return sum + (isNaN(price) || isNaN(qty) ? 0 : price * qty);
      }, 0)
      .toFixed(2);

  return (
    <Box p={8}>
      
      <Flex justify="space-between" align="center" >
      <Text fontSize="3xl" fontWeight="bold" mb={2}>
        My Cart
      </Text>
       <Flex right={4} gap={2}>
       
          <Circle size="30px" bg="yellow.400" />
          <Circle size="30px" bg="green.400" />
         
        </Flex>
      </Flex>

      <VStack spacing={6} align="stretch">
        {cart.map((item) => {
          const unitPrice = Number(item.product.price);
          const totalPrice = (unitPrice * item.quantity).toFixed(2);

          return (
            <Flex
              key={item.product._id}
              bg="gray.100"
              borderRadius="xl"
              p={4}
              align="center"
              justify="space-between"
              position="relative"
            >
              
              <Image
                src={item.product.images?.[0] || "https://i.pravatar.cc/150"}
                alt={item.product.name}
                boxSize="120px"
                borderRadius="lg"
                objectFit="cover"
              />
              

              <Box flex="1" mx={4}>
                <Link to={`/products/${item.product._id}`}>
                  <Text fontWeight="bold" fontSize="xl">
                    {item.product.name}
                  </Text>
                </Link>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  by {item.product.user?.firstName} {item.product.user?.lastName}
                </Text>

                <Box mt={3}>
                  <Text fontSize="xs" color="gray.600">
                    Quantity
                  </Text>
                  <HStack spacing={2} maxW="160px" mt={1}>
                    <Input
                      size="sm"
                      value={item.quantity}
                      readOnly
                      textAlign="center"
                      width="50px"
                      bg="white"
                    />
                    <Button size="sm" onClick={() => handleDecrease(item)}>
                      -
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleIncrease(item)}
                      isDisabled={item.quantity >= item.product.quantity}
                    >
                      +
                    </Button>
                  </HStack>
                  {stockLimitItemId === item.product._id && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      Ai atins limita de stoc disponibil
                    </Text>
                  )}
                </Box>
              </Box>

              <VStack spacing={2} align="end">
                <Text fontSize="lg" color="gray.600">
                  {unitPrice} RON × {item.quantity}
                </Text>
                <Text fontSize="2xl" color="green.600" fontWeight="bold">
                  {totalPrice} RON
                </Text>
                <IconButton
                  icon={<CloseIcon />}
                  colorScheme="red"
                  variant="solid"
                  borderRadius="12px"
                  onClick={() => removeFromCart(item.product._id)}
                  aria-label="Remove item"
                />
              </VStack>
            </Flex>
          );
        })}
      </VStack>

      {/* Totals */}
      <Box mt={8} textAlign="right">
        <Text fontSize="xl" fontWeight="semibold">
          Total: {calculateTotal()} lei
        </Text>
        <Text fontSize="sm" mt={1}>
          + shipping costs may apply
        </Text>
        {cart.length > 0 && (
          <Button
            mt={4}
            colorScheme="green"
            onClick={() => navigate("/checkout")}
          >
            Go to checkout
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CartPage;
