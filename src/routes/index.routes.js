import { Router } from "express";
import transactionsrouter from "./transactions.routes.js";
import userrouter from "./users.routes.js";

const router = Router();

router.use(transactionsrouter);
router.use(userrouter);


export default router;