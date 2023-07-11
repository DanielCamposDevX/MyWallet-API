import { Router } from "express"
import { gettransactions, posttransactions } from "../controllers/transactions.js"

const transactionsrouter = Router();

transactionsrouter.get(("/transactions"), gettransactions)

transactionsrouter.post(("/transactions"), posttransactions)

export default transactionsrouter;