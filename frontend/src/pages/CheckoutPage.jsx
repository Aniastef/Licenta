import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  Select,
  Input,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { useCart } from "../components/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import userAtom from "../atoms/userAtom";

const stripePromise = loadStripe("pk_test_51Qsp7AE2YvnJG5vYoqLfiAbuRiZY2BwF9Jh0Uc6RrQmGp3KcmTImPoFMic0JChEYbXPs1flUqZC728RWyPgjUVO200emlBMRwp");

const CheckoutPage = () => {
  const { cart, setCart, fetchCart } = useCart(); // 🆕 adăugat fetchCart
  const user = useRecoilValue(userAtom);
  const toast = useToast();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("online");
  const [deliveryMethod, setDeliveryMethod] = useState("courier");

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  const totalPrice = cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  useEffect(() => {
    fetchCart(); // 💥 forțează actualizarea cart-ului la intrarea în pagină
  }, []);
  
  const handlePaymentSuccess = async () => {
    const validCart = cart.filter(item => item.product);
  
    // ✅ Verificăm local dacă ai produse cu stoc insuficient
    const hasInvalidItems = validCart.some(item => {
      return item.quantity > item.product.quantity;
    });
  
    if (hasInvalidItems) {
      toast({
        title: "Stoc insuficient",
        description: "Unul sau mai multe produse nu mai au stoc suficient.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
  
      await fetchCart(); // 🔁 Sincronizează cart-ul
      return; // ❌ Oprim aici
    }
  
    try {
      const res = await fetch("/api/payment/payment-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user._id,
          cart: validCart,
          totalAmount: totalPrice,
          paymentMethod,
          deliveryMethod,
          firstName,
          lastName,
          address,
          city,
          postalCode,
          phone,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        const errorMessage = data?.error || "Failed to process order";
        console.error("❌ Payment processing failed", errorMessage);
  
        toast({
          title: "Plata a eșuat",
          description: errorMessage,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
  
        await fetchCart(); // 🔁 Reîncarcă cart-ul dacă apare eroare de la server
        throw new Error(errorMessage);
      }
  
      toast({ title: "Plată reușită!", status: "success", duration: 3000 });
      setCart([]);
      navigate("/orders");
  
    } catch (err) {
      console.error("❌ Payment processing failed", err);
      toast({
        title: "Plata a eșuat",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };
  
  
  

  useEffect(() => {
    const shouldProcess = localStorage.getItem("hasProcessed");
    if (shouldProcess) {
      handlePaymentSuccess().finally(() => {
        localStorage.removeItem("hasProcessed");
      });
    }
  }, []);

  const handlePayment = async () => {
    if (paymentMethod !== "online") {
      handleDeliveryOrder();
      return;
    }

    const stripe = await stripePromise;

    const response = await fetch("/api/payment/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        items: cart.map((item) => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity || 1,
        })),
      }),
    });

    const data = await response.json();
    if (!data.sessionId) {
      console.error("❌ No sessionId received!");
      return;
    }

    localStorage.setItem("hasProcessed", "true");
    await stripe.redirectToCheckout({ sessionId: data.sessionId });
  };

  const validateDeliveryFields = () => {
    return firstName && lastName && address && postalCode && city && phone;
  };

  const handleDeliveryOrder = async () => {
    if (!validateDeliveryFields()) {
      toast({
        title: "Complete all delivery fields.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    console.log({
      userId: user._id,
      products: cart.map((item) => ({
        _id: item.product._id,
        price: item.product.price,
        quantity: item.quantity,
      })),
      paymentMethod,
      deliveryMethod,
      firstName,
      lastName,
      address,
      postalCode,
      city,
      phone,
    });
    
    try {
      const response = await fetch(`/api/orders/${user._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          products: cart.map((item) => ({
            _id: item.product._id,
            price: item.product.price,
            quantity: item.quantity,
          })),
          paymentMethod,
          deliveryMethod,
          firstName,
          lastName,
          address,
          postalCode,
          city,
          phone,
        }),
        
      });

      if (response.ok) {
        toast({
          title: "Order placed successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setCart([]);
        navigate("/orders");
      } else {
        toast({
          title: "Order failed!",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("❌ Error placing order:", err);
    }
  };

  return (
    <VStack spacing={6} align="center" p={5}>
      <Text fontSize="2xl" fontWeight="bold">Checkout</Text>
      <Text fontSize="lg">Total: {totalPrice.toFixed(2)} RON</Text>

      <Select w="300px" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
        <option value="online">Pay online with card</option>
        <option value="card_on_delivery">Pay with card at delivery</option>
        <option value="cash">Pay cash at delivery</option>
      </Select>

      <Select w="300px" value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)}>
        <option value="courier">Home delivery (courier)</option>
        <option value="easybox">EasyBox locker</option>
      </Select>

      <VStack spacing={3} w="100%" maxW="500px">
  <Input
    placeholder="First Name"
    value={firstName}
    onChange={(e) => setFirstName(e.target.value)}
  />
  <Input
    placeholder="Last Name"
    value={lastName}
    onChange={(e) => setLastName(e.target.value)}
  />
  <Input
    placeholder={
      deliveryMethod === "easybox"
        ? "EasyBox Locker Address"
        : "Full Home Address"
    }
    value={address}
    onChange={(e) => setAddress(e.target.value)}
  />
  <HStack w="100%">
    <Input
      placeholder="Postal Code"
      value={postalCode}
      onChange={(e) => setPostalCode(e.target.value)}
    />
    <Input
      placeholder="City"
      value={city}
      onChange={(e) => setCity(e.target.value)}
    />
  </HStack>
  <Input
    placeholder="Phone Number"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
  />
</VStack>


      <Button colorScheme="green" onClick={handlePayment}>
        {paymentMethod === "online" ? "Pay with Stripe" : "Place Order"}
      </Button>
    </VStack>
  );
};

export default CheckoutPage;
