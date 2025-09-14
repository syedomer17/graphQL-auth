import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { sendEmail } from "../utils/sendEmail";
import { string } from "zod";
import crypto from "crypto";

interface AuthPayload {
  token: string;
  user: IUser;
}

interface Context {
  req: any;
}

export const authResolver = {
    register: async ({name, email, password}: {name: string, email: string, password: string}): Promise<string> => {
        let user = await User.find({email});
        if(user) throw new Error("User already exists");

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

       const newUser = new User({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpires
        });

        await newUser.save();

        await sendEmail(email, "Verify your email", `Your OTP is ${otp}. It is valid for 10 minutes.`);

        return "Registration successful! Please verify your email.";
    },

    verifyEmail: async ({ email, otp }: { email: string; otp: string }): Promise<string> => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");
    if (user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) {
      throw new Error("Invalid or expired OTP");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = null;
    await user.save();

    return "Email verified successfully!";
  },

  login: async ({ email, password }: { email: string; password: string }): Promise<AuthPayload> => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");
    if (!user.isVerified) throw new Error("Please verify your email first");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: "1h" });

    return { token, user };
  },

  me: async (_: unknown, req: Context["req"]): Promise<IUser | null> => {
    if (!req.user) throw new Error("Not authenticated");
    return await User.findById(req.user.userId);
  },
};