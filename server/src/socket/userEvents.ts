import { Socket } from "socket.io";
import { prisma } from "../app";
import { User } from "@prisma/client";

export async function userOnline(socket : Socket) : Promise<User | undefined> {
  return new Promise<User | undefined>(async (resolve, reject) => {
    socket.on("userOnline" , async (data) => {
      let result;
      console.log(data);
      try {
        result = await prisma.user.update({
          where: {
            username: data.userName
          },
          data: {
            isOnline: true
          }
        });
      } catch (error) {
        // Handle the error here
        console.error(error);
        socket.emit("Error" , "UserNot Found")
        resolve(undefined);
      }
      socket.emit("userInfo" , result);
      if (result) {
        resolve(result);
      } else {
        resolve(undefined);
      }
    });
  });
}

export async function userOffline(socket:Socket) : Promise<User> {
 return new Promise<User>( async (resolve, reject) => {
  socket.on("userOffline" , async (data) => {
  console.log(data);
  const result = await prisma.user.update({
    where: {
      username: data.userName
    },
    data: {
      isOnline: false
    }
  });
  console.log(result);
})
})
}
