/// Package Imports ///
import dayjs from "dayjs";
/// Configs imports ///
import { db } from "../database/database.connection.js";
/// Joi Schema ///
import { transactionschema } from "../schemas/transactions.schemas.js";

/// ENDPOINTS ///
export async function gettransactions(req, res) {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    try {
        if (!token) { return res.status(401).send("Token error") }
        const session = await db.collection("sessions").findOne({ token });
        if (!session) { return res.status(401).send("Session Expired") }
        const transactions = await db.collection("transactions").find({ sessionId: session.userId }).toArray();
        return res.send(transactions)
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}

export async function posttransactions(req, res) {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    try {
        if (!token) { return res.status(401).send("Token Error") }
        const session = await db.collection("sessions").findOne({ token });
        if (!session) { return res.status(401).send("Session Expired") }

        const { value, description, type } = req.body;
        const data = { value, description, type };
        const validation = transactionschema.validate(data, { abortEarly: false });
        if (validation.error) {
            const errors = validation.error.details.map((detail) => detail.message);
            return res.status(422).send(errors);
        }
        const transaction = { data, sessionId: session.userId, date: dayjs().format('DD/MM') };
        await db.collection("transactions").insertOne(transaction);
        return res.status(201).send("Created")
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}