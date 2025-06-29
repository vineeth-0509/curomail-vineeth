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
      className="text-white"
    >
      Link Account
    </Button>
  );
};
export default LinkAccountButton;
