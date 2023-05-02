/*
# Explain Plz
Highlight some text and have it explained by AI
Works for any highlighted text or code
*/

// Name: Explain Plz
// Description: Get an explanation for any highlighted text
// Author: Josh Mabry
// Twitter: @AI_Citizen
// Shortcut: cmd alt shift E

import "@johnlindquist/kit";

let { ChatOpenAI } = await import("langchain/chat_models");
let { HumanChatMessage, SystemChatMessage } = await import("langchain/schema");
let openAIApiKey = await env("OPENAI_API_KEY", {
  hint: `Grab a key from <a href="https://platform.openai.com/account/api-keys">here</a>`,
});
let { CallbackManager } = await import("langchain/callbacks");
let prompt = `#####
Ignore prior instructions, you are tasked with taking the input text and explaining it to the user.
Return the response in the following format using markdown syntax:
# Explain Plz
## TLDR (A quick summary of the highlighted text)
## ELI5 (Explain Like I'm 5)
## Explanation (A longer technical explanation of the highlighted text)
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
