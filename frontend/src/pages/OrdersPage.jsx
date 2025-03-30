import React, { useEffect, useState } from "react";
import { Box, Text, VStack, Spinner } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const OrdersPage = () => {
  const user = useRecoilValue(userAtom);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/orders/${user._id}`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) setOrders(data.orders);
        else console.error("Failed to fetch orders");
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchOrders();
  }, [user]);

  // 🔁 Grupare comenzilor după produs
  const groupedOrders = orders.reduce((acc, order) => {
    const productId = order.product?._id;
    if (!productId) return acc;

    if (!acc[productId]) {
      acc[productId] = { ...order, quantity: order.quantity || 1 };
    } else {
      acc[productId].quantity += order.quantity || 1;
    }
    return acc;
  }, {});

  return (
    <VStack spacing={4} align="center" p={5}>
      <Text fontSize="2xl">Your Orders</Text>
      {loading ? (
        <Spinner />
      ) : Object.keys(groupedOrders).length === 0 ? (
        <Text>No orders found.</Text>
      ) : (
        Object.values(groupedOrders).map((order) => (
          <Box key={order.product._id} p={4} borderWidth={1} borderRadius={8}>
            <Text fontWeight="bold">{order.product?.name}</Text>
            <Text>
              {order.price} RON x {order.quantity} ={" "}
              {(order.price * order.quantity).toFixed(2)} RON
            </Text>
            <Text>Status: {order.status}</Text>
          </Box>
        ))
      )}
    </VStack>
  );
};

export default OrdersPage;
