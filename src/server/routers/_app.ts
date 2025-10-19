import { router } from "../trpc";
import { companyInfoRouter } from "./companyInfo";
import { rbacRouter } from "./rbac";
import { userRouter } from "./user";

export const appRouter = router({
  user: userRouter,
  rbac: rbacRouter,
  companyInfo: companyInfoRouter,
});

export type AppRouter = typeof appRouter;
