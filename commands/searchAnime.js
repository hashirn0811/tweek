const { SlashCommandBuilder } = require("@discordjs/builders");

const { makeAnimembed, makeErrEmbed } = require("../makembed");
const { request, GraphQLClient } = require("graphql-request");
const mediaquery = require(`../media/queryAnime`);
const { MessageEmbed } = require("discord.js");
const requestClient = new GraphQLClient("https://graphql.anilist.co", {
  redirect: "follow",
});
const striptags = require("striptags");

const data = new SlashCommandBuilder()
  .setName("aanime")
  .setDescription("Search Query")
  .addStringOption((opt) =>
    opt.setName("anime").setDescription("enter anime to search")
  );

module.exports = {
  data: data,
  async execute(interaction) {
    const query = interaction.options.getString("anime") || "wrong";
    //await interaction.reply(`${query}`);
    let res = null;
    res = await requestClient
      .request(mediaquery, { search: query })
      .then(async (res) => {
        console.log(`Query Success`);
        const media = res.Media;
        let fixDisc = striptags(media.description);
        fixDisc =
          fixDisc.length > 400
            ? `${fixDisc
                .substring(0, 400)
                .trim()
                .replace(/(&quot\;)/g, '"')}...` //removes quotes
            : `${fixDisc}`;
        let embed = "";
        embed = makeAnimembed({
          color: media.coverImage.color,
          title: media.title.english ?? media.title.romaji,
          MediaUrl: media.siteUrl,
          description: fixDisc,
          thumbnail: media.coverImage.large,
          avgScore: media.averageScore,
          status: media.status,
          episodes: media.episodes,
          format: media.format,
          id: media.id,
          interaction: interaction,
        });
        await interaction
          .reply({ embeds: [embed] })
          .then(() => console.log("sent"))
          .catch(console.error());
      })
      .catch(async (e) => {
        // await interaction.channel.send(`Query failed ${e}`);
        const resErr = e.response?.errors;
        let status, msg;
        resErr.forEach((ele) => {
          status = ele.status;
          msg = ele.message;
        });
        const myEmbed = makeErrEmbed({
          statusCode: `${status}`,
          description: `**${msg}**`,
          interaction: interaction,
        });
        await interaction
          .reply({ embeds: [myEmbed] })
          .then(() => console.log("sent"))
          .catch((e) => {
            interaction.reply(`Failed \n ${e}`);
          });
      });
    /* if (res === null) {
      await interaction.reply("query failed");
      return;
    } */

    /* else {
      await interaction.reply(
        interaction.user.avatarURL({ format: "png", size: 256 })
      ); */

    /*  const media = res.Media;
    let fixDisc = striptags(media.description);
    fixDisc =
      fixDisc.length > 200
        ? `${fixDisc.substring(0, 200).trim()}...`
        : `${fixDisc}`;
    let embed = "";
    embed = makeAnimembed({
      color: media.coverImage.color,
      title: media.title.english,
      MediaUrl: media.siteUrl,
      description: fixDisc,
      thumbnail: media.coverImage.large,
      avgScore: media.averageScore,
      status: media.status,
      episodes: media.episodes,
      id: media.id,
      interaction: interaction,
    });
    await interaction.channel
      .send({ embeds: [embed] })
      .then(() => console.log("sent"))
      .catch(console.error()); */
  },
};
