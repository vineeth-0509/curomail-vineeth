"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
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
var orama_1 = require("@orama/orama");
var db_1 = require("./server/db");
var orama = await (0, orama_1.create)({
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
var emails = await db_1.db.email.findMany({
    select: {
        subject: true,
        body: true,
        from: true,
        to: true,
        sentAt: true,
        threadId: true,
    },
});
for (var _i = 0, emails_1 = emails; _i < emails_1.length; _i++) {
    var email = emails_1[_i];
    console.log(email.subject);
}
