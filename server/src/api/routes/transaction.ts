import { router } from "../trpc";
import { recordTransaction, getUserTransactions } from "../controllers/transactionController";

export default router({
  recordTransaction,
  getUserTransactions,
});