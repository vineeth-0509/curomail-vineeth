// import { Account } from "./lib/account";
// const playground = async () => {
//   const acc = new Account("PjwEYatN94bbYFIVv2e79a6dAvhSivog-uQRlD5PLNs");
//   console.log("playground.ts file is running up");
//   console.log(
//     await acc.getUpdatedEmails({
//       deltaToken: "H4sIAAAAAAAA_2NgZmBkAAPG980MLWCWytc3DCwZJbk5ABjvbMsdAAAA",
//     }),
//   );
// };

// const addressesToUpsert = new Map()
// const email = {
//     from: { address: 'elliott@useincubate.com', name: 'Elliott Chong' },
//     to: [{ address: 'gmansoor@technologyrivers.com', name: 'Ghazenfer Mansoor' }],
//     cc: [],
//     bcc: [],
//     replyTo: [],
// }
// const all = [email.from, ...email.to, ...email.cc, ...email.bcc, ...email.replyTo]
// // console.log('all', JSON.stringify(all, null, 2))
// for (const address of all) {
//     addressesToUpsert.set(address.address, address);
// }
// for (const address of addressesToUpsert.values()) {
//     console.log('address', address)
// }

import { create, insert, search, type AnyOrama } from "@orama/orama";
import { db } from "./server/db";

const orama = await create({
  schema: {
    subject: "string",
    body: "string",
    rawBody: "string",
    from: "string",
    to: "string[]",
    sentAt: "string",
    threadId: "string",
  },
});

const emails = await db.email.findMany({
  select: {
    subject: true,
    body: true,
    from: true,
    to: true,
    sentAt: true,
    threadId: true,
  },
});

for (const email of emails) {
  console.log(email.subject);
  // @ts-nocheck
  await insert(orama, {
    subject: email.subject,
    //@ts-ignore
    body: email.body,
    from: email.from.address,
    //@ts-ignore
    to: email.to.map((to) => to.address).join(","),
    sentAt: email.sentAt.toLocaleString(),
    threadId: email.threadId,
  });
}
