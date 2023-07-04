/// Package Imports ///
import Joi from "joi";


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
const mongoClient = new MongoClient('mongodb://localhost:27017/wallet');///process.env.DATABASE_URL
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
    password: Joi.string().min(3).required()
});


//// ENDPOINTS ////

app.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    const validation = userschema.validate({email, password })
    if(validation.error){
        return res.send.status(422).send(error);
    }
    try {
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(404).send('E-mail not found!');
        }
        else {
            if (user.password === password) {
                return res.status(200).send('TOKEN AQUI');//// Colocar um token /////
            }
            else {
                return res.status(401).send('Wrong password');
            }
        }
    }
    catch (error) {
        return res.status(500).send(error.message);
    }
})

app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    const validation = userschema.validate({ email, password })
    if(validation.error){
        return res.send.status(422).send(validation.error);
    }
    try{
        const user = await db.collection('users').findOne({email});
        if(!user){
            await db.collection('users').insertOne({name, email, password});///Necessidade de criptografia
            return res.status(201).send('created');
        }
        else{
            return res.status(409).send('Email already in use');
        }
    }
    catch(error){
        return res.status(500).send(error.message);
    }
})










/// PORT Declaration and Listen
const PORT = 5000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`))