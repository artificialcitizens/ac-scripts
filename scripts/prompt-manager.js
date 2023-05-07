// Name: Prompt Manager
// Description: Manage your prompt templates
// Author: Josh Mabry
// Twitter: @AI_Citizen

//##################
// ScriptKit Imports
//##################
import "@johnlindquist/kit";

import {
  createPrompt,
  updatePrompt,
  deletePrompt,
} from "./utils/prompt-crud.js";

export const editPrompts = async () => {
  const actions = {
    create: createPrompt,
    update: updatePrompt,
    delete: deletePrompt,
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
  ]);

  await actions[selectedAction]();
};

onTab("Manage Prompts", async (input) => {
  await editPrompts();
});
// onTab("Prompts", async (input) => {});
