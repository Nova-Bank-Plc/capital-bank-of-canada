import { Router } from "express";

import {
    createTransfer,
} from "../controllers/transferController.js";

import {
    requireAuth,
} from "../middleware/authMiddleware.js";


const router = Router();


router.post(
    "/",
    requireAuth,
    createTransfer
);


export default router;