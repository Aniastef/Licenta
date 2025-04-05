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
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


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

  const groupedOrdersList = orders;

  const filterOrdersByStatus = (status) =>
    groupedOrdersList.filter((order) => order.status === status);

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${user._id}/cancel/${orderId}`, {
        method: "PATCH",
        credentials: "include",
      });
  
      if (response.ok) {
        // 🔁 Updatăm local doar statusul
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
  

  return (
    <Box p={5}>
      <Text fontSize="3xl" fontWeight="bold" mb={6}>
        My Orders
      </Text>

      {loading ? (
        <Spinner size="xl" />
      ) : groupedOrdersList.length === 0 ? (
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
              {filterOrdersByStatus("Pending").map((order) => (
                <OrderCard key={order._id} order={order} onCancel={handleCancelOrder} />
              ))}
            </TabPanel>
            <TabPanel>
              {filterOrdersByStatus("Delivered").map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </TabPanel>
            <TabPanel>
              {filterOrdersByStatus("Cancelled").map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </Box>
  );
};

const generateInvoicePDF = (order) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Factura Comandă", 14, 22);

  doc.setFontSize(12);
  doc.text(`Comandat de: ${order.firstName} ${order.lastName}`, 14, 32);
  doc.text(`Adresă: ${order.address}, ${order.postalCode} ${order.city}`, 14, 38);
  doc.text(`Telefon: ${order.phone}`, 14, 44);
  doc.text(`Data: ${new Date(order.date).toLocaleDateString()}`, 14, 50);
  doc.text(`Metodă plată: ${{
    online: "Card online",
    card_on_delivery: "Card la livrare",
    cash: "Cash la livrare",
  }[order.paymentMethod] || "Necunoscut"}`, 14, 56);

  autoTable(doc, {
    startY: 65,
    head: [["Produs", "Cantitate", "Preț unitar (RON)", "Total"]],
    body: [
      [
        order.product?.name || "Produs",
        order.quantity,
        order.price.toFixed(2),
        (order.price * order.quantity).toFixed(2),
      ],
    ],
  });

  doc.text(`Total general: ${(order.price * order.quantity).toFixed(2)} RON`, 14, doc.lastAutoTable.finalY + 10);

  doc.save(`factura_${order._id}.pdf`);
};


// 🧩 Card detaliat pentru fiecare comandă
const OrderCard = ({ order, onCancel }) => (
  <Box
    borderWidth={1}
    borderRadius="xl"
    p={5}
    my={4}
    w="100%"
    maxW="600px"
    boxShadow="md"
    bg="white"
    _hover={{ boxShadow: "lg", transform: "scale(1.01)" }}
    transition="all 0.2s ease-in-out"
  >
    <HStack spacing={4}>
      <Image
        src={order.product?.images?.[0] || "https://via.placeholder.com/150"}
        alt={order.product?.name}
        boxSize="100px"
        objectFit="cover"
        borderRadius="md"
      />
      <VStack align="start" spacing={1} flex="1">
        <Text fontSize="xl" fontWeight="bold">
          {order.product?.name}
        </Text>
        <Badge
          colorScheme={
            order.status === "Delivered"
              ? "green"
              : order.status === "Pending"
              ? "orange"
              : order.status === "Cancelled"
              ? "red"
              : "gray"
          }
          fontSize="sm"
          px={2}
          py={1}
          borderRadius="md"
        >
          {order.status}
        </Badge>
        <Text fontSize="sm" color="gray.500">
          Ordered on: {new Date(order.date).toLocaleDateString()}
        </Text>
      </VStack>
    </HStack>

    <Divider my={3} />

    <VStack spacing={2} align="start">
      <HStack justify="space-between" w="100%">
        <Text fontWeight="medium">Unit Price:</Text>
        <Text>{order.price} RON</Text>
      </HStack>
      <HStack justify="space-between" w="100%">
        <Text fontWeight="medium">Quantity:</Text>
        <Text>{order.quantity}</Text>
      </HStack>
      <HStack justify="space-between" w="100%">
        <Text fontWeight="bold">Total:</Text>
        <Text>{(order.price * order.quantity).toFixed(2)} RON</Text>
      </HStack>
    </VStack>

    {(order.firstName || order.paymentMethod) && (
      <>
        <Divider my={3} />
        <Text fontWeight="semibold" mb={1}>Delivery Info</Text>
        <VStack spacing={1} align="start" fontSize="sm">
          {order.firstName && (
            <Text>
              👤 {order.firstName} {order.lastName}
            </Text>
          )}
          {order.address && (
            <Text>
              🏠 {order.address}, {order.postalCode} {order.city}
            </Text>
          )}
          {order.phone && (
            <Text>
              📞 {order.phone}
            </Text>
          )}
          <Text>
            🚚 Delivery: {order.deliveryMethod === "easybox" ? "EasyBox" : "Courier"}
          </Text>
          <Text>
            💳 Payment: {{
              online: "Card (online)",
              cash: "Cash on delivery",
              card_on_delivery: "Card at delivery",
            }[order.paymentMethod] || "Unknown"}
          </Text>
        </VStack>
      </>
    )}
  
  {order.status !== "Cancelled" && (
  <Button
    onClick={() => generateInvoicePDF(order)}
    colorScheme="blue"
    mt={3}
    size="sm"
  >
    Descarcă Factură PDF
  </Button>
)}

    {order.status === "Pending" && onCancel && (
      <Box mt={4}>
        <Button colorScheme="red" onClick={() => onCancel(order._id)}>
          Cancel Order
        </Button>
      </Box>
    )}
  </Box>
);

export default OrdersPage;
