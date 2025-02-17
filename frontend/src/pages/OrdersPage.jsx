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
                const response = await fetch(`/api/orders/${user._id}`);
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

    

    return (
        <VStack spacing={4} align="center" p={5}>
            <Text fontSize="2xl">Your Orders</Text>
            {loading ? (
                <Spinner />
            ) : orders.length === 0 ? (
                <Text>No orders found.</Text>
            ) : (
                orders.map((order) => (
                    <Box key={order._id} p={4} borderWidth={1} borderRadius={8}>
                        <Text>{order.product.name} - {order.price} RON</Text>
                        <Text>Status: {order.status}</Text>
                    </Box>
                ))
            )}
        </VStack>
    );
};

export default OrdersPage;
