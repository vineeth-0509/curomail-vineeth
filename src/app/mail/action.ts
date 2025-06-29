"use server";
//this server action is going to run on the server,its going to hit the
//gemini ai api and going to slowly stream in the token into our frontend.
import { google } from "@ai-sdk/google";
import { createStreamableValue } from "ai/rsc";
import { generateText } from "ai";

export async function generateEmail(context: string, prompt: string) {
  const stream = createStreamableValue("");
  console.log('Loaded Key:', process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  (async () => {
    try {
        
    
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `
                You are an AI email assistant embedded in an email client app.Your purpose is to help the user compose emails by providing suggestions and relevant information.

                THE TIME NOW IS ${new Date().toLocaleString()}

                START CONTEXT BLOCK
                ${context}
                END OF CONTEXT BLOCK

                USER PROMPT:
                ${prompt}

                When responding, please keep in mind:
                - Be helpful, clever, and articulate.
                - Rely on the provided email context to inform your response.
                - If the context does not contain enough information to fully address the prompt, polietly give a draft response.
                - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
                - Do not invent or speculate about anything that is not directly supported by the email context.
                - Keep your response focused and relevant to the user's prompt.
                - Don't add fluff like 'Heres your email' or 'Here's your email' or anything like that.
                - Directly output the email, no need to say 'Here is your email' or anything like that.
                - No need to output subject
                `,
    });
    for await (const token of text) {
      stream.update(token);
    }
    stream.done();
  }catch(err){
    console.error("AI generatin failed:", err);
    stream.done();
  }
  })();

  return { output: stream.value };
}
