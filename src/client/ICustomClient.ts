import { Collection } from 'discord.js';
import Command from '../loaders/commandLoader/Command';
import SubCommand from '../loaders/commandLoader/SubCommand';
import CommandLoader from '../loaders/commandLoader/CommandLoader';

export default interface CustomClient {
  commandLoader: CommandLoader;
  commands: Collection<string, Command>;
  subCommands: Collection<string, SubCommand>;
  cooldowns: Collection<string, Collection<string, number>>;

  Init(): void;
  LoadHandlers(): void;
}
