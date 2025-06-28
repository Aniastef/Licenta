import React, { useEffect, useState } from 'react';
import { Box, Button, Text, VStack, Select, Input, HStack, useToast } from '@chakra-ui/react';
import { useCart } from '../components/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { useRecoilValue } from 'recoil';
import { useNavigate, useLocation } from 'react-router-dom';
import userAtom from '../atoms/userAtom';

const stripePromise = loadStripe(
  'pk_test_51Qsp7AE2YvnJG5vYoqLfiAbuRiZY2BwF9Jh0Uc6RrQmGp3KcmTImPoFMic0JChEYbXPs1flUqZC728RWyPgjUVO200emlBMRwp',
);

const CheckoutPage = () => {
  const { cart, setCart, fetchCart } = useCart();
  const user = useRecoilValue(userAtom);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isOnlyTickets = cart.every((item) => item.itemType === 'Event');

  const [paymentMethod, setPaymentMethod] = useState('online');
  const [deliveryMethod, setDeliveryMethod] = useState('courier');

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [address, setAddress] = useState(user?.address || '');
  const [postalCode, setPostalCode] = useState(user?.postalCode || '');
  const [city, setCity] = useState(user?.city || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const totalPrice = cart.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0,
  );

  useEffect(() => {
    fetchCart();
  }, []);

  const handlePaymentSuccess = async (orderDataOverride = null) => {
    let orderData = orderDataOverride;

    if (!orderData) {
      const validCart = cart.filter((item) => item.product);
      orderData = {
        userId: user._id,
        cart: validCart,
        totalAmount: totalPrice,
        paymentMethod,
        deliveryMethod: isOnlyTickets ? 'N/A' : deliveryMethod,
        firstName: isOnlyTickets ? '' : firstName,
        lastName: isOnlyTickets ? '' : lastName,
        address: isOnlyTickets ? '' : address,
        postalCode: isOnlyTickets ? '' : postalCode,
        city: isOnlyTickets ? '' : city,
        phone: isOnlyTickets ? '' : phone,
      };
    }

    const hasInvalidItems = orderData.cart.some((item) => {
      const availableStock =
        item.itemType === 'Event' ? item.product.capacity : item.product.quantity;
      return item.quantity > availableStock;
    });

    if (hasInvalidItems) {
      toast({
        title: 'Out of stock',
        description: 'One or more items in your cart are out of stock.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      await fetchCart();
      return;
    }

    try {
      const res = await fetch('/api/payment/payment-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data?.error || 'Failed to process order';
        console.error('Payment processing failed', errorMessage);
        toast({
          title: 'Payment error',
          description: errorMessage,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
        await fetchCart();
        throw new Error(errorMessage);
      }

      toast({ title: 'Payment succedeed!', status: 'success', duration: 3000 });
      setCart([]);
      await fetchCart();
      localStorage.removeItem('pendingStripeOrder');
      navigate('/orders');
    } catch (err) {
      console.error(' Payment processing failed', err);
      toast({
        title: 'Payment failed',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const isSuccess = query.get('success');
    const isCanceled = query.get('canceled');

    if (isSuccess === 'true') {
      console.log('Stripe payment successful!');
      const storedOrderData = localStorage.getItem('pendingStripeOrder');
      if (storedOrderData) {
        const orderData = JSON.parse(storedOrderData);
        handlePaymentSuccess(orderData);
      } else {
        console.warn(
          'No pending order data found in localStorage after Stripe success. Cart may be empty.',
        );
        handlePaymentSuccess();
      }
      navigate('/checkout', { replace: true });
    } else if (isCanceled === 'true') {
      console.log('Stripe payment canceled!');
      toast({
        title: 'Payment canceled',
        description: 'Your payment was canceled. You can try again.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
      localStorage.removeItem('pendingStripeOrder');
      navigate('/checkout', { replace: true });
    }
  }, [location.search]);

  const handlePayment = async () => {
    if (paymentMethod !== 'online') {
      handleDeliveryOrder();
      return;
    }

    const orderDataToStore = {
      userId: user._id,
      cart: cart.filter((item) => item.product),
      totalAmount: totalPrice,
      paymentMethod,
      deliveryMethod: isOnlyTickets ? 'N/A' : deliveryMethod,
      firstName: isOnlyTickets ? '' : firstName,
      lastName: isOnlyTickets ? '' : lastName,
      address: isOnlyTickets ? '' : address,
      postalCode: isOnlyTickets ? '' : postalCode,
      city: isOnlyTickets ? '' : city,
      phone: isOnlyTickets ? '' : phone,
    };
    localStorage.setItem('pendingStripeOrder', JSON.stringify(orderDataToStore));
    console.log('Saving pending Stripe order to localStorage:', orderDataToStore);

    const stripe = await stripePromise;

    console.log('Cart contents before processing for Stripe:', cart);

    const checkoutItems = cart
      .map((item, index) => {
        if (!item.product) {
          console.error(
            `Item ${index} is missing product data (item.product is null/undefined):`,
            item,
          );
          return null;
        }
        let itemName;
        if (item.itemType === 'Event') {
          itemName = item.product.name;
        } else {
          itemName = item.product.title;
        }
        if (!itemName || itemName.trim() === '') {
          console.error(`Item ${index}: Name/title is missing or empty for item:`, item.product);
          return null;
        }
        const itemPrice = Number(item.product.price);
        if (isNaN(itemPrice) || itemPrice <= 0) {
          console.error(
            `Item ${index}: Invalid or non-positive price detected for item:`,
            item.product,
          );
          return null;
        }
        return {
          name: itemName,
          price: itemPrice,
          quantity: item.quantity || 1,
        };
      })
      .filter(Boolean);

    if (checkoutItems.length === 0) {
      toast({
        title: 'Cart is empty or contains invalid items for payment.',
        description: 'Please add valid items to your cart before proceeding.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const totalAmountCents = checkoutItems.reduce(
      (total, item) => total + Math.round(item.price * 100) * item.quantity,
      0,
    );
    if (totalAmountCents < 50) {
      toast({
        title: 'Minimum amount required',
        description:
          'You need to have at least 0.50 EUR in your cart to proceed with online payment.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const response = await fetch('/api/payment/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ items: checkoutItems }),
    });

    const data = await response.json();

    if (!response.ok || !data.sessionId) {
      console.error(' No sessionId received or backend error!', data);
      toast({
        title: 'Payment error',
        description: data.error || 'Could not initiate Stripe session. Check console.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    await stripe.redirectToCheckout({ sessionId: data.sessionId });
  };

  const validateDeliveryFields = () => {
    if (isOnlyTickets) {
      return true;
    }
    return firstName && lastName && address && postalCode && city && phone;
  };

  const handleDeliveryOrder = async () => {
    if (!isOnlyTickets && !validateDeliveryFields()) {
      toast({
        title: 'Complete all delivery fields.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const payloadForDirectOrder = {
      userId: user._id,
      products: cart.map((item) => ({
        _id: item.product._id,
        price: item.product.price,
        quantity: item.quantity,
        itemType: item.itemType,
      })),
      paymentMethod,
      deliveryMethod: isOnlyTickets ? 'N/A' : deliveryMethod,
      firstName: isOnlyTickets ? '' : firstName,
      lastName: isOnlyTickets ? '' : lastName,
      address: isOnlyTickets ? '' : address,
      postalCode: isOnlyTickets ? '' : postalCode,
      city: isOnlyTickets ? '' : city,
      phone: isOnlyTickets ? '' : phone,
    };
    console.log('Frontend (CheckoutPage): Sending to /api/orders/:userId:', payloadForDirectOrder);

    try {
      const response = await fetch(`/api/orders/${user._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payloadForDirectOrder),
      });

      if (response.ok) {
        toast({
          title: 'Order placed successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setCart([]);
        navigate('/orders');
      } else {
        toast({
          title: 'Order failed!',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error(' Error placing order:', err);
    }
  };

  return (
    <VStack spacing={6} align="center" p={5}>
      <Text fontSize="2xl" fontWeight="bold">
        Checkout
      </Text>
      <Box textAlign="center">
        <Text fontSize="lg" fontWeight="semibold" mb={1}>
          Total:
        </Text>
        <Text fontSize="lg">{totalPrice.toFixed(2)} EUR</Text>
      </Box>

      <Select w="300px" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
        <option value="online">Pay online with card</option>
        <option value="card_on_delivery">Pay with card at delivery/physical event</option>
        <option value="cash">Pay cash at delivery/physical</option>
      </Select>

      {!isOnlyTickets && (
        <>
          <Select
            w="300px"
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value)}
          >
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
                deliveryMethod === 'easybox' ? 'EasyBox Locker Address' : 'Full Home Address'
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
              <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
            </HStack>
            <Input
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </VStack>
        </>
      )}

      <Button colorScheme="green" onClick={handlePayment}>
        {paymentMethod === 'online' ? 'Pay with Stripe' : 'Place Order'}
      </Button>
    </VStack>
  );
};

export default CheckoutPage;
