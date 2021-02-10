import express from 'express';
import { getProducts, getProductById, deleteProduct } from '../controllers/productController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
 

const router = express.Router();

router.route('/').get(getProducts); 
router.route('/:id')
    .get(getProductById)
    .delete(protect, admin, deleteProduct); 

export default router;