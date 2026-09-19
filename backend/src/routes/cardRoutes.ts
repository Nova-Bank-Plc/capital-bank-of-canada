import { Router } from "express";

import {
    getCards,
    getCardRequests,
    requestCard,
    toggleCardFreeze,
} from "../controllers/cardController.js";

import {
    requireAuth,
} from "../middleware/authMiddleware.js";


const router = Router();


/* =========================================
   GET CUSTOMER CARDS
========================================= */

router.get(
    "/",
    requireAuth,
    getCards
);


/* =========================================
   GET CUSTOMER CARD REQUESTS
========================================= */

router.get(
    "/requests",
    requireAuth,
    getCardRequests
);


/* =========================================
   REQUEST A NEW / REPLACEMENT CARD
========================================= */

router.post(
    "/requests",
    requireAuth,
    requestCard
);


/* =========================================
   FREEZE / UNFREEZE CARD
========================================= */

router.patch(
    "/:cardId/freeze",
    requireAuth,
    toggleCardFreeze
);


export default router;