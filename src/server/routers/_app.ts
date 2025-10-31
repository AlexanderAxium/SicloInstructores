import { router } from "../trpc";
import { brandingsRouter } from "./brandings";
import { classesRouter } from "./classes";
import { companyInfoRouter } from "./companyInfo";
import { coversRouter } from "./covers";
import { disciplinesRouter } from "./disciplines";
import { formulasRouter } from "./formulas";
import { importRouter } from "./imports";
import { instructorRouter } from "./instructor";
import { instructorCategoriesRouter } from "./instructor-categories";
import { paymentsRouter } from "./payments";
import { penaltiesRouter } from "./penalties";
import { periodsRouter } from "./periods";
import { rbacRouter } from "./rbac";
import { statisticsRouter } from "./statistics";
import { themeRidesRouter } from "./theme-rides";
import { userRouter } from "./user";
import { workshopsRouter } from "./workshops";

export const appRouter = router({
  user: userRouter,
  rbac: rbacRouter,
  companyInfo: companyInfoRouter,
  instructor: instructorRouter,
  instructorCategories: instructorCategoriesRouter,
  classes: classesRouter,
  payments: paymentsRouter,
  disciplines: disciplinesRouter,
  periods: periodsRouter,
  penalties: penaltiesRouter,
  workshops: workshopsRouter,
  themeRides: themeRidesRouter,
  covers: coversRouter,
  formulas: formulasRouter,
  brandings: brandingsRouter,
  statistics: statisticsRouter,
  import: importRouter,
});

export type AppRouter = typeof appRouter;
