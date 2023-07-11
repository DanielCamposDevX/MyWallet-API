/// Imports API Connection & Security
import express from "express";
import cors from "cors";


/// Imports Database & Security
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();


/// API Connection ///
const app = express();
app.use(express.json());
app.use(cors());

/// Controllers ///
import { signin, signup, logoff } from "./controllers/users.js";
import { gettransactions, posttransactions } from "./controllers/transactions.js";


/// Database Connection ///
const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
    await mongoClient.connect()
}
catch (error) {
    console.log(error)
}
export const db = mongoClient.db()

//// ENDPOINTS ////

app.get(("/transactions"), gettransactions)

app.post(("/transactions"), posttransactions)

app.post("/signin", signin)

app.post("/signup", signup)

app.post("/logoff", logoff)


/// PORT Declaration and Listen
const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})