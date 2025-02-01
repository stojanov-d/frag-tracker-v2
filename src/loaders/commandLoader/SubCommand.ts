import { ChatInputCommandInteraction } from 'discord.js';
import ISubCommand from './ISubCommand';
import CustomClient from '../../client/CustomClient';
import ISubCommandOptions from './ISubCommandOptions';

export default class SubCommand implements ISubCommand {
  client: CustomClient;
  name: string;

  constructor(client: CustomClient, options: ISubCommandOptions) {
    this.client = client;
    this.name = options.name;
  }

  Execute(interaction: ChatInputCommandInteraction): void {}
}
