import {
    Router,
} from "express";


import {
    creditDigitalAsset,
} from "../controllers/adminDigitalAssetController.js";


import {
    requireAuth,
} from "../middleware/authMiddleware.js";


import {
    requireAdmin,
} from "../middleware/adminMiddleware.js";


const router = Router();


router.post(
    "/credit",
    requireAuth,
    requireAdmin,
    creditDigitalAsset,
);


export default router;