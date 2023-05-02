/*
# Translate Text to Native Language
Highlight some text and have the GPT translate it to your native language
Works for any highlighted text or code and any language that GPT supports
and maybe even some it doesn't ¯\_(ツ)_/¯
*/

// Name: Translate Text to Native Language
// Description: Get an explanation for any highlighted text
// Author: Josh Mabry
// Twitter: @AI_Citizen

import "@johnlindquist/kit";

let { ChatOpenAI } = await import("langchain/chat_models");
let { HumanChatMessage, SystemChatMessage } = await import("langchain/schema");
let { CallbackManager } = await import("langchain/callbacks");

let openAIApiKey = await env("OPENAI_API_KEY", {
  hint: `Grab a key from <a href="https://platform.openai.com/account/api-keys">here</a>`,
});
let nativeLanguage = await env("USER_NATIVE_LANGUAGE", {
  hint: `Grab a key from <a href="https://platform.openai.com/account/api-keys">here</a>`,
});
let prompt = `#####
Ignore prior instructions, you are tasked with taking the input text and translating it into ${nativeLanguage} 
and updating any needed meaning or context.
`;

let currentMessage = "";
const chat = new ChatOpenAI({
  temperature: 0.3,
  openAIApiKey: openAIApiKey,
  streaming: true,
  callbackManager: CallbackManager.fromHandlers({
    handleLLMStart: async (token) => {
      log(`handleLLMStart`);
      currentMessage += token;
      let html = md(token);

      await div(html);
    },
    handleLLMNewToken: async (token, runId) => {
      log(`handleLLMNewToken`);
      currentMessage += token;
      let html = md(currentMessage);

      await div(html);
    },
    handleLLMError: async (err) => {
      warn(`error`, JSON.stringify(err));
      await setSelectedText(JSON.stringify(err));
    },
    handleLLMEnd: async () => {
      log(`handleLLMEnd`);

      let html = md(currentMessage);

      await div(html);
    },
  }),
});

let text = await getSelectedText();
``;
await chat.call([new SystemChatMessage(prompt), new HumanChatMessage(text)]);
