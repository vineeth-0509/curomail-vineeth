"use client";
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch,
  type Action,
} from "kbar";
import RenderResults from './render-result'
import { useLocalStorage } from "usehooks-ts";
export default function KBar({ children }: { children: React.ReactNode }) {
  const [tab,setTab] = useLocalStorage('curomail-tab','inbox')
  const actions:Action[] = [
  {  id:'inboxAction',
    name:'Inbox',
  shortcut:['g','i'],
section:'Navigation',
subtitle: 'View your inbox',
perform:()=>{
 setTab('inbox')
}
}
  ]
  return (
    <KBarProvider actions={actions}>
      <ActualComponent>{children}</ActualComponent>
    </KBarProvider>
  );
}

const ActualComponent = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <KBarPortal>
         <KBarPositioner className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm scrollbar-hide !p-0 z-[99999]">
                    <KBarAnimator className="max-w-[600px] !mt-64 w-full bg-white dark:bg-gray-800 text-foreground dark:text-gray-200 shadow-lg border dark:border-gray-700 rounded-lg overflow-hidden relative !-translate-y-12">
                        <div className="bg-white dark:bg-gray-800">
                            <div className="border-x-0 border-b-2 dark:border-gray-700">
                                <KBarSearch className="py-4 px-6 text-lg w-full bg-white dark:bg-gray-800 outline-none border-none focus:outline-none focus:ring-0 focus:ring-offset-0" />
                            </div>
                            <RenderResults/>
                        </div>
                    </KBarAnimator>
                </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
