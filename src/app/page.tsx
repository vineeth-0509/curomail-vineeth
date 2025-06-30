"use client";

import { Button } from "@/components/ui/button";
import LinkAccountButton from "@/components/ui/link-account-button";
import { SparklesCore } from "@/components/ui/sparkles";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { SignUp, useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  const { userId } = useAuth();
  const text = "Streamline your inbox: connect faster, communicate smarter.";
  const words = [
     {
    text: "Streamline",
    className: "text-red-500",
  },
  {
    text: "your",
    className: "text-yellow-500",
  },
  {
    text: "inbox:",
    className: "text-green-500",
  },
  {
    text: "connect",
    className: "text-blue-500",
  },
  {
    text: "faster,",
    className: "text-purple-500",
  },
  {
    text: "communicate",
    className: "text-pink-500",
  },
  {
    text: "smarter.",
    className: "text-orange-500",
  },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-6 bg-black p-6 text-white">
      {/* Section 1: LinkAccount */}
      
        <div className="bg-black">
          {userId ? (
            <>
              <LinkAccountButton />
            </>
          ) : (
            <>
              <Link href="/sign-up">
                <Button
                  asChild
                  className="animate-bounce bg-black text-white hover:-translate-y-2 hover:bg-black"
                >
                  SignUp
                </Button>
              </Link>
            </>
          )}
        </div>
      

      {/* Section 2: Curo-Mail + Sparkles */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden bg-black">
        <h1 className="z-20 text-center text-3xl font-bold md:text-5xl lg:text-6xl">
          Curo-Mail
        </h1>

        <div className="relative mt-4 h-20 w-[20rem]">
          {/* Sparkle Gradients */}
          <div className="absolute inset-x-10 top-0 h-[4px] w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
          <div className="absolute inset-x-10 top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="absolute inset-x-40 top-0 h-[6px] w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent blur-sm" />
          <div className="absolute inset-x-40 top-0 h-[3px] w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />

          {/* Smaller Sparkles */}
          <SparklesCore
            background="transparent"
            minSize={0.3}
            maxSize={0.7}
            particleDensity={5000}
            className="h-full w-full"
            particleColor="#FFFFFF"
          />
          <div className="absolute inset-0 h-full w-full bg-black [mask-image:radial-gradient(250px_100px_at_top,transparent_20%,white)]" />
        </div>
      </div>

      {/* Section 3: Typewriter Effect */}
      <div className="bg-black">
        <TypewriterEffect words={words} />
      </div>
    </div>
  );
}
