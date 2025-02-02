import { PermissionsBitField, ChatInputCommandInteraction } from 'discord.js';
import Command from '../loaders/commandLoader/Command';
import CustomClient from '../client/CustomClient';

export default class Create extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: 'create',
      description: 'Creates embeds',
      category: 'Admin',
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      options: [
        {
          type: 1,
          name: 'verify-button',
          description: 'Creates a verification button',
        },
      ],
      dm_permissions: false,
      cooldown: 0,
    });
  }

  Execute(interaction: ChatInputCommandInteraction): void {}
}
