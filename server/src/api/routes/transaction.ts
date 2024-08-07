import { router } from "../trpc";
import {
  recordTransaction,
  getUserTransactions,
  getTotalTransactions,
} from "../controllers/transactionController";

export default router({
  recordTransaction,
  getUserTransactions,
  getTotalTransactions,
});
