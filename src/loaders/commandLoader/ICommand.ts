import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import CustomClient from '../../client/CustomClient';
import { CommandCategory } from '../../enums/CommandCategory';

export default interface ICommand {
  client: CustomClient;
  name: string;
  description: string;
  category: CommandCategory;
  options: object;
  default_member_permissions: bigint;
  dm_permissions: boolean;
  cooldown: number;

  Execute(interation: ChatInputCommandInteraction): void;
  AutoComplete(interation: AutocompleteInteraction): void;
}
