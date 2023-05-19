import "@johnlindquist/kit";
import { editPrompts } from "./prompt.js";
import { editTags } from "./tags.js";
import { stripSquareBrackets } from "./helpers.js";

const exportJSON = async (dbName) => {
  const dBase = await db(dbName);
  await dBase.read();
  const filteredData = Object.values(dBase.data.snips).map((snip) => {
    return {
      name: stripSquareBrackets(snip.name),
      description: snip.description,
      snippet: snip.snippet,
      tags: snip.tags,
    };
  });
  const json = JSON.stringify(filteredData, null, 2);
  const path = await selectFolder("Where would you like to export to?");
  await writeFile(`${path}/${dbName}-snippets.json`, json);
};

const exportMarkdown = async (dbName) => {
  let markdown = `# ${dbName}\n\n`;
  let promptsObject = await db(dbName);
  await promptsObject.read();
  for (const key in promptsObject.data.snips) {
    const { name, description, snippet } = promptsObject.data.snips[key];

    markdown += `## ${stripSquareBrackets(
      name
    )}\n_${description}_\n\n\`\`\`plaintext\n${snippet}\n\`\`\`\n\n`;
  }
  const path = await selectFolder("Where would you like to export to?");
  // await selectFolder(`${path}-snippets.md`, markdown);

  await writeFile(`${path}/${dbName}-snippets.md`, markdown);
};

export const settings = async (dbName) => {
  const actions = {
    "Manage Prompts": () => editPrompts(dbName),
    "Manage Tags": () => editTags(dbName),
    Export: async () => {
      const format = await arg("Select format to export as", [
        "Markdown",
        "JSON",
      ]);
      format === "Markdown" && (await exportMarkdown(dbName));
      format === "JSON" && (await exportJSON(dbName));
    },
    Quit: async () => {
      const confirmation = await arg("Are you sure you want to quit?", [
        "[Y]es",
        "[N]o",
      ]);
      if (confirmation === "Yes") {
        exit();
      }
      setTab("Prompts");
    },
  };

  const selectedAction = await arg("Choose an action", [
    "Manage Prompts",
    "Manage Tags",
    "Export",
    "Quit",
  ]);
  await actions[selectedAction]();
};
