import asyncHandler from 'express-async-handler'
import Wishlist from '../models/wishlistModel'
import Product from '../models/productModel'

//@description  Add product to wishlist
//@route        POST /api/wishlist/:id
//@access       Private
const addWishlistItem = asyncHandler(async (req, res) => {
    const user = req.user._id 
    const product = req.params.id

    const wishlist = await Wishlist.findOne()
})