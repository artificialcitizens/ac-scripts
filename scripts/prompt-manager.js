// Name: Prompt Manager
// Description: Manage your prompt templates
// Author: Josh Mabry
// Twitter: @AI_Citizen

//##################
// ScriptKit Imports
//##################
import "@johnlindquist/kit";

import { renderPrompts, seedPrompts } from "./utils/prompt.js";
import { filterPromptsByTag } from "./utils/tags.js";
import { settings } from "./utils/settings.js";

await seedPrompts();
onTab("Prompts", async (input) => {
  await renderPrompts("prompts");
  setTab("Prompts");
});

onTab("Filter by Tag", async (input) => {
  await filterPromptsByTag("prompts");
});

onTab("Settings", async (input) => {
  await settings("prompts");
  setTab("Prompts");
});
