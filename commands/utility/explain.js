const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const cheerio = require("cheerio");
const axios = require("axios");

function scrape(html) {
  const $ = cheerio.load(html);

  const helpBoxElements = $(".help-box");
  let data = ``;
  for (let i = 0; i < helpBoxElements.length; i++) {
    const helpBoxElement = helpBoxElements[i];
    const helpText = $(helpBoxElement).text();
    data += `\n${helpText}\n`;
  }
  return data;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("explain")
    .setDescription("Explains a linux command")
    .addStringOption((option) =>
      option
        .setName("cmd")
        .setDescription("The command to explain")
        .setRequired(true)
    ),
  async execute(interaction) {
    const cmd = interaction.options.getString("cmd");
    await interaction.deferReply();
    axios
      .get(`https://www.explainshell.com/explain?cmd=${cmd}`)
      .then((res) => {
        const html = res.data;
        const em = new EmbedBuilder()
          .setTitle("Explain Shell Commands")
          .addFields({
            name: `Explaining: ${cmd}`,
            value: `\`\`\`${scrape(html)}\`\`\``,
          });
        interaction.editReply({ embeds: [em] });
      })
      .catch((err) => {
        console.log(err);
        interaction.editReply("An error occured");
      });
  },
};
