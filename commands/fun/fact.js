require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");

const TOKEN = process.env.OPENAI_KEY;

const config = new Configuration({
  apiKey: TOKEN,
});

const openai = new OpenAIApi(config);

async function complete() {
  try {
    const res = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Tell me a random fun fact about Linux",
        },
      ],
    });
    return new Promise((resolve) => {
      resolve(res.data.choices[0].message.content);
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fact")
    .setDescription("Get a random fact about Linux!"),
  async execute(interaction) {
    await interaction.deferReply();
    const fact = await complete();
    const file = new AttachmentBuilder("./assets/linux-penguin.png");
    const em = new EmbedBuilder()
      .setTitle("Random Linux Fun Fact")
      .addFields({
        name: "Fact",
        value: `\`\`\`${fact}\`\`\``,
      })
      .setThumbnail("attachment://linux-penguin.png");
    await interaction.editReply({ embeds: [em], files: [file] });
  },
};
