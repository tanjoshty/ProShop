import asyncHandler from 'express-async-handler'
import generateToken from '../utils/generateToken.js'
import User from '../models/userModel.js'
import Product from '../models/productModel.js'


//@description  Auth user & get token
//@route        POST /api/users/login
//@access       Public
const authUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body

    const user = await User.findOne({ email })

    if(user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        })
    } else {
        res.status(401)
        throw new Error('Invalid email or password')
    }
})

//@description  Register a new user
//@route        POST /api/users
//@access       Public
const registerUser = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body

    const userExists = await User.findOne({ email })

    if(userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    const user = await User.create({
        name,
        email,
        password
    })

    if(user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

//@description  Get user profile
//@route        GET /api/users/profile
//@access       Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)

    if(user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            wishlist: user.wishlist
        })
    } else {
        res.status(404)
        throw new Error('User not found')
    }
})

//@description  Update user profile
//@route        PUT /api/users/profile
//@access       Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)

    if(user) {
        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        if (req.body.password) {
            user.password = req.body.password
        }

        const updatedUser = await user.save()

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser._id)
        })
    } else {
        res.status(404)
        throw new Error('User not found')
    }
})

//@description  Get all users
//@route        GET /api/users
//@access       Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({})
    res.json(users)
})

//@description  Delete user
//@route        DELETE /api/users/:id
//@access       Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    
    if(user) {
        await user.remove()
        res.json({message: 'User removed'})
    } else {
        res.status(404)
        throw new Error ('User not found')
    }
})

//@description  Get user by ID
//@route        GET /api/users/:id
//@access       Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password')
    if(user) {
        res.json(user)
    } else {
        res.status(404)
        throw new Error ('User not found')
    }
})

//@description  Update user
//@route        PUT /api/users/:id
//@access       Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if(user) {
        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        user.isAdmin = req.body.isAdmin === undefined ? user.isAdmin : req.body.isAdmin

        const updatedUser = await user.save()

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        })
    } else {
        res.status(404)
        throw new Error('User not found')
    }
})

//@description  Add product to wishlist
//@route        POST /api/users/wishlist/:id
//@access       Private
const addWishlistItem = asyncHandler(async (req, res) => {
    
    const product = await Product.findById(req.params.id)
    
    const user = await User.findById(req.user._id)

    if(user && product) {

        const alreadyInWishlist = user.wishlist.find((w) => w.product.toString() === req.params.id)

        if(alreadyInWishlist) {
            res.status(400)
            throw new Error('Product already in wishlist')
        }

        const wishlist = {
            name: product.name,
            image: product.image,
            price: product.price,
            product: req.params.id
        }

        user.wishlist.push(wishlist)

        await user.save()

        res.status(201).json({message: 'Product added to wishlist'})
    } else {
        res.status(404)
        throw new Error('Product or User not Found')
    }
})

//@description  Remove product to wishlist
//@route        DELETE /api/users/wishlist/:id
//@access       Private
const removeWishlistItem = asyncHandler(async (req, res) => {
    const userId = req.user._id 
    const wishlistId = req.body._id
    // get product by id
    const product = await Product.findById(req.params.id)

    // Get user by id
    const user = await User.findById(req.user._id)

    if(user && product) {
        const productInWishlist = user.wishlist.find((w) => w.product.toString() === req.params.id)

        if(!productInWishlist) {
            res.status(400)
            throw new Error('Product does not exist in wishlist')
        }
        
        await User.findByIdAndUpdate(
            userId, {
                $pull: {'wishlist': { _id: wishlistId }}
            }, function (err, model) {
                if(err) {
                    console.log(err)
                    return res.send(err)
                }
            }
        )
        await user.save()

        res.status(201).json({message: 'Product removed from wishlist'})
    } else {
        res.status(404)
        throw new Error('Product or User not Found')
    }
})

export {authUser, registerUser, getUserProfile, updateUserProfile, getUsers, deleteUser, getUserById, updateUser, addWishlistItem, removeWishlistItem}