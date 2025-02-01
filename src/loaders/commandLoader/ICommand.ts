import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import CustomClient from '../../client/CustomClient';

export default interface ICommand {
  client: CustomClient;
  name: string;
  description: string;
  category: string; // TODO: Make this an enum
  options: object;
  default_member_permissions: bigint;
  dm_permissions: boolean;
  cooldown: number;

  Execute(interation: ChatInputCommandInteraction): void;
  AutoComplete(interation: AutocompleteInteraction): void;
}
