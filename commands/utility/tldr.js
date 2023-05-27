const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const { spawn } = require("child_process");

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
      const run = spawn("tldr", [cmdName]);
      run.stdout.on("data", (data) => {
        const em = new EmbedBuilder()
          .setTitle("TL;DR")
          .setDescription(`Summary of ${cmdName}`)
          .addFields({
            name: "Summary",
            value: `\`\`\`
${data.toString()}
\`\`\`
`,
          });
        const actionRow = linkBtn(cmdName);
        interaction.followUp({ embeds: [em], components: [actionRow] });
      });
    } else {
      const cmdName = interaction.options.getString("query");
      let newData = ``;
      const run = spawn("tldr", ["--search", cmdName]);
      run.stdout.on("data", (data) => {
        newData += data.toString();
        const em = new EmbedBuilder()
          .setTitle("TL;DR")
          .setDescription(`List of CLI/tool for **"${cmdName}"**`)
          .addFields({
            name: "List",
            value: `\`\`\`
${newData}
\`\`\`
`,
          });
        interaction.editReply({ embeds: [em] });
      });
    }
  },
};
