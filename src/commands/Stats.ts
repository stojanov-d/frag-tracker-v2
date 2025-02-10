import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionReplyOptions,
  MessageFlags,
  PermissionsBitField,
} from 'discord.js';
import CustomClient from '../client/CustomClient';
import { CommandCategory } from '../enums/CommandCategory';
import Command from '../loaders/commandLoader/Command';
import config from '../config';
import axios, { AxiosResponse } from 'axios';

export interface PlayerData {
  player_id: string;
  [key: string]: unknown;
}

export interface LifetimeStats {
  'Win Rate %': number | string;
  Matches: number | string;
  'Average K/D Ratio': number | string;
  [key: string]: unknown;
}

export interface MatchStats {
  stats: {
    Kills?: number | string;
    Deaths?: number | string;
    Assists?: number | string;
    Headshots?: number | string;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

async function fetchAggregatedMatchStats(
  playerId: string,
  START_TIMESTAMP: number,
  END_TIMESTAMP: number
): Promise<MatchStats[]> {
  const aggregatedMatchStats: MatchStats[] = [];
  let currentStart = new Date(START_TIMESTAMP);

  while (currentStart.getTime() < END_TIMESTAMP) {
    let currentEnd = new Date(currentStart);
    currentEnd.setMonth(currentEnd.getMonth() + 1);
    if (currentEnd.getTime() > END_TIMESTAMP) {
      currentEnd = new Date(END_TIMESTAMP);
    }

    console.log(
      'Fetching data from:',
      currentStart.toISOString(),
      'to:',
      currentEnd.toISOString()
    );

    let offset = 0;
    const limit = 100;
    while (true) {
      const url = `https://open.faceit.com/data/v4/players/${playerId}/games/cs2/stats`;
      const params = {
        from: currentStart.getTime(),
        to: currentEnd.getTime(),
        limit: limit,
        offset: offset,
      };
      const headers = {
        Authorization: `Bearer ${config.FACEIT_API_KEY}`,
      };

      try {
        const statsResponse: AxiosResponse<{ items: MatchStats[] }> =
          await axios.get(url, {
            params,
            headers,
          });
        console.log('Full stats data object:', statsResponse.data);

        const matchStats = statsResponse.data.items;
        if (!matchStats || matchStats.length === 0) {
          break;
        }
        aggregatedMatchStats.push(...matchStats);
        offset += limit;
        if (matchStats.length < limit) {
          break;
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error('Axios Error:', error.message);
          if (error.response) {
            console.error('Response Data:', error.response.data);
            console.error('Response Status:', error.response.status);
          }
        } else {
          console.error('Unexpected Error:', error);
        }
        break;
      }
    }
    currentStart = currentEnd;
  }

  console.log('Aggregated Match Stats Count:', aggregatedMatchStats.length);
  return aggregatedMatchStats;
}

function aggregateCounts(matchStats: MatchStats[]): { [key: string]: number } {
  const aggregatedCounts = matchStats.reduce(
    (acc: { [key: string]: number }, item: MatchStats) => {
      const stats = item.stats;
      if (!stats) return acc;
      const countKeys = ['Kills', 'Deaths', 'Assists', 'Headshots'];
      countKeys.forEach((key) => {
        const value = stats[key];
        if (value !== null && value !== undefined) {
          const num: number =
            typeof value === 'number' ? value : parseFloat(value as string);
          if (!isNaN(num)) {
            acc[key] = (acc[key] || 0) + num;
          }
        }
      });
      return acc;
    },
    {}
  );

  if (aggregatedCounts.Deaths && aggregatedCounts.Deaths > 0) {
    aggregatedCounts['K/D Ratio'] =
      aggregatedCounts['Kills'] / aggregatedCounts['Deaths'];
  }

  const totalMatches = matchStats.length;
  let wins = 0;
  matchStats.forEach((match) => {
    const stats = match.stats;
    if (stats && stats['Result'] === '1') {
      wins++;
    }
  });
  aggregatedCounts['Wins'] = wins;
  aggregatedCounts['Matches'] = totalMatches;
  aggregatedCounts['Win Rate'] =
    totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

  return aggregatedCounts;
}

function getMostPlayedMaps(matchStats: MatchStats[]): string {
  const mapCounts: { [mapName: string]: number } = {};
  matchStats.forEach((item) => {
    const stats = item.stats;
    if (stats && stats['Map']) {
      const mapName = stats['Map'] as string;
      mapCounts[mapName] = (mapCounts[mapName] || 0) + 1;
    }
  });

  const sortedMaps = Object.entries(mapCounts).sort((a, b) => b[1] - a[1]);
  return (
    sortedMaps
      .slice(0, 3)
      .map(([mapName, count]) => `${mapName} (${count})`)
      .join(', ') || 'N/A'
  );
}

export default class Stats extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: 'stats',
      description: 'Get player stats',
      category: CommandCategory.INFO,
      options: [
        {
          name: 'nickname',
          description: 'Your faceit nickname',
          type: 3,
          required: true,
        },
      ],
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      dm_permissions: false,
      cooldown: 5,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const nickname = interaction.options.getString('nickname', true);
    await interaction.deferReply();

    try {
      const playerResponse = await axios.get<PlayerData>(
        `https://open.faceit.com/data/v4/players`,
        {
          params: { nickname },
          headers: { Authorization: `Bearer ${config.FACEIT_API_KEY}` },
        }
      );

      const playerData = playerResponse.data;
      const playerId = playerData.player_id;
      const START_TIMESTAMP = 1696114800000; // 01.10.2023
      const END_TIMESTAMP = Date.now();

      const aggregatedMatchStats = await fetchAggregatedMatchStats(
        playerId,
        START_TIMESTAMP,
        END_TIMESTAMP
      );
      const aggregatedCounts = aggregateCounts(aggregatedMatchStats);
      const mostPlayedMaps = getMostPlayedMaps(aggregatedMatchStats);

      const embed = new EmbedBuilder()
        .setTitle(`Faceit stats for ${nickname}`)
        .setColor('Orange')
        .addFields(
          {
            name: 'Total Kills',
            value:
              aggregatedCounts['Kills'] !== undefined
                ? aggregatedCounts['Kills'].toString()
                : 'N/A',
            inline: true,
          },
          {
            name: 'Total Deaths',
            value:
              aggregatedCounts['Deaths'] !== undefined
                ? aggregatedCounts['Deaths'].toString()
                : 'N/A',
            inline: true,
          },
          {
            name: 'Total Assists',
            value:
              aggregatedCounts['Assists'] !== undefined
                ? aggregatedCounts['Assists'].toString()
                : 'N/A',
            inline: true,
          },
          {
            name: 'Total Headshots',
            value:
              aggregatedCounts['Headshots'] !== undefined
                ? aggregatedCounts['Headshots'].toString()
                : 'N/A',
            inline: true,
          },
          {
            name: 'Aggregated K/D Ratio',
            value:
              aggregatedCounts['K/D Ratio'] !== undefined
                ? aggregatedCounts['K/D Ratio'].toFixed(2)
                : 'N/A',
            inline: true,
          },
          {
            name: 'Win Rate',
            value:
              aggregatedCounts['Win Rate'] !== undefined
                ? aggregatedCounts['Win Rate'].toFixed(2) + '%'
                : 'N/A',
            inline: true,
          },
          {
            name: 'Most Played Maps',
            value: mostPlayedMaps,
            inline: false,
          }
        )
        .setFooter({ text: 'Data provided by Faceit API' })
        .setTimestamp();

      interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      interaction.editReply({
        content:
          errorMessage ||
          'Failed to retrieve Faceit stats. Please ensure the nickname is correct and try again.',
        flags: MessageFlags.Ephemeral,
      } as InteractionReplyOptions);
    }
  }
}
