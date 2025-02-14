import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import CustomClient from '../client/CustomClient';
import Command from '../loaders/commandLoader/Command';
import { CommandCategory } from '../enums/CommandCategory';
import config from '../config';
import axios from 'axios';

interface MatchRoster {
  nickname: string;
  player_id: string;
}

interface MatchTeam {
  roster: MatchRoster[];
}

interface MatchData {
  match_id: string;
  competition_name: string;
  teams: {
    faction1: MatchTeam;
    faction2: MatchTeam;
  };
  results: {
    winner: string;
    score: {
      faction1: number;
      faction2: number;
    };
  };
  finished_at: number;
  faceit_url: string;
  game: string;
}

export default class History extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: 'history',
      description: 'Shows the match history of a player',
      category: CommandCategory.INFO,
      default_member_permissions: 0n,
      options: [
        {
          type: 3,
          name: 'nickname',
          description: 'Faceit nickname',
          required: true,
        },
      ],
      dm_permissions: false,
      cooldown: 5,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const nickname = interaction.options.getString('nickname', true);
    await interaction.deferReply();

    try {
      const player = await axios.get(
        `https://open.faceit.com/data/v4/players`,
        {
          params: { nickname },
          headers: { Authorization: `Bearer ${config.FACEIT_API_KEY}` },
        }
      );

      console.log(player.data);
      const playerId = player.data.player_id;
      const playerAvatar = player.data.avatar;
      const playerElo = player.data.games.cs2.faceit_elo;
      const playerLevel = player.data.games.cs2.skill_level;
      //   const playerUrl = player.data.faceit_url;
      //   const playerCountry = player.data.country;

      const history = await axios.get(
        `https://open.faceit.com/data/v4/players/${playerId}/history`,
        {
          params: { game: 'cs2', offset: 0, limit: 10 },
          headers: { Authorization: `Bearer ${config.FACEIT_API_KEY}` },
        }
      );

      console.log(history.data.items);

      const matches = history.data.items as MatchData[];

      const embed = new EmbedBuilder()
        .setTitle(`${nickname}'s Match History`)
        .setColor('#FF5500')
        .setThumbnail(playerAvatar)
        .setDescription(`Current Elo: ${playerElo} (Level ${playerLevel})`)
        .addFields(
          await Promise.all(
            matches.map(async (match) => {
              try {
                const matchDetails = await axios.get(
                  `https://open.faceit.com/data/v4/matches/${match.match_id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${config.FACEIT_API_KEY}`,
                    },
                  }
                );

                const inFaction1 =
                  matchDetails.data.teams?.faction1?.roster?.some(
                    (p: MatchRoster) => p.player_id === playerId
                  );

                const playerTeam = inFaction1 ? 'faction1' : 'faction2';
                // const enemyTeam =
                //   playerTeam === 'faction1' ? 'faction2' : 'faction1';

                // const score = `${match.results.score[playerTeam]}-${match.results.score[enemyTeam]}`;

                const won = match.results.winner === playerTeam;
                const matchDate = new Date(
                  match.finished_at * 1000
                ).toLocaleString();
                const url = match.faceit_url.replace('{lang}', 'en');

                const mapName =
                  matchDetails.data.voting.map.pick[0] || 'Unknown Map';

                return {
                  name: mapName,
                  value: `${won ? '🟩' : '🟥'} | **${won ? 'Victory' : 'Defeat'}** | ${matchDate}\n[View Match](${url})`,
                  inline: false,
                };
              } catch (error) {
                console.error(
                  `Error processing match ${match.match_id}:`,
                  error
                );
                return {
                  name: 'Match Data Unavailable',
                  value: 'Could not load match details',
                  inline: false,
                };
              }
            })
          )
        )
        .setFooter({ text: 'Data from FACEIT API' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content:
          'Failed to retrieve match history. Please check the nickname and try again.',
      });
    }
  }
}
