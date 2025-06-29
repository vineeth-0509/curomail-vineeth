// api/aurinko/callback

import axios from "axios";
import { waitUntil } from "@vercel/functions";
import { getAccountDetails, getAurinkoAccessToken } from "@/lib/aurinko";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  if (status !== "success") {
    return NextResponse.json(
      { message: "Authorization failed" },
      { status: 400 },
    );
  }

  //get the code from the params to exchange for access token
  const code = params.get("code");
  console.log("Authorization code:", code);
  if (!code) {
    return NextResponse.json({ message: "Code not found" }, { status: 400 });
  }
  const token = await getAurinkoAccessToken(code);
  if (!token) {
    return NextResponse.json(
      { message: "Failed to exchange code for access token" },
      { status: 400 },
    );
  }

  const accountDetails = await getAccountDetails(token.accessToken);
  await db.account.upsert({
    where: {
      id: token.accountId.toString(),
    },
    update: {
      accessToken: token.accessToken,
    },
    create: {
      id: token.accountId.toString(),
      userId,
      emailAddress: accountDetails.email,
      name: accountDetails.name,
      accessToken: token.accessToken,
    },
  });
  // trigger a intial sync of emails (package from @vercel/functions helps in running asynchrous code, because we dont want
  // to wait to user until the sync is complete it can complete in the background)
  waitUntil(
    axios
      .post(`${process.env.NEXT_PUBLIC_URL}/api/intial-sync`, {
        accountId: token.accountId.toString(),
        userId,
      })
      .then((response) => {
        console.log("Initial sync triggered", response.data);
      })
      .catch((error) => {
        console.error("Failed to trigger initial sync", error);
      }),
  );

  console.log("Account Deatils:", accountDetails);
  return NextResponse.redirect(new URL("/mail", req.url));
};
