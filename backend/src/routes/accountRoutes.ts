import { Router } from "express";

import {
    getAccountById,
} from "../controllers/accountController.js";

import {
    requireAuth,
} from "../middleware/authMiddleware.js";


const router = Router();


router.get(
    "/:accountId",
    requireAuth,
    getAccountById
);


export default router;