import { db } from "@/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";
import type { Prisma } from "@prisma/client";

import { emailAddressSchema } from "@/lib/types";

import { OramaClient } from "@/lib/orama";
import { Account } from "@/lib/account";

export const authoriseAccountAccess = async (
  accountId: string,
  userId: string,
) => {
  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    select: {
      id: true,
      emailAddress: true,
      name: true,
      accessToken: true,
    },
  });
  if (!account) {
    throw new Error("Account not found");
  }
  return account;
};
export const accountRouter = createTRPCRouter({
  getAcccount: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.account.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      select: {
        id: true,
        emailAddress: true,
        name: true,
      },
    });
  }),

  getNumThreads: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      let filter: Prisma.ThreadWhereInput = {};
      if (input.tab === "inbox") {
        filter.inboxStatus = true;
      } else if (input.tab === "draft") {
        filter.draftStatus = true;
      } else if (input.tab === "sent") {
        filter.sentStatus = true;
      }
      return await ctx.db.thread.count({
        where: filter,
      });
    }),

  getThreads: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.string(),
        done: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const acc = new Account(account.accessToken);
      acc.syncEmails().catch(console.error);
      let filter: Prisma.ThreadWhereInput = {};
      if (input.tab === "inbox") {
        filter.inboxStatus = true;
      } else if (input.tab === "draft") {
        filter.draftStatus = true;
      } else if (input.tab === "sent") {
        filter.sentStatus = true;
      }
      filter.done = {
        equals: input.done,
      };
      return await ctx.db.thread.findMany({
        where: filter,
        include: {
          emails: {
            orderBy: {
              sentAt: "asc",
            },
            select: {
              from: true,
              body: true,
              bodySnippet: true,
              emailLabel: true,
              subject: true,
              sysLabels: true,
              id: true,
              sentAt: true,
            },
          },
        },
        take: 15,
        orderBy: {
          lastMessageDate: "desc",
        },
      });
    }),
  getSuggestions: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      return await ctx.db.emailAddress.findMany({
        where: {
          accountId: input.accountId,
        },
        select: {
          address: true,
          name: true,
        },
      });
    }),
  // //,
  //     getReplyDetails: protectedProcedure.input(z.object({
  //       accountId: z.string(),
  //       threadId: z.string(),
  //       replyType: z.enum(['reply','replyAll'])
  //     })).query(async ({ctx, input})=>{
  //       const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
  //       const thread = await ctx.db.thread.findUnique({
  //         where:{
  //           id: input.threadId
  //         },
  //         include:{
  //           emails:{
  //             orderBy:{
  //               sentAt:'asc'
  //             },
  //             select:{
  //               from: true,
  //               to: true,
  //               cc: true,
  //               bcc: true,
  //               sentAt: true,
  //               subject: true,
  //               internetMessageId: true
  //             }
  //           }
  //         }
  //       });
  //       if(!thread || thread.emails.length === 0){
  //         throw new Error("Thread not found or empty")
  //       }
  //       const lastExternalEmail = thread.emails.reverse().find(email => email.from.id !== account.id);
  //       if(!lastExternalEmail){
  //         throw new Error("No external email found in thread");
  //       }
  //       const allRecipients = new Set([
  //         ...thread.emails.flatMap(e=> [e.from, ...e.to,...e.cc]),
  //       ]);
  //     })
  // });

  getReplyDetails: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      console.log(account);
      const thread = await ctx.db.thread.findFirst({
        where: {
          id: input.threadId,
        },
        include: {
          emails: {
            orderBy: {
              sentAt: "asc",
            },
            select: {
              from: true,
              to: true,
              cc: true,
              bcc: true,
              sentAt: true,
              subject: true,
              internetMessageId: true,
            },
          },
        },
      });
      if (!thread || thread.emails.length === 0)
        throw new Error("Thread not found");

      const lastExternalEmail = thread.emails
        .reverse()
        .find((email) => email.from.address !== account.emailAddress);
      if (!lastExternalEmail) throw new Error("No external email found");
      return {
        subject: lastExternalEmail.subject,

        to: [
          lastExternalEmail.from,
          ...lastExternalEmail.to.filter(
            (to) => to.address !== account.emailAddress,
          ),
        ],

        cc: lastExternalEmail.cc.filter(
          (cc) => cc.address !== account.emailAddress,
        ),

        from: { name: account.name, address: account.emailAddress },
        id: lastExternalEmail.internetMessageId,
      };
    }),
  sendEmail: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        body: z.string(),
        subject: z.string(),
        from: emailAddressSchema,
        to: z.array(emailAddressSchema),
        cc: z.array(emailAddressSchema).optional(),
        bcc: z.array(emailAddressSchema).optional(),
        replyTo: emailAddressSchema,
        inReplyTo: z.string().optional(),
        threadId: z.string().optional(),
        references: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const acc = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const account = new Account(acc.accessToken);
      console.log("sendmail", input);
      await account.sendEmail({
        body: input.body,
        subject: input.subject,
        threadId: input.threadId,
        to: input.to,
        bcc: input.bcc,
        cc: input.cc,
        replyTo: input.replyTo,
        from: input.from,
        inReplyTo: input.inReplyTo,
        references: input.inReplyTo ?? "",
      });
    }),

    searchEmails: protectedProcedure.input(z.object({
      accountId: z.string(),
      query: z.string()
    })).mutation(async ({ctx, input})=>{
      const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      const orama = new OramaClient(account.id);
      await orama.initialize();
      const results = await orama.search({term: input.query})
      return results
    })
});
