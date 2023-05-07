// Preview: docs
// Name: Prompt Manager
// Description: Manage your prompt templates
// Author: Josh Mabry
// Twitter: @AI_Citizen

//##################
// ScriptKit Imports
//##################
import "@johnlindquist/kit";
import { createGuideConfig } from "@johnlindquist/kit/main/main-helper.js";

import { filterPromptsByTag } from "./utils/prompt.js";
import { settings } from "./utils/settings.js";

const renderPrompts = async () => {
  let prompt = await docs(
    "db/prompts.md",
    createGuideConfig({
      name: "Prompts",
      itemHeight: PROMPT.ITEM.HEIGHT.SM,
      input: arg?.input || "",
      placeholder: "Browse Prompts",
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

onTab("Prompts", async (input) => {
  await renderPrompts();
  setTab("Prompts");
});

onTab("Categories", async (input) => {
  await filterPromptsByTag();
  setTab("Prompts");
});

onTab("Settings", async (input) => {
  await settings();
  setTab("Prompts");
});
