import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// User Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Category Management
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Location Management
router.get('/locations', adminController.getLocations);
router.post('/locations', adminController.createLocation);
router.put('/locations/:id', adminController.updateLocation);
router.delete('/locations/:id', adminController.deleteLocation);

// Reports
router.get('/reports/stats', adminController.getReportStats);
router.get('/reports/trend', adminController.getMonthlyTrend);

export default router;
