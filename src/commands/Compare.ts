import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
} from 'discord.js';
import CustomClient from '../client/CustomClient';
import { CommandCategory } from '../enums/CommandCategory';
import Command from '../loaders/commandLoader/Command';
import config from '../config';
import axios from 'axios';
import { MatchStats, PlayerData } from './Stats';

export default class Compare extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: 'compare',
      description: 'Compare stats between two players',
      category: CommandCategory.INFO,
      options: [
        {
          name: 'player1',
          description: 'First player to compare',
          type: 3,
          required: true,
        },
        {
          name: 'player2',
          description: 'Second player to compare',
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
    const player1Nick = interaction.options.getString('player1', true);
    const player2Nick = interaction.options.getString('player2', true);
    await interaction.deferReply();

    try {
      const [player1Data, player2Data] = await Promise.all([
        this.fetchPlayerData(player1Nick),
        this.fetchPlayerData(player2Nick),
      ]);

      const START_TIMESTAMP = 1696114800000; // 01.10.2023
      const END_TIMESTAMP = Date.now();

      const [player1Stats, player2Stats] = await Promise.all([
        this.fetchPlayerStats(
          player1Data.player_id,
          START_TIMESTAMP,
          END_TIMESTAMP
        ),
        this.fetchPlayerStats(
          player2Data.player_id,
          START_TIMESTAMP,
          END_TIMESTAMP
        ),
      ]);

      const embed = this.createComparisonEmbed(
        player1Nick,
        player2Nick,
        player1Stats,
        player2Stats
      );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content:
          'Failed to compare players. Please ensure both nicknames are correct.',
      });
    }
  }

  private async fetchPlayerData(nickname: string): Promise<PlayerData> {
    const response = await axios.get<PlayerData>(
      'https://open.faceit.com/data/v4/players',
      {
        params: { nickname },
        headers: { Authorization: `Bearer ${config.FACEIT_API_KEY}` },
      }
    );
    return response.data;
  }

  private async fetchPlayerStats(
    playerId: string,
    startTimestamp: number,
    endTimestamp: number
  ): Promise<{ aggregatedStats: any; matchCount: number }> {
    const matches = await this.fetchAggregatedMatchStats(
      playerId,
      startTimestamp,
      endTimestamp
    );
    const stats = this.aggregateCounts(matches);
    return { aggregatedStats: stats, matchCount: matches.length };
  }

  private async fetchAggregatedMatchStats(
    playerId: string,
    startTimestamp: number,
    endTimestamp: number
  ): Promise<MatchStats[]> {
    const url = `https://open.faceit.com/data/v4/players/${playerId}/games/cs2/stats`;
    const response = await axios.get<{ items: MatchStats[] }>(url, {
      params: {
        from: startTimestamp,
        to: endTimestamp,
      },
      headers: { Authorization: `Bearer ${config.FACEIT_API_KEY}` },
    });
    return response.data.items;
  }

  private aggregateCounts(matchStats: MatchStats[]): { [key: string]: number } {
    const stats = matchStats.reduce(
      (acc: { [key: string]: number }, match: MatchStats) => {
        if (!match.stats) return acc;

        ['Kills', 'Deaths', 'Assists', 'Headshots'].forEach((key) => {
          const value = match.stats?.[key];
          if (value) {
            acc[key] = (acc[key] || 0) + Number(value);
          }
        });
        return acc;
      },
      {}
    );

    if (stats.Deaths && stats.Deaths > 0) {
      stats['K/D Ratio'] = stats.Kills / stats.Deaths;
    }

    const totalMatches = matchStats.length;
    const wins = matchStats.filter(
      (match) => match.stats?.['Result'] === '1'
    ).length;
    stats['Win Rate'] = (wins / totalMatches) * 100;

    return stats;
  }

  private createComparisonEmbed(
    player1Nick: string,
    player2Nick: string,
    player1Stats: { aggregatedStats: any; matchCount: number },
    player2Stats: { aggregatedStats: any; matchCount: number }
  ): EmbedBuilder {
    const p1Score = this.calculateOverallScore(player1Stats.aggregatedStats);
    const p2Score = this.calculateOverallScore(player2Stats.aggregatedStats);

    const embed = new EmbedBuilder()
      .setTitle(`📊 Stats Comparison`)
      .setDescription(
        `Comparing stats between **${player1Nick}** and **${player2Nick}**\n` +
          `Total Matches: ${player1Nick}: ${player1Stats.matchCount} | ${player2Nick}: ${player2Stats.matchCount}`
      )
      .setColor(p1Score > p2Score ? '#00ff00' : '#ff0000')
      .setTimestamp();

    const stats = [
      {
        name: 'K/D Ratio',
        key: 'K/D Ratio',
        format: (val: number) => val.toFixed(2),
        higherBetter: true,
      },
      {
        name: 'Win Rate',
        key: 'Win Rate',
        format: (val: number) => val.toFixed(2) + '%',
        higherBetter: true,
      },
      {
        name: 'Kills/Match',
        key: 'Kills',
        format: (val: number) => (val / player1Stats.matchCount).toFixed(1),
        higherBetter: true,
      },
      {
        name: 'Deaths/Match',
        key: 'Deaths',
        format: (val: number) => (val / player1Stats.matchCount).toFixed(1),
        higherBetter: false,
      },
      {
        name: 'Assists/Match',
        key: 'Assists',
        format: (val: number) => (val / player1Stats.matchCount).toFixed(1),
        higherBetter: true,
      },
      {
        name: 'Headshots/Match',
        key: 'Headshots',
        format: (val: number) => (val / player1Stats.matchCount).toFixed(1),
        higherBetter: true,
      },
    ];

    stats.forEach(({ name, key, format, higherBetter }) => {
      const val1 =
        key === 'matchCount'
          ? player1Stats.matchCount
          : player1Stats.aggregatedStats[key];
      const val2 =
        key === 'matchCount'
          ? player2Stats.matchCount
          : player2Stats.aggregatedStats[key];

      const formattedVal1 = format ? format(val1) : val1?.toString() || 'N/A';
      const formattedVal2 = format ? format(val2) : val2?.toString() || 'N/A';

      const comparison = this.compareValues(val1, val2, higherBetter);

      embed.addFields({
        name: `${name}`,
        value: `${comparison.p1Icon} ${player1Nick}: **${formattedVal1}**\n${comparison.p2Icon} ${player2Nick}: **${formattedVal2}**`,
        inline: true,
      });
    });

    embed.setFooter({
      text: `${p1Score > p2Score ? player1Nick : player2Nick} has better overall stats • Data from Faceit API`,
    });

    return embed;
  }

  private compareValues(
    val1: number,
    val2: number,
    higherBetter: boolean
  ): { p1Icon: string; p2Icon: string } {
    if (val1 === val2) return { p1Icon: '⬜', p2Icon: '⬜' };
    if (higherBetter) {
      return {
        p1Icon: val1 > val2 ? '🟩' : '🟥',
        p2Icon: val2 > val1 ? '🟩' : '🟥',
      };
    }
    return {
      p1Icon: val1 < val2 ? '🟩' : '🟥',
      p2Icon: val2 < val1 ? '🟩' : '🟥',
    };
  }

  private calculateOverallScore(stats: any): number {
    return (
      (stats['K/D Ratio'] || 0) * 400 +
      (stats['Win Rate'] || 0) * 0.4 +
      (stats['Headshots'] || 0) * 0.1
    );
  }
}
