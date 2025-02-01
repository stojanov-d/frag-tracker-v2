import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import CustomClient from '../client/CustomClient';
import Command from '../loaders/commandLoader/Command';

export default class Ping extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: 'ping',
      description: 'Pong!',
      category: 'Test command',
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      options: [],
      dm_permissions: false,
      cooldown: 0,
    });
  }

  Execute(interation: ChatInputCommandInteraction): void {
    interation.reply({ content: 'Pong!' });
  }
}
