import {
  ChatInputCommandInteraction,
  AutocompleteInteraction,
} from 'discord.js';
import ICommand from './ICommand';
import CustomClient from '../../client/CustomClient';
import ICommandOptions from './ICommandOptions';
import { CommandCategory } from '../../enums/CommandCategory';

export default class Command implements ICommand {
  client: CustomClient;
  name: string;
  description: string;
  category: CommandCategory;
  options: object;
  default_member_permissions: bigint;
  dm_permissions: boolean;
  cooldown: number;

  constructor(client: CustomClient, options: ICommandOptions) {
    this.client = client;
    this.name = options.name;
    this.description = options.description;
    this.category = options.category;
    this.options = options.options;
    this.default_member_permissions = options.default_member_permissions;
    this.dm_permissions = options.dm_permissions;
    this.cooldown = options.cooldown;
  }

  Execute(interaction: ChatInputCommandInteraction): void {}
  AutoComplete(interaction: AutocompleteInteraction): void {}
}
