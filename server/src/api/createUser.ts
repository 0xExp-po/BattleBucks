import { publicProcedure } from ".";
import { z } from "zod";
import { prisma } from "../app";
import { commonResponse } from "../interfaces/MessageResponse";

// Common Response Schema


export const createUser = publicProcedure.input(z.object({
    name: z.string(),
    username: z.string(),
    phoneNo: z.string().nullable(),
    profilePicture: z.string().nullable(),
    bio: z.string().nullable(),
})).output(commonResponse(z.object({
    name: z.string(),
    username: z.string(),
    phoneNo: z.string().nullable(),
    profilePicture: z.string().nullable(),
    bio: z.string().nullable(),
})).nullable()).mutation(async (req): Promise<any> => {
    const { name, username, phoneNo, profilePicture, bio } = req.input;
    const isUserExist = await prisma.user.findUnique({ where: { username } });

    if (isUserExist) {
        return {
            status: 400,
            error: "User already exist"
        }
    }
    try {

        const user = await prisma.user.create({
            data: {
                name,
                username,
                phoneNo,
                profilePicture,
                bio
            }
        });

        return {
            status: 200,
            result: user
        }
    } catch (error) {
        return {
            status: 400,
            result: null,
            error: "Something went wrong"
        }
    }
})