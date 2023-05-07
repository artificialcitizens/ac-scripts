// Menu: Prompts CRUD Example
// Description: Add/remove/update objects from db

import "@johnlindquist/kit";
import {
  createPrompt,
  updatePrompt,
  deletePrompt,
  generateMarkdown,
} from "./prompt.js";
import { createTag, deleteTag } from "./category.js";

export const editPrompts = async () => {
  const actions = {
    create: createPrompt,
    update: updatePrompt,
    delete: deletePrompt,
    // generate: generateMarkdown,
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
    // {
    //   name: "Generate Markdown",
    //   value: "generate",
    // },
  ]);

  await actions[selectedAction]();
};

export const editCategories = async () => {
  const actions = {
    create: createTag,
    // update: updateTag,
    delete: deleteTag,
  };

  const selectedAction = await arg("Choose an action", [
    {
      name: "Create category",
      value: "create",
    },
    // {
    //   name: "Update category",
    //   value: "update",
    // },
    {
      name: "Delete category",
      value: "delete",
    },
  ]);

  await actions[selectedAction]();
};

export const settings = async () => {
  const actions = {
    "Edit categories": editCategories,
    "Edit prompts": editPrompts,
    "View Markdown": generateMarkdown,
    Exit: async () => {
      const confirmation = await arg("Are you sure you want to exit?", [
        "Yes",
        "No",
      ]);
      if (confirmation === "Yes") {
        exit();
      }
      setTab("Prompts");
    },
  };

  const selectedAction = await arg("Choose an action", [
    {
      name: "Edit categories",
      value: "Edit categories",
    },
    {
      name: "Edit prompts",
      value: "Edit prompts",
    },
    {
      name: "View Markdown",
      value: "View Markdown",
    },
    {
      name: "Exit",
      value: "Exit",
    },
  ]);
  log(selectedAction);
  await actions[selectedAction]();
};
