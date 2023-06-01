/*
# Prompt Anything
Highlight some text and run this script to prompt against it.
Useful for summarizing text, generating a title, or any other task you can think of.

## Usage

- Highlight the text you want to prompt against
- Run the script via shortcut or command palette
- Input your desired prompt
- Wait for the AI to respond
- Select one of the options
* Reply - Add a follow up question
* Retry - Rerun generation with option to update prompt
* Edit - Edit response in editor
    - On editor exit the message is saved to the clipboard
    - On editor submit the message is pasted into the highlighted text
* Copy - Copy response to clipboard
* Paste - Paste response into highlighted text
* Save - Save response to file in the .kenv/temp/conversations directory

## Example
- Highlight: 'Some really long passage in a blog post'
- Run Script
- Prompt: `Summarize this passage in the form of Shakespearean prose`
- Waaaaait for it...
- Get a response from the AI
- Select an option
- Rinse and repeat
*/

// Name: Prompt Anything
// Description: Custom prompt for any highlighted text
// Author: Josh Mabry
// Twitter: @AI_Citizen
// Shortcut: alt shift enter

//##################
// ScriptKit Imports
//##################
import "@johnlindquist/kit";
import { getSnipsByTag } from "./utils/prompt.js";
import { AIChatMessage } from "langchain/schema";

//##################
// LangChain Imports
//##################
let { ChatOpenAI } = await import("langchain/chat_models");
let { HumanChatMessage, SystemChatMessage } = await import("langchain/schema");

//#################
// Request API KEY
//#################
// stored in .env file after first run
// can change there or through the command palette
let openAIApiKey = await env("OPENAI_API_KEY", {
  hint: `Grab a key from <a href="https://platform.openai.com/account/api-keys">here</a>`,
});

const prompts = await getSnipsByTag("prompt-anything");
const promptChoices = Object.entries(prompts).map(([key, value]) => {
  return { name: value.name, value: value.snippet };
});

// System input / Task for the AI to follow
let userSystemInput = await arg(
  {
    placeholder: "Summarize this passage",
    strict: false,
  },
  promptChoices
);

// User Prompt from highlighted text
let userPrompt = await getSelectedText();

//#################
// Prompt Template
//#################
const formatPrompt = (prompt) => {
  return `##### Ignore prior instructions
- Return answer in markdown format
- You are tasked with the following
${prompt}
########
`;
};

const formattedPrompt = formatPrompt(userSystemInput);

//#########
// Helpers
//########
// exit script on cancel
const cancelChat = () => {
  exit();
};

/**
 * Paste text to highlighted text and exit script
 * @param {*} text
 */
const pasteTextAndExit = async (text) => {
  await setSelectedText(text);
  exit();
};

/**
 * Copy text to clipboard and exit script
 * @param {*} text
 */
const copyToClipboardAndExit = async (text) => {
  await clipboard.writeText(currentMessage);
  exit();
};

let priorMessage = "";
let currentMessage = "";
let toast = null;
let chatStarted = false;
const llm = new ChatOpenAI({
  // 0 = "precise", 1 = "creative"
  temperature: 0.3,
  // modelName: "gpt-4", // uncomment to use GPT-4 (requires beta access)
  openAIApiKey: openAIApiKey,
  // turn off to only get output when the AI is done
  streaming: true,
  callbacks: [
    {
      handleLLMStart: async () => {
        log(`handleLLMStart`);
      },
      handleLLMNewToken: async (token) => {
        // each new token is appended to the current message
        // and then rendered to the screen
        currentMessage += token;
        // render current message
        await div({
          html: md(priorMessage + "\n\n" + currentMessage),
          onEscape: async () => {
            cancelChat();
          },
          shortcuts: [
            {
              name: "Cancel Generation",
              key: `${cmd}+c`,
              bar: "left",
              onPress: async () => {
                cancelChat();
              },
            },
          ],
        });
      },
      handleLLMError: async (err) => {
        dev({ err });
        chatStarted = false;
      },
      handleLLMEnd: async () => {
        log(`handleLLMEnd`);
        chatStarted = false;
        let html = md(priorMessage + "\n\n" + currentMessage);
        await div({
          html,
          shortcuts: [
            {
              name: "Reply",
              key: `${cmd}+f`,
              bar: "left",
              onPress: async () => {
                const newPrompt = await arg(
                  {
                    placeholder: "Follow up question",
                    strict: false,
                  },
                  {
                    html,
                  }
                );
                priorMessage += currentMessage;
                currentMessage = "";
                await llm.call([
                  new SystemChatMessage(formattedPrompt),
                  new HumanChatMessage(userPrompt),
                  new AIChatMessage(priorMessage),
                  new HumanChatMessage(newPrompt),
                ]);
              },
            },
            {
              name: "Retry",
              key: `${cmd}+r`,
              bar: "left",
              onPress: async () => {
                currentMessage = "";
                await llm.call([
                  new SystemChatMessage(formattedPrompt),
                  new HumanChatMessage(userPrompt),
                ]);
              },
            },
            {
              name: "Edit",
              key: `${cmd}+x`,
              bar: "right",
              onPress: async () => {
                await editor({
                  value: currentMessage,
                  onEscape: async (state) =>
                    await copyToClipboardAndExit(state),
                  onSubmit: async (state) => await pasteTextAndExit(state),
                });
              },
            },
            {
              name: "Copy",
              key: `${cmd}+c`,
              bar: "right",
              onPress: async () => {
                await clipboard.writeText(currentMessage);
                toast(`Copied`);
                setTimeout(() => {
                  exitChat();
                }, 1000);
              },
            },
            {
              name: "Paste",
              key: `${cmd}+p`,
              bar: "right",
              onPress: async () => {
                await setSelectedText(currentMessage);
                setTimeout(() => {
                  exitChat();
                }, 1000);
              },
            },
            {
              name: "Save",
              key: `${cmd}+s`,
              bar: "right",
              onPress: async () => {
                await inspect(currentMessage, `conversations/${Date.now()}.md`);
                exitChat();
              },
            },
          ],
        });
      },
    },
  ],
});

await llm.call([
  new SystemChatMessage(formattedPrompt),
  new HumanChatMessage(userPrompt),
]);
