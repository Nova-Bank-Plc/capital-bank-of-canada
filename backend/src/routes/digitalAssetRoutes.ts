import {
    Router,
} from "express";


import {
    getDigitalAssets,
    convertDigitalAsset,
} from "../controllers/digitalAssetController.js";


import {
    requireAuth,
} from "../middleware/authMiddleware.js";


const router = Router();


router.get(
    "/",
    requireAuth,
    getDigitalAssets,
);


router.post(
    "/convert",
    requireAuth,
    convertDigitalAsset,
);


export default router;