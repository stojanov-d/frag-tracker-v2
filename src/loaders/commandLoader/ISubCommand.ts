import { ChatInputCommandInteraction } from 'discord.js';
import CustomClient from '../../client/CustomClient';

export default interface ISubCommand {
  client: CustomClient;
  name: string;

  Execute(interaction: ChatInputCommandInteraction): void;
}
