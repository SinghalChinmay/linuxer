const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const { spawn } = require("child_process");
const wait = require("node:timers/promises").setTimeout;

const linkBtn = (cmd) => {
  const btn = new ButtonBuilder()
    .setLabel("Read about this in more detail")
    .setURL(`https://manned.org/${cmd}.1`)
    .setStyle(ButtonStyle.Link);
  return new ActionRowBuilder().addComponents(btn);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tldr")
    .setDescription(
      "Summarize a CLI/tool or help you search one for your needs!"
    )
    .addSubcommand((subcmd) =>
      subcmd
        .setName("cmd")
        .setDescription("Returns a summary of a CLI/tool")
        .addStringOption((option) =>
          option
            .setName("cmdname")
            .setDescription("The name of the CLI/tool")
            .setRequired(true)
        )
    )
    .addSubcommand((subcmd) =>
      subcmd
        .setName("search")
        .setDescription("Searches for a CLI/tool for your needs!")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("Your search query")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcmd = interaction.options.getSubcommand();
    await interaction.deferReply();

    // TODO : Error handling
    if (subcmd == "cmd") {
      const cmdName = interaction.options.getString("cmdname");
      const cmdData = new Promise((res, rej) => {
        const run = spawn("tldr", [cmdName]);
        run.stdout.on("data", (data) => {
          res(data.toString());
        });
      });
      cmdData.then((data) => {
        const em = new EmbedBuilder()
          .setTitle("TL;DR")
          .setDescription(`Summary of ${cmdName}`)
          .addFields({
            name: "Summary",
            value: `\`\`\`
${data}
\`\`\`
`,
          });
        const actionRow = linkBtn(cmdName);
        interaction.followUp({ embeds: [em], components: [actionRow] });
      });
    } else {
      const cmdName = interaction.options.getString("query");
      let count = 0;
      let newData = "";
      const cmdData = new Promise((res, rej) => {
        const run = spawn("tldr", ["--search", cmdName]);
        run.stdout.on("data", (data) => {
          newData += data.toString();
          if (count >= 2) {
            res(newData);
            count = 0;
            newData = "";
          }
          count++;
        });
      });
      cmdData.then((data) => {
        const em = new EmbedBuilder()
          .setTitle("TL;DR")
          .setDescription(`List of CLI/tool for **"${cmdName}"**`)
          .addFields({
            name: "List",
            value: `\`\`\`
${data}
\`\`\`
`,
          });
        interaction.followUp({ embeds: [em] });
      });
    }
  },
};
