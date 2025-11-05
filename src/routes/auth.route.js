import express from 'express';
import { adminRegisterController, adminLoginController, adminLogoutController } from '../controllers/admin.auth.controller.js';

const router = express.Router()



router.post("/admin/register", adminRegisterController);
router.post("/admin/login", adminLoginController);
router.post("/logout", adminLogoutController);


export default router;