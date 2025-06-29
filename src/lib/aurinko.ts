"use server";
import axios from "axios";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";

export const getAurinkoAuthUrl = async (
  serviceType: "Google" | "Office365",
) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not found");
    }
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new Error("User not found in database");
    const params = new URLSearchParams({
      clientId: process.env.AURINKO_CLIENT_ID!,
      serviceType,
      scopes: "Mail.Read Mail.Send Mail.ReadWrite Mail.Drafts Mail.All",
      responseType: "code",
      returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`,
    });
    return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
  } catch (error) {
    console.log("Error in getAurinkoAuthUrl:", error);
    throw new Error("Failed to generate Aurinko auth URL");
  }
};

//function to get the access tokenn from aurinko using the code
export const getAurinkoAccessToken = async (code: string) => {
  try {
    const username = process.env.AURINKO_CLIENT_ID!;
    if (!username) {
      throw new Error("AURINKO_CLIENT_ID is not set");
    }
    const password = process.env.AURINKO_CLIENT_SECRET!;
    if (!password) {
      throw new Error("AURINKO_CLIENT_SECRET is not set");
    }
    const response = await axios.post(
      `https://api.aurinko.io/v1/auth/token/${code}`,
      {},
      {
        auth: {
          username,
          password,
        },
      },
    );
    return response.data as {
      accountId: number;
      accessToken: string;
      userId: string;
      userSession: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching Aurinko token: ", error.response?.data);
    } else {
      console.error("unexpected error fetching Aurinko token:", error);
    }
  }
};

//function to get the user info(account details) from aurinko using the access token.
export const getAccountDetails = async (accessToken: string) => {
  try {
    const response = await axios.get("https://api.aurinko.io/v1/account", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data as {
      email: string;
      name: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error in getAccountDetails:", error.response?.data);
      throw new Error(`Failed to get account details: ${error.response?.data}`);
    }
    console.error("Unexpected error fetching account details:", error);
    throw error;
  }
};
