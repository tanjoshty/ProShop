import asyncHandler from 'express-async-handler'
import Order from '../models/orderModel.js'


//@description  Create new order
//@route        POST /api/orders
//@access       Private
const addOrderItems = asyncHandler(async (req, res) => {
    // Get information from the frontend (req.body)
    const {orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice} = req.body

    // if there are no order items
    if(orderItems && orderItems.length === 0) {
        res.status(400)
        throw new Error('No order Items')
        return
    //if there are items in the order
    } else {
        // Create new order with the information from the front end
        const order = new Order({
            orderItems,
            user: req.user._id, 
            shippingAddress, 
            paymentMethod, 
            itemsPrice, 
            taxPrice, 
            shippingPrice, 
            totalPrice,
        })

        // Push the order to the database
        const createdOrder = await order.save()

        res.status(201).json(createdOrder)
    }
})

//@description  Get order by ID
//@route        GET /api/orders/:id
//@access       Private
const getOrderById = asyncHandler(async (req, res) => {
    // find the order in the database 
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    // if an order is found, respond with the order
    if(order) {
        res.json(order)
    // if no order found
    } else {
        res.status(404)
        throw new Error('Order not found')
    }
})

//@description  Update order to paid
//@route        GET /api/orders/:id/pay
//@access       Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    // find order in database
    const order = await Order.findById(req.params.id)

    // if there is an order
    if(order) {
        order.isPaid = true
        order.paidAt = Date.now()
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.payer.email_address
        }

        // Save updated order to the database
        const updatedOrder = await order.save()

        res.json(updatedOrder)
    } else {
        res.status(404)
        throw new Error('Order not found')
    }
})

//@description  Update order to delivered
//@route        GET /api/orders/:id/deliver
//@access       Private
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)

    if(order) {
        order.isDelivered = true
        order.deliveredAt = Date.now()

        const updatedOrder = await order.save()

        res.json(updatedOrder)
    } else {
        res.status(404)
        throw new Error('Order not found')
    }
})

//@description  Get logged in user orders
//@route        GET /api/orders/myorders
//@access       Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({user: req.user._id})
    res.json(orders)
})

//@description  Get all orders
//@route        GET /api/orders
//@access       Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name')
    res.json(orders)
})

export {addOrderItems, getOrderById, updateOrderToPaid, getMyOrders, getOrders, updateOrderToDelivered}