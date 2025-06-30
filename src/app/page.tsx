"use client";

import { Button } from "@/components/ui/button";
import LinkAccountButton from "@/components/ui/link-account-button";
import { SparklesCore } from "@/components/ui/sparkles";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { useAuth } from "@clerk/nextjs";

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
      className: "text-indigo-500",
    },
    {
      text: "faster,",
      className: "text-purple-500",
    },
    {
      text: "communicate",
      className: "text-orange-500",
    },
    {
      text: "smarter.",
      className: "text-blue-500",
    },
  ];
  // return (
  //   <div>
  //     <div className="flex h-[40rem] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-black">
  //       {/* Move LinkAccountButton above the title */}
  //       <button className="bg-dark mb-4 flex items-center justify-center text-white">
  //         <div>
  //           <LinkAccountButton />
  //         </div>
  //       </button>

  //       <h1 className="relative z-20 text-center text-3xl font-bold text-white md:text-7xl lg:text-9xl">
  //         Curo-Mail
  //       </h1>

  //       <div className="relative h-40 w-[40rem]">
  //         {/* Gradients */}
  //         <div className="absolute inset-x-20 top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
  //         <div className="absolute inset-x-20 top-0 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
  //         <div className="absolute inset-x-60 top-0 h-[5px] w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent blur-sm" />
  //         <div className="absolute inset-x-60 top-0 h-px w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />

  //         {/* Sparkles + Typewriter */}
  //         <SparklesCore
  //           background="transparent"
  //           minSize={0.4}
  //           maxSize={1}
  //           particleDensity={1200}
  //           className="h-full w-full"
  //           particleColor="#FFFFFF"
  //         />
  //         <div className="absolute inset-0 h-full w-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]" />

  //         {/* 
  //       <div className="flex flex-col space-y-4 space-x-0 md:flex-row md:space-y-0 md:space-x-4">
  //         <Button className="h-10 w-40 rounded-xl border border-transparent bg-black text-sm text-white dark:border-white" />
  //       </div> */}
  //       </div>
  //       <div>
  //         <TypewriterEffect words={words} />
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
  <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center space-y-6 p-6">
    {/* Section 1: LinkAccount */}
    <button className='bg-black text-white'>
    <div className="bg-black">
      <LinkAccountButton />
    </div>
    </button>

    {/* Section 2: Curo-Mail + Sparkles */}
    <div className="relative flex flex-col items-center justify-center bg-black overflow-hidden">
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
