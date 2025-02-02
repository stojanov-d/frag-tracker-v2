import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from 'discord.js';
import SubCommand from '../loaders/commandLoader/SubCommand';
import CustomClient from '../client/CustomClient';

const verificationEmbed = new EmbedBuilder()
  .setColor('Green')
  .setTitle('Click here to become verified!')
  .setDescription('Verified users get access to ....')
  .setAuthor({
    name: 'Faceit Verification',
    iconURL:
      'https://seeklogo.com/images/F/faceit-logo-B519B0AC75-seeklogo.com.png',
  });

export default class VerifyButtonBuilder extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: 'verify-button',
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const verifyButton = new ButtonBuilder()
        .setCustomId('verify-button')
        .setLabel('Verify')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        verifyButton
      );

      const channel = await this.client.channels.fetch(interaction.channelId);

      if (channel?.isTextBased()) {
        const textChannel = channel as TextChannel;
        await textChannel.send({
          embeds: [verificationEmbed],
          components: [row],
        });

        await interaction.followUp({
          content: 'Verification button has been created successfully!',
          ephemeral: true,
        });
      } else {
        throw new Error('The target channel is not text-based.');
      }
    } catch (error) {
      console.error('Error creating verification button:', error);

      let errorMessage =
        'An unexpected error in creating verification button occurred.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }
      await interaction.followUp({
        content: `Failed to create the verification button. Reason: ${errorMessage}`,
        ephemeral: true,
      });
    }
  }
}
