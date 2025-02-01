import { Collection, Events, REST, Routes } from 'discord.js';
import CustomClient from '../client/CustomClient';
import Event from '../loaders/eventLoader/Event';
import Command from '../loaders/commandLoader/Command';
import config from '../config';

export default class Ready extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.ClientReady,
      description: 'Ready Event',
      once: true,
    });
  }

  async Execute() {
    console.log(`${this.client.user?.tag} is online!`);

    const commands: object[] = this.GetJson(this.client.commands);

    const rest = new REST().setToken(config.DISCORD_BOT_TOKEN!);

    const setCommands: { id: string; name: string }[] = (await rest.put(
      Routes.applicationGuildCommands(
        config.DISCORD_CLIENT_ID!,
        config.DISCORD_GUILD_ID!
      ),
      {
        body: commands,
      }
    )) as { id: string; name: string }[];

    console.log(`Successfully registered ${setCommands.length} commands!`);
  }

  private GetJson(commands: Collection<string, Command>) {
    const data: object[] = [];

    commands.forEach((command) => {
      data.push({
        name: command.name,
        description: command.description,
        options: command.options,
        default_member_permissions:
          command.default_member_permissions.toString(),
        dm_permission: command.dm_permissions,
      });
    });

    return data;
  }
}
