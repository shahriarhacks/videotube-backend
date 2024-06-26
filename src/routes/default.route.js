import { Router } from "express";
import userRouter from "./user.route.js";

const router = Router();

const moduleRoutes = [
   {
      path: "/users",
      route: userRouter,
   },
];

moduleRoutes.forEach((moduleRoute) => {
   router.use(moduleRoute.path, moduleRoute.route);
});

export default router;
