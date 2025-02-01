import { Client, Collection, GatewayIntentBits } from 'discord.js';
import ICustomClient from './ICustomClient';
import config from '../config';
import Command from '../loaders/commandLoader/Command';
import SubCommand from '../loaders/commandLoader/SubCommand';
import CommandLoader from '../loaders/commandLoader/CommandLoader';
import EventLoader from '../loaders/eventLoader/EventLoader';

export default class CustomClient extends Client implements ICustomClient {
  commandLoader: CommandLoader;
  eventLoader: EventLoader;
  commands: Collection<string, Command>;
  subCommands: Collection<string, SubCommand>;
  cooldowns: Collection<string, Collection<string, number>>;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
      ],
    });
    this.commandLoader = new CommandLoader(this);
    this.eventLoader = new EventLoader(this);
    this.commands = new Collection();
    this.subCommands = new Collection();
    this.cooldowns = new Collection();
  }

  Init(): void {
    this.LoadHandlers();
    this.login(config.DISCORD_BOT_TOKEN);
  }

  LoadHandlers(): void {
    this.commandLoader.LoadCommands();
    this.eventLoader.LoadEvents();
  }
}
