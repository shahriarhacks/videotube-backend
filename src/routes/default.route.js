import { Router } from "express";
import userRouter from "./user.route.js";
import videoRouter from "./video.route.js";

const router = Router();

const moduleRoutes = [
   {
      path: "/users",
      route: userRouter,
   },
   {
      path: "/videos",
      route: videoRouter,
   },
];

moduleRoutes.forEach((moduleRoute) => {
   router.use(moduleRoute.path, moduleRoute.route);
});

export default router;
