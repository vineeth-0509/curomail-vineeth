// // api/chat
// import { Configuration, OpenAIApi } from "openai-edge";
// import { Message, StreamingTextResponse } from "ai";
// import { auth } from "@clerk/nextjs/server";
// import { db } from "@/server/db";
// import { OramaClient } from "@/lib/orama";
// import { NextResponse } from "next/server";

// const config = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(config);
// export async function POST(req:Request){
//     try {
//         const {userId} = await auth();
//         if(!userId) {
//             return new Response('Unauthorized', {status: 401})
//         }
//         const {accountId, messages} = await req.json();
//         const orama = new OramaClient(accountId);
//         await orama.initialize()
//         const lastMessage = messages[messages.length -1]
//         console.log('lastMessage', lastMessage);
//         const context = await orama.vectorSearch({term:lastMessage.content})
//         console.log(context.hits.length + 'hits found')

//         const systemPrompt = `
//         You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.
// THE TIME NOW IS ${new Date().toLocaleString()}

// START CONTEXT BLOCK
// ${context.hits.map((hit) => JSON.stringify(hit.document)).join("\n")}
// END OF CONTEXT BLOCK

// When responding, please keep in mind:
// - Be helpful, clever, and articulate.
// - Rely on the provided email context to inform your responses.
// - If the context does not contain enough information to answer a question, politely say you don't have enough information.
// - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
// - Do not invent or speculate about anything that is not directly supported by the email context.
// - Keep your responses concise and relevant to the user's questions or the email being composed.
//     `.trim();

//     const response = await openai.createChatCompletion({
//         model:"gpt-3.5-turbo",
//         messages:[prompt,...messages.filter((messages:Message)=> messages.role === 'user')],
//         stream: true
//     })
//     const stream = OpenAIstream(response,{
//         onStart: async()=>{
//             console.log('stream started')
//         },
//         onCompletion: async(completion)=>{
//             console.log('Stream completed',completion)
//         }
//     })
//     return new StreamingTextResponse(stream);
//     } catch (error) {
//         console.log('error', error);
//         return NextResponse.json({error:"Internal Server Error"},{status: 500})
//     }
// }

import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { OramaClient } from "@/lib/orama";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { accountId, messages } = await req.json();

    const orama = new OramaClient(accountId);
    await orama.initialize();

    const lastMessage = messages[messages.length - 1];
    console.log("lastMessage", lastMessage);

    const context = await orama.vectorSearch({ prompt: lastMessage.content });
    console.log(context.hits.length + " hits found");

    const systemPrompt = `
You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.

THE TIME NOW IS ${new Date().toLocaleString()}

START CONTEXT BLOCK
${context.hits.map((hit) => JSON.stringify(hit.document)).join("\n")}
END OF CONTEXT BLOCK

When responding, please keep in mind:
- Be helpful, clever, and articulate.
- Rely on the provided email context to inform your responses.
- If the context does not contain enough information to answer a question, politely say you don't have enough information.
- Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
- Do not invent or speculate about anything that is not directly supported by the email context.
- Keep your responses concise and relevant to the user's questions or the email being composed.
        `.trim();

    const result = streamText({
      model: google("gemini-1.5-pro"), // Using Gemini 1.5 Pro
      system: systemPrompt,
      messages: messages.filter(
        (message: any) =>
          message.role === "user" || message.role === "assistant",
      ),
      onFinish: async (result) => {
        console.log("Stream completed", result.text);
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
