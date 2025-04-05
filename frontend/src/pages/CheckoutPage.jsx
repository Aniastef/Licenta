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
  const { cart, clearCart } = useCart();
  const user = useRecoilValue(userAtom);
  const userId = user?._id;
  const navigate = useNavigate();
  const toast = useToast();

  const [paymentMethod, setPaymentMethod] = useState("online");
  const [deliveryMethod, setDeliveryMethod] = useState("courier");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  const totalPrice = cart.reduce((acc, item) => {
    const price = item?.product?.price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const handlePaymentSuccess = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") && !localStorage.getItem("hasProcessed")) {
      localStorage.setItem("hasProcessed", "true");

      try {
        const res = await fetch("/api/payment/payment-success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
          credentials: "include",
        });

        if (res.ok) {
          clearCart();
          navigate("/orders");
        } else {
          console.error("❌ Payment processing failed");
        }
      } catch (err) {
        console.error("❌ Error processing payment:", err);
      }
    }
  };

  useEffect(() => {
    handlePaymentSuccess();
    return () => localStorage.removeItem("hasProcessed");
  }, []);

  const validateDeliveryFields = () => {
    return (
      firstName &&
      lastName &&
      address &&
      postalCode &&
      city &&
      phone
    );
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

    try {
      const response = await fetch(`/api/orders/${userId}`, {
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
        clearCart();
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

    await stripe.redirectToCheckout({ sessionId: data.sessionId });
  };

  return (
    <VStack spacing={6} align="center" p={5}>
      <Text fontSize="2xl" fontWeight="bold">
        Checkout
      </Text>
      <Text fontSize="lg">Total: {totalPrice.toFixed(2)} RON</Text>

      <Select
        placeholder="Select payment method"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        w="300px"
      >
        <option value="online">Pay online with card</option>
        <option value="card_on_delivery">Pay with card at delivery</option>
        <option value="cash">Pay cash at delivery</option>
      </Select>

      <Select
        placeholder="Select delivery method"
        value={deliveryMethod}
        onChange={(e) => setDeliveryMethod(e.target.value)}
        w="300px"
      >
        <option value="courier">Home delivery (courier)</option>
        <option value="easybox">EasyBox locker</option>
      </Select>

      {paymentMethod !== "online" && (
        <VStack spacing={3} w="100%" maxW="500px">
          <Text fontWeight="semibold">Delivery Information</Text>
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
            placeholder="Full Address"
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
              placeholder="City / Village / Commune"
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
      )}

      <Button colorScheme="green" onClick={handlePayment}>
        {paymentMethod === "online" ? "Pay with Stripe" : "Place Order"}
      </Button>
    </VStack>
  );
};

export default CheckoutPage;
