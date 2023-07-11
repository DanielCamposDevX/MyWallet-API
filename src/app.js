/// Imports API Connection & Security
import express from "express";
import cors from "cors";

/// Imports Database & Security
import dotenv from "dotenv";
dotenv.config();

/// API Connection ///
const app = express();
app.use(express.json());
app.use(cors());

/// Router ///
import router from "./routes/index.routes.js";
app.use(router)

/// PORT Declaration and Listen
const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})