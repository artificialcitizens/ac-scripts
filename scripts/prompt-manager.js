// Name: Prompt Manager
// Description: Manage your prompt templates
// Author: Josh Mabry
// Twitter: @AI_Citizen

//##################
// ScriptKit Imports
//##################
import "@johnlindquist/kit";
import { createGuideConfig } from "@johnlindquist/kit/main/main-helper.js";

import {
  createPrompt,
  updatePrompt,
  deletePrompt,
  generateMarkdown,
} from "./utils/prompt-crud.js";

const renderPrompts = async () => {
  let prompt = await docs(
    "db/prompts.md",
    createGuideConfig({
      name: "Prompts",
      itemHeight: PROMPT.ITEM.HEIGHT.SM,
      input: arg?.input || "",
      placeholder: "Browse API",
      enter: `Suggest Edit`,
      onNoChoices: async (input) => {
        setPanel(
          md(`# ${input}
        This is not a valid prompt template, press enter to create a new one.
        `)
        );
        // return await arg("Create new prompt template");
      },
    })
  );
  // if selected docs is a url, then open it
  if (!prompt) {
    // open(prompt);
    log("no prompt");
  } else {
    log("prompt", prompt);
    // await run(kitPath("cli", prompt));
    // await mainScript("", "API");
  }
};
export const editPrompts = async () => {
  const actions = {
    create: createPrompt,
    update: updatePrompt,
    delete: deletePrompt,
    generate: generateMarkdown,
  };

  const selectedAction = await arg("Choose an action", [
    {
      name: "Create prompt",
      value: "create",
    },
    {
      name: "Update prompt",
      value: "update",
    },
    {
      name: "Delete prompt",
      value: "delete",
    },
    {
      name: "Generate Markdown",
      value: "generate",
    },
  ]);

  await actions[selectedAction]();
};

onTab("Prompts", async (input) => {
  log("input", input);
  await renderPrompts();
});

onTab("Manage Prompts", async (input) => {
  await editPrompts();
});
