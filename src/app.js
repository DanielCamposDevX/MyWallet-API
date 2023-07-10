/// Package Imports ///
import Joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";


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




/// Database Connection ///
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;
try {
    await mongoClient.connect()
    db = mongoClient.db()
}
catch (error) {
    console.log(error)
}
////Joi Schemas ////
const userschema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(3).required(),
});
const transactionschema = Joi.object({
    value: Joi.number().positive().required(),
    description: Joi.string().required(),
    type: Joi.string().valid("in", "out")
})

//// ENDPOINTS ////


app.get(("/transactions"), async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer", "");
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
})


app.post(("/transactions"), async (req, res) => {
    const { Authorization } = req.headers;
    const token = Authorization?.replace("Bearer", "");
    try {
        const session = await db.collection("sessions").findOne({ token: token });
        if (!session) { return res.sendStatus(401).send("Unauthorized") }
        if (!token) { return res.sendStatus(401) }
        const { value, description, type } = req.body;
        const data = { value, description, type };
        const validation = transactionschema.validate(data, { abortEarly: false });
        if (validation.error) {
            const errors = validation.error.details.map((detail) => detail.message);
            res.status(422).send(errors);
        }
        const transaction = { data, sessionId: session.userId, date: dayjs().format('DD/MM') };
        await db.collection("transactions").insertOne(transaction);
        return res.status(201).send("Created")
    }
    catch (error) {
        res.status(500).send(error.message);
    }
})

app.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    const validation = userschema.validate({ email, password }, { abortEarly: false })
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }
    try {
        const user = await db.collection('users').findOne({ email });
        if (!user) { return res.status(404).send('E-mail not found!'); }
        const compare = bcrypt.compareSync(password, user.password);
        if (!compare) { return res.status(401).send('Wrong password'); }

        const exists = await db.collection("sessions").findOne(user.id)
        if (exists) { return res.status(200).send(exists.token) }
        const token = uuid();
        await db.collection("sessions").insertOne({ userId: user._id, token })
        return res.status(200).send(token);
    }
    catch (error) {
        return res.status(500).send(error.message);
    }
})

app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    const validation = userschema.validate({ email, password }, { abortEarly: false })
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        res.status(422).send(errors)
    }
    try {
        const user = await db.collection('users').findOne({ email: email });
        if (user) { return res.status(409).send('Email already in use'); }

        const hash = bcrypt.hashSync(password, 10);
        await db.collection('users').insertOne({ name, email, password: hash });
        return res.status(201).send('created');
    }
    catch (error) {
        return res.status(500).send(error.message);
    }
})

app.post("/logoff", async (req, res) => {
    const { Authorization } = req.headers;
    const token = Authorization?.replace("Bearer", "");
    try {
        await db.collection("sessions").deleteOne({ token: token });
    }
    catch (error) {
        return res.status(500).send(error.message);
    }
})










/// PORT Declaration and Listen
const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})