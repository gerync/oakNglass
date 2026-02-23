import PromoteToJournalistController from "../controllers/promote/journalist.js";
import promoteMiddleware from "../middlewares/promote/promote.js";
import PromoteToAdminController from "../controllers/promote/admin.js";

import express from 'express';

const router = express.Router();

router.post('/journalist', promoteMiddleware, PromoteToJournalistController);
router.post('/admin', promoteMiddleware, PromoteToAdminController);

export default router;