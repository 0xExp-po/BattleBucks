import React, { createContext, useEffect } from "react"
import io, { Socket } from "socket.io-client";

const BaseUrl = "http://localhost:5001";

const socket = io(BaseUrl, {
  query: {
    // move this to env
    key: 12345
  }
});

const SocketContext = createContext<Socket>(socket);

export default SocketContext;


export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to socket");
    });
    // Function to handle cleanup actions
    const handleCleanup = () => {
      socket.emit("userOffline", { userName: "@VJBass" });
      socket.disconnect();
    };

    window.addEventListener('beforeunload', handleCleanup);


    socket.on("disconnect", () => {
      console.log("disconnected from socket");
    })
    socket.emit("userOnline", { userName: "VJBass" });
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}