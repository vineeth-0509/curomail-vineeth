import dynamic from "next/dynamic";
import React from "react";
import Mail from "./mail";
import ThemeToggle from "@/components/theme-toggle";
const ComposeButton = dynamic(()=>{
  return import('./compose-button')
})

const MailDashboard = () => {
  return (
    <div>
      <div className="absolute bottom-14 left-5">
        <ThemeToggle />
        <ComposeButton />
      </div>
      <Mail
        defaultLayout={[20, 32, 48]}
        defaultCollapsed={false}
        navCollapsedSize={4}
      />
    </div>
  );
};

export default MailDashboard;
