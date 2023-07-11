import { Router } from "express"
import { signin, signup, logoff } from "../controllers/users.js"

const userrouter = Router()

userrouter.post("/signin", signin)

userrouter.post("/signup", signup)

userrouter.post("/logoff", logoff)

export default userrouter;