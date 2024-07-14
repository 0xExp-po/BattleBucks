import io from "socket.io-client";
const BaseUrl = "http://localhost:5001";
export const socket = io(BaseUrl);
