import { createContext, useEffect, useState } from "react"
import io, { Socket } from "socket.io-client";

const BaseUrl = "http://localhost:5000";

const SocketContext = createContext<Socket>({} as Socket);

export default SocketContext;

export const SocketProvider = ({ token, children }: { token: string, children: React.ReactNode }) => {
  const [socket] = useState(() => {
    return io(BaseUrl, {
      extraHeaders: { token: token }
    });
  });

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to socket");
    });
    // Function to handle cleanup actions
    const handleCleanup = () => {
      socket.disconnect();
    };

    window.addEventListener('beforeunload', handleCleanup);

    socket.on("disconnect", () => {
      console.log("disconnected from socket");
    })
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}