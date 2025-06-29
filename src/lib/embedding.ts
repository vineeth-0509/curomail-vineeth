import { GoogleGenerativeAI, type Content } from "@google/generative-ai";
export async function getEmbeddings(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set.",
    );
  }
  // try {
  //     const response = await ai.models.embedContent({
  //     model:"gemini-embedding-exp-03-07",
  //     contents: text.replace(/\n/g, ' ')
  // })
  // return response.embeddings as number[]
  // } catch (error) {
  //     console.log('error calling geminiai embeddings api', error);
  //     throw error
  // }
  if(typeof text !== 'string'){
    console.error("Invalid input to getEmbeddings: 'text' must be a string.", text);
    text = String(text || '');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const contentForEmbedding: Content = {
        role:'user',
        parts:[{text: text.replace(/\n/g," ")}]
    };
    const response = await model.embedContent({
        content: contentForEmbedding
    })
    return response.embedding.values as number[];
  } catch (error) {
    console.error("Error calling Gemini embeddings API:", error);
    throw error;
  }
}

// (async () => {
//     try {
//         const embeddings = await getEmbeddings("hello world");
//         console.log("Embeddings:", embeddings);
//     } catch (error) {
//         console.error("Failed to get embeddings:", error);
//     }
// })();
