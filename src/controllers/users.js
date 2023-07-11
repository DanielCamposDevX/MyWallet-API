/// Package Imports ///
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
/// Configs imports ///
import { db } from "../database/database.connection.js";
/// Joi Schema ///
import { userschema } from "../schemas/users.schemas.js";

/// ENDPOINTS ///
export async function signin(req, res) {
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

        const exists = await db.collection("sessions").findOne({ userId: user._id });
        if (exists) { return res.status(200).send({ token: exists.token, name: user.name }) };
        const token = uuid();
        await db.collection("sessions").insertOne({ userId: user._id, token });
        return res.status(200).send({ token, name: user.name });
    }
    catch (error) {
        return res.status(500).send(error.message);
    }
}


export async function signup(req, res){
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
}


export async function logoff (req, res){
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    console.log(token)
    try {
        const user = await db.collection("sessions").findOne({ token: token });
        if (!user) { return res.status(404).send("User Error") };
        await db.collection("sessions").deleteOne(user);
        return res.status(200).send("logged off");
    }
    catch (error) {
        return res.status(500).send(error.message);
    }
}