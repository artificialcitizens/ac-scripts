// Name: Prompt Typing Mind
// Description: Highlight text, enter a prompt, and open in Typing Mind
// Author: Josh Mabry
// Twitter: @AI_Citizen

import "@johnlindquist/kit";

import { getSnipsByTag } from "./utils/prompt.js";

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

const formattedPrompt = formatPrompt(userSystemInput + "\n" + userPrompt);

open(
  `https://www.typingmind.com/?message=${encodeURIComponent(formattedPrompt)}`
);
