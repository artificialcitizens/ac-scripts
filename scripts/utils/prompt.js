// Menu: Prompts CRUD Example
// Description: Add/remove/update objects from db
import "@johnlindquist/kit";
/**
 * Add a new prompt to the db
 * @returns {Promise<void>}
 */
export const createPrompt = async () => {
  let prompts = await db("prompts");
  let promptName = await arg("Add a new prompt");

  let id = uuid();
  prompts.data[id] = {
    name: promptName,
    description: await arg("Enter a description for the prompt"),
    content: await editor({
      hint: "Enter the prompt content",
    }),
    model: await readTag(),
  };
  await prompts.write();
};

/**
 * Read a prompt from the db
 * @returns {Promise<void>}
 */
export const readPrompt = async () => {
  let prompts = await db("prompts");
  let promptToRead = await arg(
    "Choose a prompt to read",
    Object.values(prompts.data).map((prompt) => prompt.name)
  );

  let idToRead = Object.keys(prompts.data).find(
    (key) => prompts.data[key].name === promptToRead
  );

  console.log("Name:", prompts.data[idToRead].name);
  console.log("Description:", prompts.data[idToRead].description);
  console.log("Content:", prompts.data[idToRead].content);
  console.log("Categories:", prompts.data[idToRead].model.join(", "));
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

  prompts.data[idToUpdate] = {
    name: await arg({
      placeholder: prompts.data[idToUpdate].name,
      html: prompts.data[idToUpdate].name,
      strict: false,
      defaultValue: prompts.data[idToUpdate].name,
      onSubmit: (name) => {
        if (!name) {
          return prompts.data[idToUpdate].name;
        }
        return name;
      },
      onForward: (name) => {
        if (!name) {
          return prompts.data[idToUpdate].name;
        }
        return name;
      },
    }),
    description: (
      await arg({
        placeholder: prompts.data[idToUpdate].description,
        defaultValue: prompts.data[idToUpdate].description,
      })
    ).trim(),
    content: await editor({
      hint: "Update the prompt content",
      html: prompts.data[idToUpdate].content,
    }),
    model: await readTag(),
  };
  await prompts.write();
  await generateMarkdown();
};

/**
 * Delete a prompt from the db
 * @returns {Promise<void>}
 */
export const deletePrompt = async () => {
  let prompts = await db("prompts");
  let promptToDelete = await arg(
    "Delete a Prompt",
    Object.values(prompts.data).map((fruit) => fruit.name)
  );

  let idToDelete = Object.keys(prompts.data).find(
    (key) => prompts.data[key].name === promptToDelete
  );
  let confirmation = await arg("Are you sure you want to delete this prompt?", [
    "[Y]es",
    "[N]o",
  ]);
  if (confirmation === "No") {
    return;
  }
  delete prompts.data[idToDelete];

  await prompts.write();
  await generateMarkdown();
};

/**
 * Category input prompt
 */
export const promptCategory = async () => {
  let prompts = await db("prompts");
  let promptToTag = await arg(
    "Choose a prompt to tag",
    Object.values(prompts.data).map((prompt) => prompt.name)
  );

  let idToTag = Object.keys(prompts.data).find(
    (key) => prompts.data[key].name === promptToTag
  );

  prompts.data[idToTag].model = readTag();

  await prompts.write();
  await generateMarkdown();
};

export const generateMarkdown = async () => {
  let markdown = "# Prompts\n\n";
  let promptsObject = await db("prompts");
  for (const key in promptsObject.data) {
    const { name, description, content } = promptsObject[key];

    markdown += `## ${name}\n_${description}_\n\n\`\`\`plaintext\n${content}\n\`\`\`\n\n`;
  }
  await writeFile("./db/prompts.md", markdown);
  await div(md(markdown));
};

//**
// Filter prompts by tag
//*/
export const filterPromptsByTag = async () => {
  const prompts = await db("prompts");
  const tag = await arg("Filter prompts by tag", [
    ...new Set(
      Object.values(prompts.data)
        .map((prompt) => prompt.model)
        .flat()
    ),
  ]);
  const filteredPrompts = Object.values(prompts.data).filter((prompt) =>
    prompt.model.includes(tag)
  );
  const prompt = await arg(
    "Choose a prompt",
    filteredPrompts.map((prompt) => prompt.name)
  );
  const id = Object.keys(prompts.data).find(
    (key) => prompts.data[key].name === prompt
  );
  const { name, description, content } = prompts.data[id];
  await div(
    `## ${name}\n_${description}_\n\n\`\`\`plaintext\n${content}\n\`\`\`\n\n`
  );
};

//@TODO: Move seed data to a separate file
/**
 * Returns the id of the selected prompt
 * @returns {Promise<void>}
 */
export const seedPrompts = async () => {
  let prompts = await db("prompts", {
    "d3b86acd-3e4a-4df4-8b5a-a341676dbb23": {
      name: "The Oracle",
      description:
        "A deep thinking AI. Ask it anything. Like why do you always lose socks?",
      prompt: `What's an example of a phenomenon where humanity as a whole lacks 
    a good explanation for, but, taking into account the full set of human generated knowledge, 
    an explanation is actually possible to generate? Please write the explanation. 
    It must not be a hypothesis that has been previously proposed. 
    A good explanation will be hard to vary 
    `,
      model: ["chatgpt"],
    },
    "f2c92a3b-1d60-4e94-8c96-8b42e3ea0e38": {
      name: "Explain Plz",
      description: "A series of explanations",
      prompt: `Ignore prior instructions, you are tasked with taking the following text and explaining it to the user.
{{text}}
Return the response in the following format using markdown syntax:
# Explain Plz
## TLDR (A quick summary of the highlighted text)
## ELI5 (Explain Like I'm 5)
## Explanation (A longer technical explanation of the highlighted text)`,
      model: ["stable-diffusion"],
    },
    "e7c2d7e2-0a9c-4a5d-9b7d-5c5f5af1a8c5": {
      name: "Translate Plz",
      description: "Translate the given text",
      prompt: `Ignore prior instructions, you are tasked with taking the input text 
    and translating it into {{language}}.
and updating any needed meaning or context.`,
      model: ["open-assistant"],
    },
  });

  await prompts.write();
};
