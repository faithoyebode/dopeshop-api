import dotenv from 'dotenv';
import axios from 'axios';
import Order from '../models/orderModel.js';
import asyncHandler from 'express-async-handler';

dotenv.config();

//@desc Create new order
//@route POST /api/orders
//@access Private
const addOrderItems = asyncHandler(async (req, res) => {
    const { 
        orderItems, 
        shippingAddress, 
        paymentMethod, 
        itemsPrice, 
        taxPrice, 
        shippingPrice, 
        totalPrice 
    } = req.body;


    if(orderItems && orderItems.length === 0){
        res.status(400);
        throw new Error('No order items');
        return;
    }else{
        const order = new Order({
            orderItems,
            user: req.user._id, 
            shippingAddress, 
            paymentMethod, 
            itemsPrice, 
            taxPrice, 
            shippingPrice, 
            totalPrice 
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
});


//@desc Get order by ID
//@route GET /api/orders/:id
//@access Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if(order){
        res.json(order);
    }else{
        res.status(404);
        throw new Error('Order not found');
    }
});


//@desc Update order to paid
//@route GET /api/orders/:id/pay
//@access Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const paystackConfig = {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`
        }
    }

    const flutterwaveConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET}`
        }
    }

    const reference = req.body.reference;
    const transactionId = req.body.transaction_id;
    let verifyOrder;

    if(req.body.paymentMethod === 'paystack'){
        if(reference){
            verifyOrder = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, paystackConfig);
        }else{
            res.status(403);
            throw new Error('Forbidden');
        }
    }else if(req.body.paymentMethod === 'flutterwave'){
        if(transactionId){
            verifyOrder = await axios.get(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, flutterwaveConfig);
        }else{
            res.status(403);
            throw new Error('Forbidden');
        }
    }
    
    const order = await Order.findById(req.params.id);

    if((verifyOrder.data.data.status === 'success' ||  verifyOrder.data.data.status === 'successful') && order){
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
             reference: verifyOrder.data.data.reference || verifyOrder.data.data.id,
             status: verifyOrder.data.data.status,
             update_time: verifyOrder.data.data.paidAt || verifyOrder.data.data.created_at,
             email_address: verifyOrder.data.data.customer.email
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    }else{
        res.status(404);
        throw new Error('Order not found');
    }
});


//@desc Get logged in user orders
//@route GET /api/orders/myorders
//@access Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
    
});


//@desc Get all orders
//@route GET /api/orders
//@access Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'id name');
    res.json(orders);
    
});

export { 
    addOrderItems, 
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders 
};
