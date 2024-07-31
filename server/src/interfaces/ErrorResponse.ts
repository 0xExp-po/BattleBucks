import { commonResponse } from "./MessageResponse";

export default interface ErrorResponse extends MessageResponse {
  stack?: string;
}
