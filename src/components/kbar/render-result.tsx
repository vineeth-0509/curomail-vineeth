import { cn } from "@/lib/utils";
import { KBarResults, useMatches } from "kbar";
import { Divide } from "lucide-react";
import React from "react";
import ResultItem from "./resultItem";

const RenderResults = () => {
  const { results, rootActionId } = useMatches();
  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) => {
        if (typeof item === "string") {
          return (
            <div className="px-4 py-2 text-sm text-gray-600 uppercase opacity-50 dark:text-gray-400">
              {item}
            </div>
          );
        }
        return (
      <ResultItem
      action={item}
      active={active}
      currentRootActionId={rootActionId ?? ""}
      />
        )
      }}
    ></KBarResults>
  );
};

export default RenderResults;
