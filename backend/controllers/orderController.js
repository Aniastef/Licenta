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

    const ordersWithTotalPrice = user.orders.map(order => {
      if (Array.isArray(order.products)) {
        for (let i = 0; i < order.products.length; i++) {
          const item = order.products[i];
          if (item.product && item.product._id) {
            if (item.itemType === 'Event') {
              if (!item.product.coverImage) {
              }
            } else {
              if (!item.product.images || item.product.images.length === 0) {
              }
            }
          }
        }
      }

      const calculatedTotalPrice = order.products.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0; 
        const quantity = parseFloat(item.quantity) || 0; 
        return sum + (price * quantity);
      }, 0);

      const isOrderOnlyTickets =
        Array.isArray(order.products) && order.products.every((p) => p.itemType === 'Event');
      
      const newOrder = {
        ...order.toObject(), 
        firstName: order.firstName || 'N/A',
        lastName: order.lastName || 'N/A',
        totalPrice: calculatedTotalPrice, 
      };

      if (isOrderOnlyTickets) {
        newOrder.address = 'N/A';
        newOrder.city = 'N/A';
        newOrder.postalCode = 'N/A';
        newOrder.phone = 'N/A';
      } else {
        newOrder.address = order.address || 'Unknown address';
        newOrder.city = order.city || 'Unknown city';
        newOrder.postalCode = order.postalCode || 'Postal code not available';
        newOrder.phone = order.phone || 'Phone not available';
      }

      newOrder.paymentMethod = order.paymentMethod || 'N/A';
      newOrder.deliveryMethod =
        order.deliveryMethod === 'N/A' ? 'N/A' : order.deliveryMethod || 'courier';

      return newOrder;
    });

    res.status(200).json({ orders: ordersWithTotalPrice });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const addOrder = async (req, res) => {
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
        product: p.product._id,         
        price: p.product.price,         
        quantity: p.quantity || 1,
        itemType: p.itemType,          
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

    user.orders.push(newOrder);
    await user.save();

    res.status(201).json({ message: 'Order added', orders: user.orders });
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(500).json({ error: 'Failed to add order' });
  }
};

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
    const usersWithOrders = await User.find({ 'orders.0': { $exists: true } })
      .select('firstName lastName email orders')
      .populate('orders.products.product');

    const allOrders = usersWithOrders.flatMap((user) =>
      user.orders.map((order) => {
        const calculatedTotalPrice = order.products.reduce((sum, item) => {
          const price = item.price || 0;
          const quantity = item.quantity || 0;
          return sum + (price * quantity);
        }, 0);

        return {
          ...order.toObject(),
          totalPrice: calculatedTotalPrice,
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
        };
      }),
    );

    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({ orders: allOrders });
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
