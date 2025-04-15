import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  VStack,
  Spinner,
  Image,
  HStack,
  Badge,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
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

  const filterOrdersByStatus = (status) =>
    orders.filter((order) => order.status === status);

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${user._id}/cancel/${orderId}`, {
        method: "PATCH",
        credentials: "include",
      });

      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: "Cancelled" } : order
          )
        );
      } else {
        console.error("Failed to cancel order");
      }
    } catch (err) {
      console.error("Error cancelling order:", err.message);
    }
  };

  const OrderAccordion = ({ orders }) => (
    <Accordion allowToggle>
      {orders.map((order) => {
        const total = Array.isArray(order.products)
          ? order.products.reduce((acc, p) => acc + p.price * p.quantity, 0)
          : order.price * order.quantity;

        return (
          <AccordionItem key={order._id}>
            <h2>
              <AccordionButton _expanded={{ bg: "teal.100" }}>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Comanda #{order._id.slice(-6)}</Text>
                  <Text fontSize="sm">
                    Data: {new Date(order.date).toLocaleDateString()}
                  </Text>
                  <Text fontSize="sm">Total: {total.toFixed(2)} RON</Text>
                </Box>
                <Badge
                  colorScheme={
                    order.status === "Delivered"
                      ? "green"
                      : order.status === "Pending"
                      ? "orange"
                      : "red"
                  }
                >
                  {order.status}
                </Badge>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="start">
                {Array.isArray(order.products) ? (
                  order.products.map((item, idx) => (
                    <HStack key={idx} spacing={4} align="start" w="100%">
                      <Image
                        src={item.product?.images?.[0] || "/placeholder.jpg"}
                        alt={item.product?.name}
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      <VStack align="start" spacing={1} flex="1">
                        <Text fontWeight="bold">{item.product?.name}</Text>
                        <Text fontSize="sm">Preț unitar: {item.price} RON</Text>
                        <Text fontSize="sm">Cantitate: {item.quantity}</Text>
                        <Text fontWeight="semibold">
                          Total: {(item.price * item.quantity).toFixed(2)} RON
                        </Text>
                      </VStack>
                    </HStack>
                  ))
                ) : (
                  <HStack spacing={4} align="start" w="100%">
                    <Image
                      src={order.product?.images?.[0] || "/placeholder.jpg"}
                      alt={order.product?.name}
                      boxSize="100px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <VStack align="start" spacing={1} flex="1">
                      <Text fontWeight="bold">{order.product?.name}</Text>
                      <Text fontSize="sm">Preț unitar: {order.price} RON</Text>
                      <Text fontSize="sm">Cantitate: {order.quantity}</Text>
                      <Text fontWeight="semibold">
                        Total: {(order.price * order.quantity).toFixed(2)} RON
                      </Text>
                    </VStack>
                  </HStack>
                )}
                <Divider />
                <Text fontWeight="semibold">Livrare:</Text>
                <Text fontSize="sm">🏠 {order.address}, {order.city}</Text>
                <Text fontSize="sm">📞 {order.phone}</Text>
                <Text fontSize="sm">
                  💳 {order.paymentMethod === "cash"
                    ? "Cash"
                    : order.paymentMethod === "online"
                    ? "Card online"
                    : "Card la livrare"}
                </Text>
                <Text fontSize="sm">
                  🚚 {order.deliveryMethod === "easybox" ? "EasyBox" : "Courier"}
                </Text>
                {order.status === "Pending" && (
                  <Button
                    colorScheme="red"
                    size="sm"
                    mt={2}
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    Anulează Comanda
                  </Button>
                )}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );

  return (
    <Box p={5}>
      <Text fontSize="3xl" fontWeight="bold" mb={6}>
        My Orders
      </Text>

      {loading ? (
        <Spinner size="xl" />
      ) : orders.length === 0 ? (
        <Text>No orders found.</Text>
      ) : (
        <Tabs variant="enclosed" colorScheme="teal" isFitted>
          <TabList>
            <Tab>Pending</Tab>
            <Tab>Delivered</Tab>
            <Tab>Cancelled</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <OrderAccordion orders={filterOrdersByStatus("Pending")} />
            </TabPanel>
            <TabPanel>
              <OrderAccordion orders={filterOrdersByStatus("Delivered")} />
            </TabPanel>
            <TabPanel>
              <OrderAccordion orders={filterOrdersByStatus("Cancelled")} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </Box>
  );
};

export default OrdersPage;
