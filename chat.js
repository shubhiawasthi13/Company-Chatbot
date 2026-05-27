import Groq from "groq-sdk";
import readline from "node:readline/promises";
import dotenv from "dotenv";
import { vectorStore } from "./prepare.js";
dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function Chat() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  while (true) {
    const question = await rl.question("You: ");

    if (question === "bye") {
      break;
    }
    const relevantChunks = await vectorStore.similaritySearch(question, 3);
    const context = relevantChunks
      .map((chunk) => chunk.pageContent)
      .join("\n\n");

    const SYSTEM_PROMPT = `
You are a helpful company assistant.

Answer ONLY from the provided context.

If the answer is not present in the context,
reply with:
"I don't know."

Keep answers short and accurate.
`;
    const userQuery = `
Question: ${question}

Relevant context:
${context}

Answer:
`;
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userQuery,
        },
      ],
      model: "openai/gpt-oss-20b",
    });

    console.log(chatCompletion.choices[0]?.message?.content || "");
  }

  rl.close();
}
Chat();
