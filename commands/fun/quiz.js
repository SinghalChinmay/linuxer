require("dotenv").config();
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const axios = require("axios");

const QUIZ_API_KEY = process.env.QUIZAPI_KEY;

const shuffleOptions = (optionsArray, answerArray) => {
  for (let i = optionsArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
  }

  const shuffledArray = optionsArray.map(([key, value]) => ({
    option_value: value,
    correct: answerArray.find(([answerKey]) => answerKey.includes(key))[1],
  }));

  return shuffledArray;
};

const fetchQuestion = async () => {
  const res = await axios.get(
    `https://quizapi.io/api/v1/questions?apiKey=${QUIZ_API_KEY}&limit=1&tags=bash,linux`
  );
  const data = res.data[0];
  const validOptions = [];
  const validAnswers = [];
  for (let i = 0; i < Object.keys(data.answers).length; i++) {
    if (i < 4) {
      validOptions.push([
        Object.keys(data.answers)[i],
        data.answers[Object.keys(data.answers)[i]],
      ]);
    }
  }
  for (let i = 0; i < Object.keys(data.correct_answers).length; i++) {
    if (i < 4) {
      validAnswers.push([
        Object.keys(data.correct_answers)[i],
        data.correct_answers[Object.keys(data.correct_answers)[i]],
      ]);
    }
  }
  return {
    question: data.question,
    options: shuffleOptions(validOptions, validAnswers),
  };
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trivia")
    .setDescription("Returns a random trivia question about linux"),
  async execute(interaction) {
    await interaction.deferReply();
    const dets = await fetchQuestion();

    const em = new EmbedBuilder()
      .setTitle(dets.question)
      .addFields(
        { name: "Option 1", value: dets.options[0].option_value },
        { name: "Option 2", value: dets.options[1].option_value },
        { name: "Option 3", value: dets.options[2].option_value },
        { name: "Option 4", value: dets.options[3].option_value }
      );

    const btns = [];
    for (let i = 0; i < 4; i++) {
      btns.push(
        new ButtonBuilder()
          .setCustomId(`${i}`)
          .setLabel(`Option ${i + 1}`)
          .setStyle(ButtonStyle.Secondary)
      );
    }
    const row = new ActionRowBuilder().addComponents(...btns);

    const res = await interaction.editReply({
      embeds: [em],
      components: [row],
    });

    const filter = (btn) => btn.user.id === interaction.user.id;
    try {
      const userAns = await res.awaitMessageComponent({ filter, time: 60000 });
      const judging = dets.options[parseInt(userAns.customId)].correct;
      if (judging === "true") {
        btns[parseInt(userAns.customId)].setStyle(ButtonStyle.Success);
      } else {
        let correctAns;
        for (let i = 0; i < 4; i++) {
          if (dets.options[i].correct === "true") {
            correctAns = i;
          }
        }
        btns[parseInt(userAns.customId)].setStyle(ButtonStyle.Danger);
        btns[correctAns].setStyle(ButtonStyle.Success);
      }
      btns.forEach((btn) => btn.setDisabled(true));
      await userAns.update({ embeds: [em], components: [row] });
    } catch (err) {
      await interaction.editReply({
        content: "You didn't answer in time!",
        components: [],
      });
    }
  },
};
