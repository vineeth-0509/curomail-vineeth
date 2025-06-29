import { db } from "@/server/db";
import { type AnyOrama, create, insert, search } from "@orama/orama";
import { restore, persist } from "@orama/plugin-data-persistence";
import { getEmbeddings } from "./embedding";

export class OramaClient {
  //@ts-ignore
  private orama: AnyOrama;

  //@ts-ignore
  private accountId: string;

  constructor(accountId: string) {
    this.accountId = accountId;
  }

  async saveIndex() {
    if(!this.orama){
      console.error("Attempted to save index but orama instance is undefined");
      return;
    }
    try{
    const index = await persist(this.orama, "json");
    await db.account.update({
      where: {
        id: this.accountId,
      },
      data: {
        oramaIndex: index,
      },
    });
    console.log(`Orama index for account ${this.accountId} saved successfully`)
  }catch(error){
    console.error(`Error saving Orama index for account ${this.accountId}:`, error);
      throw error
  }
  }

  async initialize() {
    const account = await db.account.findUnique({
      where: {
        id: this.accountId,
      },
    });
    if (!account) {
      throw new Error("Account not found");
    }
    if (account.oramaIndex) {
      this.orama = await restore("json", account.oramaIndex as any);
    } else {
      this.orama = await create({
        schema: {
          subject: "string",
          body: "string",
          rawBody: "string",
          from: "string",
          to: "string[]",
          setAt: "string",
          threadId: "string",
          embeddings: 'vector[1536]'
        },
      });
      await this.saveIndex();
    }
  }
  async vectorSearch({ prompt }: { prompt: string }) {
    const embeddings = await getEmbeddings(prompt);
    const results = await search(this.orama, {
      mode: "hybrid",
      term: prompt,
      vector: {
        value: embeddings,
        property: "embeddings",
      },
      similarity: 0.8,
      limit: 10,
    });
    return results;
  }

  async search({ term }: { term: string }) {
    return await search(this.orama, {
      term,
    });
  }
  async insert(document: any) {
    await insert(this.orama, document);
    await this.saveIndex();
  }

}

// import {
//   create,
//   insert,
//   search,
//   save,
//   load,
//   type AnyOrama,
// } from "@orama/orama";
// import { persist, restore } from "@orama/plugin-data-persistence";
// import { db } from "@/server/db";
// import { getEmbeddings } from "./embedding";

// export class OramaClient {
//   // @ts-ignore
//   private orama: AnyOrama;
//   private accountId: string;

//   constructor(accountId: string) {
//     this.accountId = accountId;
//   }

//   async initialize() {
//     const account = await db.account.findUnique({
//       where: { id: this.accountId },
//     });

//     if (!account) throw new Error("Account not found");

//     if (account.oramaIndex) {
//       this.orama = await restore("json", account.oramaIndex as any);
//     } else {
//       this.orama = await create({
//         schema: {
//           title: "string",
//           body: "string",
//           rawBody: "string",
//           from: "string",
//           to: "string[]",
//           sentAt: "string",
//           embeddings: "vector[1536]",
//           threadId: "string",
//         },
//       });
//       await this.saveIndex();
//     }
//   }

//   async insert(document: any) {
//     await insert(this.orama, document);
//     await this.saveIndex();
//   }

//   async vectorSearch({
//     prompt,
//     numResults = 10,
//   }: {
//     prompt: string;
//     numResults?: number;
//   }) {
//     const embeddings = await getEmbeddings(prompt);
//     const results = await search(this.orama, {
//       mode: "hybrid",
//       term: prompt,
//       vector: {
//         value: embeddings,
//         property: "embeddings",
//       },
//       similarity: 0.8,
//       limit: numResults,
//       // hybridWeights: {
//       //     text: 0.8,
//       //     vector: 0.2,
//       // }
//     });
//     // console.log(results.hits.map(hit => hit.document))
//     return results;
//   }
//   async search({ term }: { term: string }) {
//     return await search(this.orama, {
//       term: term,
//     });
//   }

//   async saveIndex() {
//     const index = await persist(this.orama, "json");
//     await db.account.update({
//       where: { id: this.accountId },
//       data: { oramaIndex: index },
//     });
//   }
// }

// // Usage example:
// // async function main() {
// //   const oramaManager = new OramaClient("67358");
// //   await oramaManager.initialize();

