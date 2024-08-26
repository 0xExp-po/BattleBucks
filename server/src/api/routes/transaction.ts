import { router } from "../trpc";
import {
  recordTransaction,
  getUserTransactions,
  getTotalTransactions,
  getTotalAmount,
} from "../controllers/transactionController";

export default router({
  recordTransaction,
  getUserTransactions,
  getTotalTransactions,
  getTotalAmount,
});
