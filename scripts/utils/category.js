// Menu: Tags CRUD Example
// Description: Add/remove/update tags from a list
import "@johnlindquist/kit";
/**
 * Seed the db with some tags
 */
export const seedTags = async () => {
  let tagsDb = await db("prompt-tags", [
    "chatGPT",
    "stable-diffusion",
    "quick-prompt",
  ]);
  await tagsDb.write();
  toast("Tags seeded");
};

/**
 * Add a new tag to the db
 * @returns {Promise<void>}
 */
export const createTag = async () => {
  const tagsDb = await db("prompt-tags");
  await tagsDb.read();
  let tagToAdd = await arg("Add a new tag");

  tagsDb.items.push(tagToAdd);
  await tagsDb.write();
  toast(`${tagToAdd} added`);
};

/**
 * Update an existing prompt in the db
 * @returns {Promise<void>}
 */
export const updatePrompt = async () => {
  let prompts = await db("prompts");
  let promptToUpdate = await arg(
    "Choose a prompt to update",
    Object.values(prompts.data).map((prompt) => prompt.name)
  );

  let idToUpdate = Object.keys(prompts.data).find(
    (key) => prompts.data[key].name === promptToUpdate
  );

  let updateSelection = await arg("What would you like to update?", [
    "Name",
    "Description",
    "Content",
    "Categories",
  ]);

  switch (updateSelection) {
    case "Name":
      prompts.data[idToUpdate].name = await arg({
        placeholder: prompts.data[idToUpdate].name,
        html: prompts.data[idToUpdate].name,
        strict: false,
        defaultValue: prompts.data[idToUpdate].name,
      });
      break;
    case "Description":
      prompts.data[idToUpdate].description = (
        await arg({
          placeholder: prompts.data[idToUpdate].description,
          defaultValue: prompts.data[idToUpdate].description,
        })
      ).trim();
      break;
    case "Content":
      prompts.data[idToUpdate].content = await editor({
        hint: "Update the prompt content",
        html: prompts.data[idToUpdate].content,
      });
      break;
    case "Categories":
      prompts.data[idToUpdate].model = await readTag();
      break;
    default:
      throw new Error("Invalid selection");
  }

  await prompts.write();
  await generateMarkdown();
};

/**
 * Delete a tag from the db
 * @returns {Promise<void>}
 */
export const deleteTag = async () => {
  const tagsDb = await db("prompt-tags");
  await tagsDb.read();

  let tagToDelete = await arg("Delete a tag", tagsDb.items);

  tagsDb.items = tagsDb.items.filter((tag) => tag !== tagToDelete);

  await tagsDb.write();
  toast(`${tagToDelete} deleted`);
};

/**
 * Read a tag from the db
 *
 * @returns {Promise<string>}
 */
export const readTag = async () => {
  const tagsDb = await db("prompt-tags");
  await tagsDb.read();
  const allTags = [...tagsDb.items];
  const selectedTags = [];
  let selecting = true;
  while (selecting) {
    const availableTags = allTags.filter((tag) => !selectedTags.includes(tag));
    let tagToRead = await arg("Read a tag", [...availableTags, "Done"]);
    if (tagToRead === "Done") {
      selecting = false;
    } else {
      selectedTags.push(tagToRead);
    }
  }
  return selectedTags;
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

// seedTags();
// await readTag();
// await createTag();
// await updateTag();
// await deleteTag();
