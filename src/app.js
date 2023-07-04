/// Package Imports ///
import Joi from "joi";


/// Imports API Connection & Security
import express from "express";
import cors from "cors";


/// Imports Database & Security
import { MongoClient } from "mongodb";
import dotenv from "dotenv";


/// API Connection ///
const app = express();
app.use(express.json());
app.use(cors);




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
    password: Joi.string().min(3).required()
  });


//// ENDPOINTS ////

app.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    const validation = userschema.validate({ email: email, password: password })
    try {
        const user = await db.collection('users').findOne({ email: email });
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
        return res.status(500).send(error);
     }
})











/// PORT Declaration and Listen
const PORT = 5000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`))