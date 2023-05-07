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
 * Update a tag in the db
 * @returns {Promise<void>}
 */
export const updateTag = async () => {
  const tagsDb = await db("prompt-tags");
  await tagsDb.read();

  let tagToUpdate = await arg("Select a tag to update", tagsDb.items);
  let updatedTag = await arg({
    placeholder: `${tagToUpdate}`,
    defaultValue: tagToUpdate,
  });

  tagsDb.items = tagsDb.items.map((tag) =>
    tag === tagToUpdate ? updatedTag : tag
  );

  await tagsDb.write();
  toast(`${tagToUpdate} updated to ${updatedTag}`);
};

/**
 * Delete a tag from the db
 * @returns {Promise<void>}
 */
export const deleteTag = async () => {
  const tagsDb = await db("prompt-tags");
  await tagsDb.read();

  let tagToDelete = await mini("Delete a tag", tagsDb.items);

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
    let tagToRead = await mini("Read a tag", [...availableTags, "Done"]);
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
    let tagToRemove = await mini("Remove a tag", [...selectedTags, "Done"]);
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