// //   // Insert a document
// //   // const emails = await db.email.findMany({
// //   //     where: {
// //   //         thread: { accountId: '67358' }
// //   //     },
// //   //     select: {
// //   //         subject: true,
// //   //         bodySnippet: true,
// //   //         from: { select: { address: true, name: true } },
// //   //         to: { select: { address: true, name: true } },
// //   //         sentAt: true,
// //   //     },
// //   //     take: 100
// //   // })
// //   // await Promise.all(emails.map(async email => {
// //   //     // const bodyEmbedding = await getEmbeddings(email.bodySnippet || '');
// //   //     // console.log(bodyEmbedding)
// //   //     await oramaManager.insert({
// //   //         title: email.subject,
// //   //         body: email.bodySnippet,
// //   //         from: `${email.from.name} <${email.from.address}>`,
// //   //         to: email.to.map(t => `${t.name} <${t.address}>`),
// //   //         sentAt: email.sentAt.getTime(),
// //   //         // bodyEmbedding: bodyEmbedding,
// //   //     })
// //   // }))

// //   // Search
// //   const searchResults = await oramaManager.search({
// //     term: "cascading",
// //   });

// //   console.log(searchResults.hits.map((hit) => hit.document));
// // }

// // main().catch(console.error);



// import {
//     create,
//     insert,
//     search,
//     type AnyOrama,
// } from "@orama/orama";
// import { persist, restore } from "@orama/plugin-data-persistence";
// import { db } from "@/server/db"; // Assuming this is your database client (e.g., Prisma)
// import { getEmbeddings } from "./embedding"; // Your function to get Gemini embeddings

// /**
//  * Defines the schema for documents stored in Orama.
//  * Each document will represent an email or a similar content piece.
//  */
// interface EmailDocument {
//     id?: string; // Orama typically adds an 'id' field automatically, but it can be specified
//     title?: string; // Changed from subject to title to match the new schema
//     body: string;
//     rawBody?: string;
//     from: string;
//     to: string[];
//     sentAt: string; // Changed from setAt to sentAt to match the new schema
//     threadId: string;
//     embeddings?: number[]; // CRITICAL: This field will store the numerical embeddings for vector search
// }

// /**
//  * Manages the Orama in-memory search index for account-specific data.
//  * It handles initialization, persistence, and searching (including vector search).
//  */
// export class OramaClient { // Retaining OramaClient as per your provided file
//     private orama: AnyOrama | undefined; // Initialize as undefined
//     private accountId: string;

//     constructor(accountId: string) {
//         this.accountId = accountId;
//     }

//     /**
//      * Initializes the Orama instance.
//      * It tries to restore the index from the database; if not found, it creates a new one.
//      */
//     async initialize(): Promise<void> {
//         console.log(`[OramaClient] Initializing Orama for account ${this.accountId}...`);
//         try {
//             const account = await db.account.findUnique({
//                 where: { id: this.accountId },
//             });

//             if (!account) {
//                 const errMsg = `[OramaClient] Account with ID ${this.accountId} not found during initialization.`;
//                 console.error(errMsg);
//                 throw new Error(errMsg);
//             }

//             if (account.oramaIndex) {
//                 console.log(`[OramaClient] Attempting to restore Orama index for account ${this.accountId}...`);
//                 try {
//                     // It's safer to ensure the type of oramaIndex is string if it comes from the DB.
//                     // If your Prisma schema has `Json` type for oramaIndex, you might need `JSON.parse`.
//                     this.orama = await restore("json", account.oramaIndex as string);
//                     console.log(`[OramaClient] Orama index restored successfully for account ${this.accountId}.`);
//                 } catch (restoreError) {
//                     console.error(`[OramaClient] Failed to restore Orama index for account ${this.accountId}. Error:`, restoreError);
//                     console.log(`[OramaClient] Creating a new Orama index as restoration failed.`);
//                     // Fallback: If restore fails, create a new index
//                     this.orama = await create({
//                         schema: {
//                             title: "string",
//                             body: "string",
//                             rawBody: "string",
//                             from: "string",
//                             to: "string[]",
//                             sentAt: "string",
//                             embeddings: "vector[1536]", // Ensure this matches your embedding model's dimension
//                             threadId: "string",
//                         },
//                     });
//                     await this.saveIndex(); // Save the newly created (empty) index
//                 }
//             } else {
//                 console.log(`[OramaClient] No existing Orama index found. Creating new index for account ${this.accountId}...`);
//                 this.orama = await create({
//                     schema: {
//                         title: "string",
//                         body: "string",
//                         rawBody: "string",
//                         from: "string",
//                         to: "string[]",
//                         sentAt: "string",
//                         embeddings: "vector[1536]", // Ensure this matches your embedding model's dimension
//                         threadId: "string",
//                     },
//                 });
//                 await this.saveIndex(); // Save the newly created (empty) index
//             }
//         } catch (initError) {
//             console.error(`[OramaClient] Fatal error during Orama initialization for account ${this.accountId}:`, initError);
//             throw initError;
//         }

