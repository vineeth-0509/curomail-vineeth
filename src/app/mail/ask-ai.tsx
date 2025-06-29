"use client";
import React from "react";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";
import { Send, Sparkle } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import useThreads from "@/hooks/use-threads";
const transitionDebug: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
};

const AskAi = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const { accountId } = useThreads();
  const { input, handleInputChange, handleSubmit, messages, setInput } =
    useChat({
      api: "src/app/api/chat/route.ts",
      body: {
        accountId,
      },
      onError: (error) => {
        if (error.message.includes("Limit reached")) {
          toast.error("You have reached the limit for the day.");
        }
      },
      initialMessages: [],
    });
  if (isCollapsed) return null;

  return (
    <div className="h-4">
      <motion.div className="flex flex-1 flex-col items-end rounded-lg bg-gray-100 p-4 pb-4 shadow-inner dark:bg-gray-900">
        <div
          className="flex max-h-[50vh] w-full flex-col gap-2 overflow-y-scroll"
          id="message-container"
        >
          <AnimatePresence mode="wait">
            {messages.map((message) => {
              return (
                <motion.div
                  key={message.id}
                  layout="position"
                  className={cn(
                    "bg-rgay-200 z-10 mt-2 max-w-[250px] rounded-2xl break-words dark:bg-gray-800",
                    {
                      "self-end text-gray-900 dark:text-gray-100":
                        message.role === "user",
                      "self-start bg-blue-500 text-white":
                        message.role === "assistant",
                    },
                  )}
                  layoutId={`container-[${messages.length - 1}]`}
                  transition={transitionDebug}
                >
                  <div className="px-3 py-2 text-[15px] leading-[15px]">
                    {message.content}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        {messages.length > 0 && <div className="h-4" />}
        <div className="w-full">
          {messages.length === 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-4">
                <Sparkle className="size-6 text-gray-600" />
                <div>
                  <p className="text-gray-900 dark:text-gray-100">
                    Ask AI anything about your emails
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get answers to your questions about your emails
                  </p>
                </div>
                <div className="h-2"></div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200"
                    onClick={() => {
                      setInput("What can i ask?");
                    }}
                  >
                    What can I ask?
                  </span>
                  <span
                    className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200"
                    onClick={() => {
                      setInput("When is my next meeting?");
                    }}
                  >
                    What is next meeting?
                  </span>
                  <span
                    className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200"
                    onClick={() => {
                      setInput("What are my daily check-lists?");
                    }}
                  >
                    What are my daily check-lists?
                  </span>
                </div>
              </div>
            </div>
          )}
          <form className="flex w-full" onSubmit={handleSubmit}>
            <input
              type="text"
              className="relative h-9 flex-grow rounded-full border border-gray-200 bg-white px-3 py-1 text-[15px] outline-none placeholder:text-[13px]"
              placeholder="Ask AI anything about your emails"
              value={input}
              onChange={handleInputChange}
            />
            <motion.div
              className="pointer-events-none absolute z-10 flex h-9 w-[250px] items-center overflow-hidden rounded-full bg-gray-200 break-words [word-break:break-word] dark:bg-gray-800"
              key={messages.length}
              layout="position"
              layoutId={`container-[${messages.length}]`}
              transition={transitionDebug}
              initial={{ opacity: 0.6, zIndex: -1 }}
              animate={{ opacity: 0.6, zIndex: -1 }}
              exit={{ opacity: 1, zIndex: 1 }}
            >
              <div className="px-3 py-2 text-[15px] leading-[15px] text-gray-900 dark:text-gray-100">
                {input}
              </div>
            </motion.div>
            <button
              type="submit"
              className="ml-2 flex size-9 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800"
            >
              <Send className="size-4 text-gray-500 dark:text-gray-300" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AskAi;
