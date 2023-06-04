const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const xml = require("xml2js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("news")
    .setDescription(
      "Get the latest news and articles about Linux to keep you up to date and informative!"
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const embedData = [];
    const res = await axios.get(
      "http://fetchrss.com/rss/647cbc95bd7ef250da3d4d32647cbe31653de369ef1d14b2.xml"
    );
    const data = await res.data;
    const parser = new xml.Parser();
    let parsedData;
    parser.parseString(data, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        parsedData = res.rss.channel[0];
        parsedData.item.forEach((feed) => {
          embedData.push({
            name: feed.title[0],
            value: feed.link[0],
          });
        });
      }
    });
    const em = new EmbedBuilder()
      .setTitle("Latest Linux News and Articles\n")
      .setThumbnail(parsedData.item[0]["media:content"][0]["$"]["url"])
      .addFields(...embedData);
    await interaction.editReply({ embeds: [em] });
  },
};
