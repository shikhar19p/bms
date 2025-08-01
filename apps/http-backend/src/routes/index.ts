import { Router } from "express";
import userAuthRouter from "./auth-routes/user/auth.routes";


const allRoutes:Router =Router();

allRoutes.use('/auth',userAuthRouter)


export default allRoutes;