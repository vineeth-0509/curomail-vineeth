"use client";
import React from "react";
import { getAurinkoAuthUrl } from "@/lib/aurinko";
import { Button } from "./button";

const LinkAccountButton = () => {
  return (
    <Button
      onClick={async () => {
        const authUrl = await getAurinkoAuthUrl("Google");
        console.log(authUrl);
        window.location.href = authUrl;
      }}
      className="animate-bounce bg-black text-white hover:bg-black"
    >
      Link Account
    </Button>
  );
};
export default LinkAccountButton;
