import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Event from '../models/eventModel.js';

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate({
      path: 'orders.products.product',
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    console.log(
      '🔍 Backend (orderController): Fetched user orders BEFORE display fallbacks for user:',
      userId,
      JSON.parse(JSON.stringify(user.orders)),
    );

    for (const order of user.orders) {
      if (Array.isArray(order.products)) {
        for (let i = 0; i < order.products.length; i++) {
          const item = order.products[i];
          if (item.product && item.product._id) {
            if (item.itemType === 'Event') {
              if (!item.product.coverImage) {
                const eventDetails = await Event.findById(item.product._id);
                if (eventDetails) {
                  order.products[i].product = eventDetails;
                }
              }
            } else {
              if (!item.product.images || item.product.images.length === 0) {
                const productDetails = await Product.findById(item.product._id);
                if (productDetails) {
                  order.products[i].product = productDetails;
                }
              }
            }
          }
        }
      }

      const isOrderOnlyTickets =
        Array.isArray(order.products) && order.products.every((p) => p.itemType === 'Event');
      order.firstName = order.firstName || 'N/A';
      order.lastName = order.lastName || 'N/A';

      if (isOrderOnlyTickets) {
        order.address = 'N/A';
        order.city = 'N/A';
        order.postalCode = 'N/A';
        order.phone = 'N/A';
      } else {
        order.address = order.address || 'Unknown address';
        order.city = order.city || 'Unknown city';
        order.postalCode = order.postalCode || 'Postal code not available';
        order.phone = order.phone || 'Phone not available';
      }

      order.paymentMethod = order.paymentMethod || 'N/A';
      order.deliveryMethod =
        order.deliveryMethod === 'N/A' ? 'N/A' : order.deliveryMethod || 'courier';
    }

    console.log(
      '✅ Backend (orderController): Orders prepared for sending to frontend (after fallbacks):',
      JSON.parse(JSON.stringify(user.orders)),
    );

    res.status(200).json({ orders: user.orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const addOrder = async (req, res) => {
  console.log('📩 Backend (orderController): Received req.body for addOrder:', req.body);
  try {
    const { userId } = req.params;
    const {
      products,
      paymentMethod,
      deliveryMethod,
      firstName,
      lastName,
      address,
      postalCode,
      city,
      phone,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newOrder = {
      products: products.map((p) => ({
        product: p._id,
        price: p.price,
        quantity: p.quantity || 1,
      })),
      status: 'Pending',
      date: new Date(),
      paymentMethod: paymentMethod || 'card',
      deliveryMethod: deliveryMethod || 'courier',
      firstName: firstName || '',
      lastName: lastName || '',
      address: address || '',
      postalCode: postalCode || '',
      city: city || '',
      phone: phone || '',
    };

    console.log(
      '📝 Backend (orderController): Preparing new order to save for user:',
      userId,
      'with data:',
      newOrder,
    );

    user.orders.push(newOrder);
    await user.save();

    res.status(201).json({ message: 'Order added', orders: user.orders });
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(500).json({ error: 'Failed to add order' });
  }
};

/**
 * Delete a specific order
 */
export const deleteOrder = async (req, res) => {
  try {
    const { userId, orderId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.orders = user.orders.filter((order) => order._id.toString() !== orderId);
    await user.save();

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Error deleting order:', err.message);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

/**
 * Cancel an order (changes status, does not delete)
 */
export const cancelOrder = async (req, res) => {
  try {
    const { userId, orderId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const order = user.orders.id(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = 'Cancelled';
    await user.save();

    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling order:', err.message);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    console.log('✅ getAllOrders triggered');

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await User.find({ 'orders.0': { $exists: true } })
      .select('firstName lastName email orders')
      .populate('orders.products.product');

    const allOrders = users.flatMap((user) =>
      user.orders.map((order) => ({
        ...order.toObject(),
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      })),
    );

    res.status(200).json({ orders: allOrders });
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
