
import type { AppRouter } from '../../../server/src/api/router';
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>();