import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import CustomClient from '../client/CustomClient';
import Command from '../loaders/commandLoader/Command';
import { CommandCategory } from '../enums/CommandCategory';

export default class Ping extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: 'ping',
      description: 'Pong!',
      category: CommandCategory.INFO,
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      options: [],
      dm_permissions: false,
      cooldown: 0,
    });
  }

  Execute(interaction: ChatInputCommandInteraction): void {
    interaction.reply({ content: 'Pong!' });
  }
}
