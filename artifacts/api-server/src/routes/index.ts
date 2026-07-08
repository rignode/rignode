import { Router, type IRouter } from "express";
import healthRouter from "./health";
import nodesRouter from "./nodes";
import jobsRouter from "./jobs";
import statsRouter from "./stats";
import payRouter from "./pay";

const router: IRouter = Router();

router.use(healthRouter);
router.use(nodesRouter);
router.use(jobsRouter);
router.use(statsRouter);
router.use(payRouter);

export default router;
