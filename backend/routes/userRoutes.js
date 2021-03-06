import express from 'express'
const router = express.Router()
import { authUser, registerUser, getUserProfile, updateUserProfile, getUsers, deleteUser, getUserById, updateUser, addWishlistItem, removeWishlistItem } from '../controllers/userController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/').post(registerUser).get(protect, admin, getUsers)
router.route('/wishlist/:id').post(protect, addWishlistItem).delete(protect, removeWishlistItem)
router.post('/login', authUser)
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile)
router.route('/:id').delete(protect, admin, deleteUser).get(protect, admin, getUserById).put(protect, admin, updateUser)

export default router 