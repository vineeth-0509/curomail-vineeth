// 'use client'
// import React from 'react'
// import EmailEditor from './email-editor'
// import { api, type RouterOutputs } from '@/trpc/react'
// import useThreads from '@/hooks/use-threads'
// import { Toaster } from '@/components/ui/sonner'
// import { toast } from 'sonner'

// const ReplyBox = () => {
//   const {threadId, accountId} = useThreads();
//   const {data: replyDetails }= api.account.getReplyDetails.useQuery({
//     threadId: threadId ?? '',
//     accountId
//   })
//   if(!replyDetails) return null;
//   return <Component replyDetails={replyDetails}/>
// }

// const Component = ({replyDetails}:{replyDetails: RouterOutputs['account']['getReplyDetails']})=>{
//  const {threadId, accountId} = useThreads();
//  const [subject, setSubject] = React.useState(replyDetails.subject.startsWith('Re:')? replyDetails.subject : `Re: ${replyDetails.subject}`);
//  const [toValues,setToValues] = React.useState<{label:string, value: string}[]>(replyDetails.to.map(to => ({label: to.address, value: to.address})));
//  const [ccValues, setCcValues] = React.useState<{label: string, value: string}[]> (replyDetails.cc.map(cc =>({label:cc.address, value: cc.address})));

//  React.useEffect(()=>{
//   if(!threadId || !replyDetails) return;
//   if(!replyDetails.subject.startsWith("Re:")){
//     setSubject(`Re: ${replyDetails.subject}`)
//   } else{
//     setSubject(replyDetails.subject)
//   }
//   setToValues(replyDetails.to.map(to => ({label: to.address, value: to.address})))
//   setCcValues(replyDetails.cc.map(cc => ({label: cc.address, value:cc.address})))
//  },[threadId, replyDetails]);

//  const sendEmail = api.account.sendEmail.useMutation()
//  const handleSend = async (value: string)=>{
// if(!replyDetails) return
// sendEmail.mutate({
//   accountId, threadId: threadId ?? undefined,
//   body: value,
//   subject,
//   from:  replyDetails.from,
//   to: replyDetails.to.map(to => ({address:to.address, name: to.name ?? ""})),
//   cc: replyDetails.cc.map(cc =>({address:cc.address, name: cc.name ?? ""})),
//   replyTo: replyDetails.from,
//   inReplyTo: replyDetails.id //this is internetmessageId
// },{
//   onSuccess:()=>{
//    toast.success('Email Sent')
//   },
//   onError:(error)=>{
//     toast.error('Error sending email')
//   }
// })
//  }

//   return (
//     <EmailEditor
//     subject={subject}
//     setSubject={setSubject}

//     toValues={toValues}
//     setToValues={setToValues}

//     ccValues={ccValues}
//     setCcValues={setCcValues}
//     to={replyDetails.to.map(to => to.address)}
//     isSending={sendEmail.isPending}
//     handleSend={handleSend}

//     />
//   )
// }
// export default ReplyBox

"use client";
import React from "react";
import EmailEditor from "./email-editor";
import { api, type RouterOutputs } from "@/trpc/react";
import { toast } from "sonner";
import useThreads from "@/hooks/use-threads";

const ReplyBox = () => {
  const { threadId } = useThreads();
  const { accountId } = useThreads();
  const { data: replyDetails } = api.account.getReplyDetails.useQuery({
    accountId: accountId,
    threadId: threadId || "",
  });
  if (!replyDetails) return <></>;
  return <Component replyDetails={replyDetails} />;
};

const Component = ({
  replyDetails,
}: {
  replyDetails: NonNullable<RouterOutputs["account"]["getReplyDetails"]>;
}) => {
  const { threadId } = useThreads();
  const { accountId } = useThreads();

  const [subject, setSubject] = React.useState(
    replyDetails.subject.startsWith("Re:")
      ? replyDetails.subject
      : `Re: ${replyDetails.subject}`,
  );

  const [toValues, setToValues] = React.useState<
    { label: string; value: string }[]
  >(
    replyDetails.to.map((to) => ({
      label: to.address ?? to.name,
      value: to.address,
    })) || [],
  );
  const [ccValues, setCcValues] = React.useState<
    { label: string; value: string }[]
  >(
    replyDetails.cc.map((cc) => ({
      label: cc.address ?? cc.name,
      value: cc.address,
    })) || [],
  );

  const sendEmail = api.account.sendEmail.useMutation();
  React.useEffect(() => {
    if (!replyDetails || !threadId) return;

    if (!replyDetails.subject.startsWith("Re:")) {
      setSubject(`Re: ${replyDetails.subject}`);
    }
    setToValues(
      replyDetails.to.map((to) => ({
        label: to.address ?? to.name,
        value: to.address,
      })),
    );
    setCcValues(
      replyDetails.cc.map((cc) => ({
        label: cc.address ?? cc.name,
        value: cc.address,
      })),
    );
  }, [replyDetails, threadId]);

  const handleSend = async (value: string) => {
    if (!replyDetails) return;
    sendEmail.mutate(
      {
        accountId,
        threadId: threadId ?? undefined,
        body: value,
        subject,
        from: replyDetails.from,
        to: replyDetails.to.map((to) => ({
          name: to.name ?? to.address,
          address: to.address,
        })),
        cc: replyDetails.cc.map((cc) => ({
          name: cc.name ?? cc.address,
          address: cc.address,
        })),
        replyTo: replyDetails.from,
        inReplyTo: replyDetails.id,
      },
      {
        onSuccess: () => {
          toast.success("Email sent");
          //editor?.commands.clearContent()
        },
      },
    );
  };

  return (
    <EmailEditor
      toValues={toValues}
      ccValues={ccValues}
      setToValues={setToValues}
      setCcValues={setCcValues}
      subject={subject}
      setSubject={setSubject}
      to={toValues.map((to) => to.value)}
      handleSend={handleSend}
      isSending={sendEmail.isPending}
    />
  );
};

export default ReplyBox;
