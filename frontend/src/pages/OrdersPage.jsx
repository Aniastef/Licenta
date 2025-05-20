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
  Circle,
  Flex,
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

const OrdersPage = () => {
  const user = useRecoilValue(userAtom);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("Pending");
  const [sortBy, setSortBy] = useState("date"); // Stare pentru criteriul de sortare
  const [sortDirection, setSortDirection] = useState({
    date: "desc", // Direcția implicită pentru data
    total: "desc", // Direcția implicită pentru total
  });
  
  const tabOptions = [
    { label: "Pending", color: "yellow", value: "Pending" },
    { label: "Delivered", color: "green", value: "Delivered" },
    { label: "Cancelled", color: "red", value: "Cancelled" },
  ];

  // Funcția pentru calcularea totalului unei comenzi
  const calculateTotal = (order) => {
    return Array.isArray(order.products)
      ? order.products.reduce((acc, p) => acc + p.price * p.quantity, 0)
      : order.price * order.quantity;
  };

  // Funcția de sortare a comenzilor
  const sortOrders = (orders) => {
    return orders.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortDirection.date === "asc"
          ? dateA - dateB
          : dateB - dateA; // Sortează crescător/descrescător
      } else if (sortBy === "total") {
        const totalA = calculateTotal(a);
        const totalB = calculateTotal(b);
        return sortDirection.total === "asc"
          ? totalA - totalB
          : totalB - totalA; // Sortează crescător/descrescător
      }
      return 0;
    });
  };
  
const generateTicket = async (order) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("🎫 Ticket Digital", 70, 25);
  doc.setFontSize(12);
  doc.text(`Comanda #${order._id}`, 14, 40);
  doc.text(`Data: ${new Date(order.date).toLocaleString()}`, 14, 48);

  order.products.forEach((item, idx) => {
    const yOffset = 60 + idx * 30;
    doc.setFontSize(14);
    doc.text(`${idx + 1}. ${item.product?.name || "Eveniment"}`, 14, yOffset);
    doc.setFontSize(12);
    doc.text(`Quantity: ${item.quantity}`, 14, yOffset + 6);
    doc.text(`Price: ${item.price} EUR`, 14, yOffset + 12);
  });

  // 🔲 Cod QR
  const qrData = `ticket:${order._id}`; // poți include mai multe detalii aici dacă vrei
  const qrImage = await QRCode.toDataURL(qrData);

  doc.addImage(qrImage, "PNG", 150, 30, 40, 40); // Poziție și dimensiune

  doc.setFontSize(10);
  doc.text("Prezentarea acestui Ticket la intrare poate fi necesară.", 14, doc.internal.pageSize.height - 20);

  doc.save(`Ticket_${order._id.slice(-6)}.pdf`);
};



  const toggleSortDirection = (column) => {
    setSortDirection((prevDirection) => ({
      ...prevDirection,
      [column]: prevDirection[column] === "asc" ? "desc" : "asc",
    }));
  };
  

  // Filtrarea comenzilor după status
  const filterOrdersByStatus = (status) =>
    orders.filter((order) => order.status === status);

  const sortedOrders = sortOrders(filterOrdersByStatus(selectedTab)); // Aplicăm sortarea pe comenzile filtrate

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/orders/${user._id}`, {
          credentials: "include",
        });
        const data = await response.json();
        console.log("Fetched orders:", data); // Afișează datele pentru a verifica structura
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

  const generateInvoice = (order) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Invoice", 14, 20);

    doc.setFontSize(12);
    doc.text(`Order #${order._id}`, 14, 30);
    doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 14, 36);

    doc.text(`Delivery at: ${order.address}, ${order.city}`, 14, 44);
    doc.text(`Phone number: ${order.phone}`, 14, 50);
    doc.text(
      `Plata: ${
        order.paymentMethod === "cash"
          ? "Cash"
          : order.paymentMethod === "online"
          ? "Online card"
          : "Card at delivery"
      }`,
      14,
      56
    );
    doc.text(
      `Delivery: ${order.deliveryMethod === "easybox" ? "EasyBox" : "Courier"}`,
      14,
      62
    );

    const products = Array.isArray(order.products)
      ? order.products
      : [{ product: order.product, quantity: order.quantity, price: order.price }];

    const rows = products.map((item) => [
  item.product?.name || "Produs",
  item.quantity,
  `${item.price} EUR`, 
  `${(item.quantity * item.price).toFixed(2)} EUR`,
]);



    autoTable(doc, {
      startY: 70,
      head: [["Product", "Quantity", "Price per unit", "Total"]],
      body: rows,
    });

    const total = rows.reduce((acc, row) => acc + parseFloat(row[3]), 0);
doc.text(
  `Total: ${total.toFixed(2)} EUR`, 
  14,
  doc.lastAutoTable.finalY + 10
);



    doc.save(`Invoice_order_${order._id.slice(-6)}.pdf`);
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
              <AccordionButton _expanded={{ bg: "gray.100" }}>
                <Box flex="1" textAlign="left">
<Text fontWeight="bold">
  Order #{order._id.slice(-6)}{" "}
  <Badge ml={2} colorScheme={order.products.every(p => p.itemType === "Event") ? "purple" : "blue"}>
    Type: {order.products.every(p => p.itemType === "Event") ? "Ticket" : "Produs"}
  </Badge>
</Text>
                  <Text fontSize="sm">
                    Date: {new Date(order.date).toLocaleString()} {/* Afișează și ora */}
                  </Text>
<Text fontSize="sm">
  Total: {total.toFixed(2)} EUR
