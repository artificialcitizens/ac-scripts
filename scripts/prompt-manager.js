// Name: Prompt Manager
// Description: Manage your prompt templates
// Author: Josh Mabry
// Twitter: @AI_Citizen
// Shortcut: cmd+shift+p

import "@johnlindquist/kit";

import { renderPrompts, seedPrompts } from "./utils/prompt.js";
import { filterPromptsByTag } from "./utils/tags.js";
import { settings } from "./utils/settings.js";

await seedPrompts();

onTab("Prompts", async () => {
  await renderPrompts("prompts");
  setTab("Prompts");
});

onTab("Filter by Tag", async () => {
  await filterPromptsByTag("prompts");
});

onTab("Settings", async () => {
  await settings("prompts");
  setTab("Prompts");
});
