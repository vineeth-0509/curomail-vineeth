"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import React, { useState } from "react";

// import { TooltipProvider } from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import AccountSwitcher from "./account-switcher";
import Sidebar from "./sidebar";
import ThreadList from "./thread-list";
import ThreadDisplay from "./thread-display";
import { Button } from "@/components/ui/button";
import ComposeButton from "./compose-button";
import SearchBar from "./search-bar";
import AskAi from "./ask-ai";

type Props = {
  defaultLayout: number[] | undefined;
  navCollapsedSize: number;
  defaultCollapsed: boolean;
};

export default function Mail({
  defaultLayout = [20, 32, 48],
  navCollapsedSize,
  defaultCollapsed,
}: Props) {
  const [collapsed, setIsCollapsed] = useState(defaultCollapsed);
  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          console.log(sizes);
        }}
        className="h-full min-h-screen items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={40}
          onCollapse={() => {
            setIsCollapsed(true);
          }}
          onResize={() => {
            setIsCollapsed(false);
          }}
          className={cn(
            collapsed && "min-w-[50px] transition-all duration-300 ease-in-out",
          )}
        >
          <div className="flex h-full flex-1 flex-col">
            <div
              className={cn(
                "flex h-[52px] items-center justify-between",
                collapsed ? "h-[52px]" : "px-2",
              )}
            >
              {/* //account switcher */}
              <AccountSwitcher isCollapsed={false} />
            </div>
            <Separator />
            Sidebar
            <Sidebar isCollapsed={collapsed} />
            <div className="flex-1">
              <AskAi isCollapsed={collapsed}/>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="inbox">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="inbox"
                  className="text-zinc-800 dark:text-zinc-200"
                >
                  Inbox
                </TabsTrigger>
                <TabsTrigger
                  value="done"
                  className="text-zinc-800 dark:text-zinc-200"
                >
                  Done
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            {/* searchBar */}
            <SearchBar/>
            <TabsContent value="inbox">
              <ThreadList />
            </TabsContent>
            <TabsContent value="done">
              <ThreadList />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <ThreadDisplay />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}

//2.51
