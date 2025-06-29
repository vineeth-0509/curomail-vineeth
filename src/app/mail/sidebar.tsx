"use client";
import React from "react";
import { Nav } from "./nav";

import {
  AlertCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  MessagesSquare,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";
type Props = { isCollapsed: boolean };

const SideBar = ({ isCollapsed }: Props) => {
  const [tab] = useLocalStorage("normalhuman-tab", "inbox");
  const [accountId] = useLocalStorage("accountId", "");
  const { data: inboxThreads } = api.account.getNumThreads.useQuery({
    accountId,
    tab: "inbox",
  });
  const { data: draftThreads } = api.account.getNumThreads.useQuery({
    accountId,
    tab: "draft",
  });
  const { data: sentThreads } = api.account.getNumThreads.useQuery({
    accountId,
    tab: "sent",
  });
  const refetchInterval = 5000;

  return (
    <>
      <Nav
        isCollapsed={isCollapsed}
        links={[
          {
            title: "Inbox",
            label: inboxThreads?.toString() ?? "0",
            icon: Inbox,
            variant: tab === "inbox" ? "default" : "ghost",
          },
          {
            title: "Drafts",
            label: draftThreads?.toString() ?? "0",
            icon: File,
            variant: tab === "drafts" ? "default" : "ghost",
          },
          {
            title: "Sent",
            label: sentThreads?.toString() ?? "0",
            icon: Send,
            variant: tab === "sent" ? "default" : "ghost",
          },
        ]}
      />
    </>
  );
};

export default SideBar;
