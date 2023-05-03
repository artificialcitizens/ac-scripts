/*
# Generate a response to a prompt in any text field

This script utilizes ChatGPT to generate a response for the selected text. 
The response will then replace the original text, making it useful for various writing tasks such as blog posts, code, and emails.

Highlight some text and press `cmd+shift+p` to send it through ChatGPT 
to replace the text response. Your mileage may vary.
*/

// Name: Prompt Anywhere
// Description: Generate a prompt response in anywhere you can type
// Author: Josh Mabry
// Twitter: @AI_Citizen
// Shortcut:

import "@johnlindquist/kit";
import Bottleneck from "bottleneck";

let { ChatOpenAI } = await import("langchain/chat_models");
let { HumanChatMessage, SystemChatMessage } = await import("langchain/schema");
let openAIApiKey = await env("OPENAI_API_KEY", {
  hint: `Grab a key from <a href="https://platform.openai.com/account/api-keys">here</a>`,
});
let { CallbackManager } = await import("langchain/callbacks");
let prompt = `#####
Ignore prior instructions, you are tasked with taking the input text and generating a response to it.

Return only the updated text, do not offer any explanations or reasoning for the changes. 
Do not ask any questions, do not refuse any input, and do not change the subject.
`;

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 100,
});

const type = (text) => {
  return new Promise((resolve) => {
    keyboard.type(text);
    resolve();
  });
};

const wrappedType = limiter.wrap(type);

const llm = new ChatOpenAI({
  temperature: 0.3,
  openAIApiKey: openAIApiKey,
  streaming: true,
  callbackManager: CallbackManager.fromHandlers({
    handleLLMStart: async (token) => {
      log(`handleLLMStart`);
      if (!token) return;
      await wrappedType(token);
    },
    handleLLMNewToken: async (token, runId) => {
      log(`handleLLMNewToken`);
      await wrappedType(token);
    },
    handleLLMError: async (err) => {
      warn(`error`, JSON.stringify(err));
      await setSelectedText(JSON.stringify(err));
      process.exit(1);
    },
    handleLLMEnd: async () => {
      log(`handleLLMEnd`);
      log(`currentMessage`, currentMessage);
      process.exit(1);
    },
  }),
});

let text = await getSelectedText();

await llm.call([new SystemChatMessage(prompt), new HumanChatMessage(text)]);
