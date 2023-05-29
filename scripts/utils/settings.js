import "@johnlindquist/kit";
import { editPrompts } from "./prompt.js";
import { editTags, renderTags } from "./tags.js";
import { stripSquareBrackets } from "./helpers.js";

// const exportJSON = async (dbName, filterTags = []) => {
//   const dBase = await db(dbName);
//   await dBase.read();
//   const filteredData = Object.values(dBase.data.snips).map((snip) => {
//     if (filterTags.length > 0) {
//       if (tags.some((tag) => snip.tags.includes(tag))) {
//         return {
//           name: snip.name,
//           description: snip.description,
//           snippet: snip.snippet,
//           tags: snip.tags,
//         };
//       } else {
//         return null;
//       }
//     } else {
//       return {
//         name: snip.name,
//         description: snip.description,
//         snippet: snip.snippet,
//         tags: snip.tags,
//       };
//     }
//   });
//   const json = JSON.stringify(filteredData, null, 2);
//   const path = await selectFolder("Where would you like to export to?");
//   await writeFile(`${path}/${dbName}-snippets.json`, json);
// };

// const exportYAML = async (dbName, filterTags = []) => {
//   const dBase = await db(dbName);
//   await dBase.read();
//   const filteredData = Object.values(dBase.data.snips)
//     .map((snip) => {
//       if (filterTags.length > 0) {
//         if (tags.some((tag) => snip.tags.includes(tag))) {
//           return {
//             name: stripSquareBrackets(snip.name),
//             description: snip.description,
//             snippet: snip.snippet,
//             tags: snip.tags,
//           };
//         } else {
//           return null;
//         }
//       } else {
//         return {
//           name: stripSquareBrackets(snip.name),
//           description: snip.description,
//           snippet: snip.snippet,
//           tags: snip.tags,
//         };
//       }
//     })
//     .filter((snip) => snip !== null);

//   const yamlData = yaml.dump(filteredData, { lineWidth: 120 });
//   const path = await selectFolder("Where would you like to export to?");
//   await writeFile(`${path}/${dbName}-snippets.yml`, yamlData);
// };

const exportMarkdown = async (
  dbName,
  fileName = "prompt-snippets",
  filterTags = []
) => {
  let markdown = `# ${dbName}\n\n`;
  let promptsObject = await db(dbName);
  await promptsObject.read();
  for (const key in promptsObject.data.snips) {
    const { name, description, snippet, tags } = promptsObject.data.snips[key];
    if (filterTags.length > 0) {
      if (tags.some((tag) => filterTags.includes(tag))) {
        markdown += `## ${name}\n_${description}_\n\n\`\`\`plaintext\n${snippet}\n\`\`\`\n\n`;
      }
    } else {
      markdown += `## ${name}\n_${description}_\n\n\`\`\`plaintext\n${snippet}\n\`\`\`\n\n`;
    }
  }

  const path = await selectFolder("Where would you like to export to?");

  await writeFile(`${path}/${fileName}.md`, markdown);
};

export const settings = async (dbName) => {
  const actions = {
    "Manage Prompts": () => editPrompts(dbName),
    "Manage Tags": () => editTags(dbName),
    Export: async () => {
      // const format = await arg("Select format to export as", [
      //   "Markdown",
      //   "JSON",
      //   // "YAML",
      // ]);
      const tags = await renderTags(dbName);
      const fileName = await arg("What would you like to name the file?");
      await exportMarkdown(dbName, fileName, tags);
      toast(`Exported ${dbName} to ${fileName}.md`);
      // format === "Markdown" && (await exportMarkdown(dbName, tags));
      // format === "JSON" && (await exportJSON(dbName, tags));
      // format === "YAML" && (await exportYAML(dbName, tags));
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
