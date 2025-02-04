import { Events } from 'discord.js';
import IEvent from './IEvent';
import CustomClient from '../../client/CustomClient';
import IEventOptions from './IEventOptions';

export default class Event implements IEvent {
  client: CustomClient;
  name: Events;
  description: string;
  once: boolean;

  constructor(client: CustomClient, options: IEventOptions) {
    this.client = client;
    this.name = options.name;
    this.description = options.description;
    this.once = options.once;
  }

  Execute(...args: unknown[]): void {}
}
