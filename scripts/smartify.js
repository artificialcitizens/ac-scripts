/*
# Smartify your words!

Tired of feeling dumb? Winter got you in a funk? 
Can you just not seem to get the words out right? 
Well, let's Smartify your words!

Highlight some text and press `cmd+shift+enter` to send it through ChatGPT 
to replace the text with a more eloquent version. Mileage may vary.
*/

// Name: Smartify Your Words
// Description: Let's make those words smarter!
// Author: Josh Mabry
// Twitter: @AI_Citizen
// Shortcut: command alt shift enter

import "@johnlindquist/kit";

let { ChatOpenAI } = await import("langchain/chat_models");
let { HumanChatMessage, SystemChatMessage } = await import("langchain/schema");
let openAIApiKey = await env("OPENAI_API_KEY", {
  hint: `Grab a key from <a href="https://platform.openai.com/account/api-keys">here</a>`,
});
let { CallbackManager } = await import("langchain/callbacks");
let prompt = `#####
Ignore prior instructions, you are tasked with taking an input and refactoring it using the following rules: '

- Maintain the same meaning, tone, and intent as the original text
- Clean up any grammar or spelling mistakes
- Make it sound more professional, but keep it casual
- Reduce redundancies and excessive verbiage

Return only the updated text, do not offer any explanations or reasoning for the changes.
########
`;

import Bottleneck from "bottleneck";

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
      if (!token) return;
      log(`handleLLMStart`);
      await wrappedType(token);
    },
    handleLLMNewToken: async (token) => {
      if (!token) return;
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
