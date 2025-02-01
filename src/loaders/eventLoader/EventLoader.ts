import { glob } from 'glob';
import CustomClient from '../../client/CustomClient';
import path from 'path';
import Event from './Event';

export default class EventLoader {
  client: CustomClient;
  constructor(client: CustomClient) {
    this.client = client;
  }

  async LoadEvents() {
    const files = (await glob('dist/events/**/*.js')).map((filePath) =>
      path.resolve(filePath)
    );

    files.map(async (file: string) => {
      const event: Event = new (await import(file)).default(this.client);

      if (!event.name) {
        return (
          delete require.cache[require.resolve(file)] &&
          console.log(`${file.split('/').pop()} doesn't have a name.`)
        );
      }
      const execute = (...args: unknown[]) => event.Execute(...args);

      if (event.once) {
        this.client.once(event.name as string, execute);
      } else {
        this.client.on(event.name as string, execute);
      }

      return delete require.cache[require.resolve(file)];
    });
  }
}