</Text>

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
                      {/* Dacă nu există imagine, afișăm "No Image" */}
                      <Box
                        w="100px"
                        h="100px"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        borderRadius="md"
                        bg="gray.200"
                      >
                        {item.product?.images?.[0] ? (
                          <Image
                            src={item.product?.images?.[0]}
                            alt={item.product?.name}
                            boxSize="100px"
                            objectFit="cover"
                            borderRadius="md"
                          />
                        ) : (
                          <Text fontSize="xs" color="gray.600">
                            No Image
                          </Text> // Afișează textul "No Image"
                        )}
                      </Box>
                      <VStack align="start" spacing={1} flex="1">
                        <Text fontWeight="bold">{item.product?.name}</Text>
                        <Text fontSize="sm">Quantity: {item.quantity}</Text>
                      <Text fontSize="sm">
  Price per unity: {item.price} EUR
</Text>

<Text fontWeight="semibold">
  Total: {(item.price * item.quantity).toFixed(2)} EUR
</Text>


                      </VStack>
                    </HStack>
                  ))
                ) : (
                  <HStack spacing={4} align="start" w="100%">
                    <Box
                      w="100px"
                      h="100px"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      borderRadius="md"
                      bg="gray.200"
                    >
                      {order.product?.images?.[0] ? (
                        <Image
                          src={order.product?.images?.[0]}
                          alt={order.product?.name}
                          boxSize="100px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                      ) : (
                        <Text fontSize="xs" color="gray.600">
                          No Image
                        </Text> // Afișează textul "No Image"
                      )}
                    </Box>
                    <VStack align="start" spacing={1} flex="1">
                      <Text fontWeight="bold">{order.product?.name}</Text>
                      <Text fontSize="sm">Quantity: {order.quantity}</Text>
                  <Text fontSize="sm">
  Price per unity: {order.price} EUR
</Text>

<Text fontWeight="semibold">
  Total: {(order.price * order.quantity).toFixed(2)} EUR
</Text>


                    </VStack>
                  </HStack>
                )}
               <Divider />
<Text fontWeight="semibold">Delivery:</Text>

{order.products.every(p => p.itemType === "Event") ? (
  <>
    <Text fontStyle="italic" color="gray.600"> Digital ticket – no physical delivery</Text>
    <Button
      colorScheme="purple"
      variant="outline"
      size="sm"
      mt={2}
      onClick={() => generateTicket(order)}
    >
     Download ticket
    </Button>
  </>
) : (
  <>
    {(order.firstName || order.lastName) && (
      <Text fontSize="sm">👤 {order.firstName} {order.lastName}</Text>
    )}
   <Text fontSize="sm">
  🏠 {order.address && order.address !== "N/A" ? order.address : "Unknown address"},
  {order.city && order.city !== "N/A" ? order.city : "N/A"}
</Text>

<Text fontSize="sm">
  📮 {order.postalCode && order.postalCode !== "N/A" ? `Postal code: ${order.postalCode}` : "Postal code not available"}
</Text>

<Text fontSize="sm">
  📞 {order.phone && order.phone !== "N/A" ? order.phone : "Phone not available"}
</Text>

    {order.paymentMethod && order.paymentMethod !== "N/A" && (
      <Text fontSize="sm">
        💳 {
          order.paymentMethod === "cash"
            ? "Cash"
            : order.paymentMethod === "online"
            ? "Online card"
            : "Card at delivery"
        }
      </Text>
    )}
    {order.deliveryMethod && order.deliveryMethod !== "N/A" && (
      <Text fontSize="sm">
        🚚 {order.deliveryMethod === "easybox" ? "EasyBox" : "Courier"}
      </Text>
    )}

    {order.status === "Pending" && (
      <Button
        colorScheme="red"
        size="sm"
        mt={2}
        onClick={() => handleCancelOrder(order._id)}
      >
        Cancel order
      </Button>
    )}
    <Button
      colorScheme="teal"
      variant="outline"
      size="sm"
      mt={2}
      onClick={() => generateInvoice(order)}
    >
      Download invoice
    </Button>
  </>
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
      <VStack spacing={4} mb={4}>
  <Text fontSize="3xl" fontWeight="bold" textAlign="center">
    My Orders
  </Text>
  <Flex gap={2} justify="center" wrap="wrap">
    <Button
      onClick={() => {
        setSortBy("date");
        toggleSortDirection("date");
      }}
    >
      Sort by Date {sortDirection.date === "asc" ? "↑" : "↓"}
    </Button>

    <Button
      onClick={() => {
        setSortBy("total");
        toggleSortDirection("total");
      }}
    >
      Sort by Total {sortDirection.total === "asc" ? "↑" : "↓"}
    </Button>
  </Flex>
</VStack>

  
      {loading ? (
        <Spinner size="xl" />
      ) : orders.length === 0 ? (
        <Text>No orders found.</Text>
      ) : (
        <>
          <Box mb={4}>
            <HStack justify="center" spacing={4}>
              {tabOptions.map((tab) => (
                <Button
                  key={tab.value}
                  onClick={() => setSelectedTab(tab.value)}
                  bg={selectedTab === tab.value ? tab.color + ".400" : "gray.100"}
                  color={selectedTab === tab.value ? "white" : "gray.600"}
                  fontWeight="bold"
                  borderRadius="full"
                  px={6}
                  py={4}
                  _hover={{ bg: tab.color + ".500", color: "white" }}
                  boxShadow={selectedTab === tab.value ? "md" : "none"}
                >
                  {tab.label}
                </Button>
              ))}
            </HStack>
          </Box>
  
          <Box mt={6}>
            <OrderAccordion orders={sortedOrders} />
          </Box>
        </>
      )}
    </Box>
  );
  };
  
export default OrdersPage;


