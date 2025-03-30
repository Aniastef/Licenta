// CheckoutPage.jsx - Pagina de checkout cu Stripe
import React, { useEffect } from "react";
import { useCart } from "../components/CartContext";
import { Box, Button, Text, VStack } from "@chakra-ui/react";
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
  const totalPrice = cart.reduce((acc, item) => {
    const price = item?.product?.price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const handlePaymentSuccess = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") && !localStorage.getItem("hasProcessed")) {
      console.log("✅ Payment was successful! Updating backend...");
      console.log("📤 Sending to backend:", { userId });
      localStorage.setItem("hasProcessed", "true");

      try {
        const response = await fetch("/api/payment/payment-success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
          credentials: "include",
        });

        if (response.ok) {
          console.log("✅ Order successfully recorded!");
          clearCart();
          navigate("/myorders");
        } else {
          console.error("❌ Payment processing failed");
        }
      } catch (error) {
        console.error("❌ Error processing payment:", error);
      }
    }
  };

  useEffect(() => {
    handlePaymentSuccess();
    return () => localStorage.removeItem("hasProcessed");
  }, []);

  useEffect(() => {
    const alreadyProcessed = localStorage.getItem("hasProcessed");
    if (!alreadyProcessed) {
      handlePaymentSuccess();
      localStorage.setItem("hasProcessed", "true");
    }
  }, []);
  

  const handlePayment = async () => {
    const stripe = await stripePromise;

    const response = await fetch("/api/payment/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map(item => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity || 1
        }))
      }),
      credentials: "include",
    });

    const data = await response.json();
    if (!data.sessionId) {
      console.error("❌ No sessionId received!");
      return;
    }

    await stripe.redirectToCheckout({ sessionId: data.sessionId });
  };

  return (
    <VStack spacing={4} align="center" p={5}>
      <Text fontSize="2xl">Checkout</Text>
      <Text>Total: {totalPrice.toFixed(2)} RON</Text>
      <Button colorScheme="green" onClick={handlePayment}>Pay with Stripe</Button>
    </VStack>
  );
};

export default CheckoutPage;
