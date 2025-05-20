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
removeFromCart(item.product._id, item.itemType);
    } else {
updateCartQuantity(item.product._id, item.quantity - 1, item.itemType);
    }
  };

 const handleIncrease = (item) => {
  const maxQty =
    item.itemType === "Event"
      ? item.product.capacity
      : item.product.quantity;

  if (item.quantity >= maxQty) {
    setStockLimitItemId(item.product._id);
    return;
  }

  setStockLimitItemId(null);
  updateCartQuantity(item.product._id, item.quantity + 1, item.itemType);
};


const calculateTotal = () => {
  let total = 0;

  cart.forEach((item) => {
    const price = Number(item.product.price);
    const qty = Number(item.quantity);

    if (!isNaN(price) && !isNaN(qty)) {
      total += price * qty;
    }
  });

  return total;
};



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
          const isEvent = item.itemType === "Event";
const unitPrice = Number(item.product.price);
const totalPrice = (unitPrice * item.quantity).toFixed(2);
const maxQty = isEvent ? item.product.capacity : item.product.quantity;

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
              
           {item.product.images?.[0] || item.product.coverImage ? (
  <Image
    src={item.product.images?.[0] || item.product.coverImage}
    alt={item.product.name}
    boxSize="120px"
    borderRadius="lg"
    objectFit="cover"
  />
) : (
  <Flex
    boxSize="120px"
    borderRadius="lg"
    bg="gray.300"
    justify="center"
    align="center"
    textAlign="center"
    p={2}
  >
    <Text fontWeight="bold" fontSize="sm" color="gray.700">
      {item.product.name}
    </Text>
  </Flex>
)}


              

              <Box flex="1" mx={4}>
<Link to={isEvent ? `/events/${item.product._id}` : `/products/${item.product._id}`}>
                  <Text fontWeight="bold" fontSize="xl">
                    {item.product.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500" fontStyle="italic">
  {isEvent ? "Event Ticket" : "Product"}
</Text>

                </Link>
                {item.product.user && (
  <Text fontSize="sm" color="gray.600" mt={1}>
    by {item.product.user.firstName} {item.product.user.lastName}
  </Text>
)}


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
  isDisabled={item.quantity >= maxQty}
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
{unitPrice} EUR × {item.quantity}
                </Text>
               <Text fontSize="2xl" color="green.600" fontWeight="bold">
  {totalPrice} EUR
</Text>

                <IconButton
                  icon={<CloseIcon />}
                  colorScheme="red"
                  variant="solid"
                  borderRadius="12px"
onClick={() => removeFromCart(item.product._id, item.itemType)}
                  aria-label="Remove item"
                />
              </VStack>
            </Flex>
          );
        })}
      </VStack>

      {/* Totals */}
      <Box mt={8} textAlign="right">
       <Text fontSize="2xl" fontWeight="bold">
  Total:
</Text>
<Text fontSize="xl" fontWeight="semibold">
  {calculateTotal().toFixed(2)} EUR
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