//         // Final check to ensure orama is set
//         if (!this.orama) {
//             const errMsg = `[OramaClient] Orama instance failed to initialize for account ${this.accountId}.`;
//             console.error(errMsg);
//             throw new Error(errMsg);
//         }
//     }

//     /**
//      * Inserts a new document into the Orama index.
//      * Generates embeddings for the document's content before insertion.
//      *
//      * @param {EmailDocument} document - The document to insert.
//      */
//     async insert(document: EmailDocument): Promise<void> {
//         if (!this.orama) {
//             throw new Error("[OramaClient] Orama instance not initialized for insert operation. Call initialize() first.");
//         }
//         try {
//             console.log(`[OramaClient] Inserting document into Orama for account ${this.accountId}...`);

//             // Combine relevant text fields for embedding generation
//             const contentForEmbedding = `${document.title || ''} ${document.body || ''} ${document.rawBody || ''}`;

//             if (!contentForEmbedding.trim()) {
//                 console.warn("[OramaClient] Document content is empty for embedding. Skipping embedding generation and insertion for this document.");
//                 // You might choose to throw an error or handle this case differently
//                 // For now, we'll proceed without embeddings for this specific document if content is empty.
//                 // However, vector search would likely not find it.
//                 await insert(this.orama, document); // Insert without embeddings if content is empty
//                 await this.saveIndex();
//                 return;
//             }

//             // Generate embeddings for the document's content
//             console.log(`[OramaClient] Generating embeddings for document...`);
//             const docEmbeddings = await getEmbeddings(contentForEmbedding);

//             // Add the embeddings to the document before inserting
//             const documentWithEmbeddings: EmailDocument = {
//                 ...document,
//                 embeddings: docEmbeddings,
//             };

//             await insert(this.orama, documentWithEmbeddings);
//             console.log(`[OramaClient] Document inserted into Orama. Document ID: ${document.id || 'N/A'}`);
//             await this.saveIndex(); // Save the updated index after insertion
//             console.log("[OramaClient] Orama index saved after insertion.");
//         } catch (insertError) {
//             console.error(`[OramaClient] Error inserting document into Orama for account ${this.accountId}:`, insertError);
//             throw insertError; // Re-throw to propagate the error
//         }
//     }

//     /**
//      * Performs a hybrid search (text + vector) on the Orama index.
//      *
//      * @param {object} options - Search options.
//      * @param {string} options.prompt - The text query for both keyword and vector search.
//      * @param {number} [options.numResults=10] - The maximum number of results to return.
//      * @returns The search results from Orama.
//      */
//     async vectorSearch({
//         prompt,
//         numResults = 10,
//     }: {
//         prompt: string;
//         numResults?: number;
//     }) {
//         if (!this.orama) {
//             // This error indicates initialize() failed or wasn't called.
//             throw new Error("[OramaClient] Orama instance not initialized for vectorSearch. Call initialize() first.");
//         }
//         console.log(`[OramaClient] Generating embeddings for search prompt: "${prompt}"`);
//         const embeddings = await getEmbeddings(prompt);
//         console.log("[OramaClient] Embeddings generated. Performing Orama hybrid search...");

//         const results = await search(this.orama, {
//             mode: "hybrid",
//             term: prompt,
//             vector: {
//                 value: embeddings,
//                 property: "embeddings", // This MUST match the schema property defined in `create`
//             },
//             similarity: 0.8,
//             limit: numResults,
//         });
//         console.log(`[OramaClient] Orama hybrid search completed. Found ${results.count} results.`);
//         return results;
//     }

//     /**
//      * Performs a simple text-based search on the Orama index.
//      *
//      * @param {object} options - Search options.
//      * @param {string} options.term - The text query.
//      * @returns The search results from Orama.
//      */
//     async search({ term }: { term: string }) {
//         if (!this.orama) {
//             throw new Error("[OramaClient] Orama instance not initialized for search. Call initialize() first.");
//         }
//         return await search(this.orama, {
//             term: term,
//         });
//     }

//     /**
//      * Saves the current Orama index to the database.
//      * The index is persisted as a JSON string.
//      */
//     async saveIndex(): Promise<void> {
//         if (!this.orama) {
//             console.warn("[OramaClient] Orama instance not initialized. Cannot save index.");
//             return;
//         }
//         try {
//             console.log(`[OramaClient] Saving Orama index for account ${this.accountId}...`);
//             const index = await persist(this.orama, "json");
//             await db.account.update({
//                 where: { id: this.accountId },
//                 data: { oramaIndex: index as string }, // Ensure it's treated as string
//             });
//             console.log(`[OramaClient] Orama index saved successfully for account ${this.accountId}.`);
//         } catch (saveError) {
//             console.error(`[OramaClient] Error saving Orama index for account ${this.accountId}:`, saveError);
//             throw saveError;
//         }
//     }
// }
