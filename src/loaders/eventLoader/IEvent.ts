import { Events } from 'discord.js';
import CustomClient from '../../client/CustomClient';

export default interface IEvent {
  client: CustomClient;
  name: Events;
  desciption: string;
  once: boolean;
}
