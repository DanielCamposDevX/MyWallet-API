import { MongoClient } from "mongodb";
import dotenv from "dotenv"

dotenv.config()

const mongoClient = new MongoClient(process.env.DATABASE_URL);
try {
    await mongoClient.connect()
    console.log("Conectado ao DB")
}
catch (error) {
    console.log(error)
}
export const db = mongoClient.db()