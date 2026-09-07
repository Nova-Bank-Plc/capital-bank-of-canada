import { Router } from "express";

import {
    getLoans,
} from "../controllers/loanController.js";

import {
    requireAuth,
} from "../middleware/authMiddleware.js";


const router = Router();


router.get(
    "/",
    requireAuth,
    getLoans
);


export default router;