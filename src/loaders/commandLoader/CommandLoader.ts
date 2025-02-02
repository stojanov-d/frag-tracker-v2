import { glob } from 'glob';
import path from 'path';
import Command from './Command';
import SubCommand from './SubCommand';
import CustomClient from '../../client/CustomClient';

export default class CommandLoader {
  private client: CustomClient;

  constructor(client: CustomClient) {
    this.client = client;
  }

  async LoadCommands() {
    const files = (await glob('dist/commands/**/*.js')).map((filePath) =>
      path.resolve(filePath)
    );

    files.map(async (file: string) => {
      const command: Command | SubCommand = new (await import(file)).default(
        this.client
      );

      if (!command.name) {
        return (
          delete require.cache[require.resolve(file)] &&
          console.log(`${file.split('/').pop()} doesn't have a name.`)
        );
      }

      if (file.split('/').pop()?.split('.')[2]) {
        const parts = file.split('/').pop()?.split('.');
        const parentCommand = parts ? parts[0].toLowerCase() : '';
        const subCommand = command.name;
        return this.client.subCommands.set(
          `${parentCommand}.${subCommand}`,
          command
        );
      } else {
        this.client.commands.set(command.name, command as Command);
      }

      return delete require.cache[require.resolve(file)];
    });
  }
}
