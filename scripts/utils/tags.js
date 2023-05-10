// Description: Add/remove/update tags from a list
import "@johnlindquist/kit";

/**
 * Add a new tag to the db
 * @returns {Promise<void>}
 */
export const createTag = async (dbName) => {
  const tagsDb = await db(dbName);
  await tagsDb.read();
  let tagToAdd = await arg("Add a new tag");

  tagsDb.tags.push(tagToAdd);
  await tagsDb.write();
  toast(`${tagToAdd} added`);
};

/**
 * Delete a tag from the db
 * @returns {Promise<void>}
 */
export const deleteTag = async (dbName) => {
  const tagsDb = await db(dbName);
  await tagsDb.read();

  let tagToDelete = await arg("Delete a tag", tagsDb.tags);

  tagsDb.tags = tagsDb.tags.filter((tag) => tag !== tagToDelete);

  await tagsDb.write();
  toast(`${tagToDelete} deleted`);
};

/**
 * Remove a tag from the selected tags list
 *
 * @param {string[]} selectedTags - The list of selected tags
 * @returns {Promise<string[]>}
 */
export const removeTag = async (selectedTags) => {
  let removing = true;
  while (removing) {
    let tagToRemove = await arg("Remove a tag", [...selectedTags, "Done"]);
    if (tagToRemove === "Done") {
      removing = false;
    } else {
      selectedTags = selectedTags.filter((tag) => tag !== tagToRemove);
    }
  }
  return selectedTags;
};

//**
// Filter prompts by tag
//*/
export const filterPromptsByTag = async (dbName) => {
  const prompts = await db(dbName);
  await prompts.read();
  const tag = await arg("Filter prompts by tag", [...new Set(prompts.tags)]);
  const filteredPrompts = Object.values(prompts.data.snips).filter((prompt) =>
    prompt.tags.includes(tag)
  );
  const prompt = await arg(
    "Choose a prompt",
    filteredPrompts.map((prompt) => prompt.name)
  );
  const id = Object.keys(prompts.data.snips).find(
    (key) => prompts.data.snips[key].name === prompt
  );
  const { name, snippet } = prompts.data.snips[id];
  await template(snippet, {
    onSubmit: async (snippet) => {
      await clipboard.writeText(snippet);
      toast(`Copied ${name} to clipboard!`);
      setTimeout(() => {
        exit(1);
      }, 1000);
    },
  });
};

/**
 * Render a list of tags to select from
 *
 * @returns {Promise<string>}
 */
export const selectTag = async (dbName) => {
  const tagsDb = await db(dbName);
  await tagsDb.read();
  const allTags = [...tagsDb.data.tags];
  const selectedTags = {};
  let selecting = true;
  while (selecting) {
    const availableTags = allTags.map((tag) => ({
      name: `${tag} ${selectedTags[tag] ? " ✓" : " "}`,
      value: tag,
    }));
    let tagToRead = await arg("Read a tag", [
      ...availableTags,
      { name: "Done", value: "Done" },
    ]);
    if (tagToRead === "Done") {
      selecting = false;
    } else {
      selectedTags[tagToRead] = !selectedTags[tagToRead];
    }
  }
  return Object.keys(selectedTags).filter((tag) => selectedTags[tag]);
};

/**
 * Renders a list of tags to select from and edit
 * @returns {Promise<void>}
 */
export const editTags = async (dbName) => {
  const actions = {
    create: async () => createTag(dbName),
    delete: async () => deleteTag(dbName),
  };

  const selectedAction = await arg("Choose an action", [
    {
      name: "Create tag",
      value: "create",
    },
    {
      name: "Delete tag",
      value: "delete",
    },
  ]);

  await actions[selectedAction]();
};
