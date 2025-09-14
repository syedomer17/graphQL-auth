import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import User, { IUser } from "../models/User";
import { sendEmail } from "../utils/sendEmail";
import crypto from "crypto";

interface AuthPayload {
  token: string;
  user: IUser;
}

interface Context {
  req: any;
}

export const authResolver = {
  register: async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }): Promise<string> => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new GraphQLError("User already exists", {
        extensions: { code: "USER_EXISTS", http: { status: 400 } },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });

    await newUser.save();

    await sendEmail(
      email,
      "Verify your email",
      `Your OTP is ${otp}. It is valid for 10 minutes.`
    );

    return "Registration successful! Please verify your email.";
  },

  verifyEmail: async ({
    email,
    otp,
  }: {
    email: string;
    otp: string;
  }): Promise<string> => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new GraphQLError("User not found", {
        extensions: { code: "USER_NOT_FOUND", http: { status: 404 } },
      });
    }
    if (user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) {
      throw new GraphQLError("Invalid or expired OTP", {
        extensions: { code: "INVALID_OTP", http: { status: 400 } },
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = null;
    await user.save();

    return "Email verified successfully!";
  },

  login: async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<AuthPayload> => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new GraphQLError("User not found", {
        extensions: { code: "USER_NOT_FOUND", http: { status: 404 } },
      });
    }
    if (!user.isVerified) {
      throw new GraphQLError("Please verify your email first", {
        extensions: { code: "EMAIL_NOT_VERIFIED", http: { status: 403 } },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new GraphQLError("Invalid credentials", {
        extensions: { code: "INVALID_CREDENTIALS", http: { status: 401 } },
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    return { token, user };
  },

  me: async (_: unknown, req: Context["req"]): Promise<IUser | null> => {
    if (!req.user) {
      throw new GraphQLError("Not authenticated", {
        extensions: { code: "UNAUTHENTICATED", http: { status: 401 } },
      });
    }
    return await User.findById(req.user.userId);
  },
};
