import {
  ChatInputCommandInteraction,
  Interaction,
  Collection,
  Events,
} from 'discord.js';
import CustomClient from '../client/CustomClient';
import Command from '../loaders/commandLoader/Command';
import Event from '../loaders/eventLoader/Event';

export default class InteractionCreate extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.InteractionCreate,
      description: 'Interaction create event.',
      once: false,
    });
  }

  async Execute(interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
      await this.handleCommand(interaction);
    }
  }

  private async handleCommand(interaction: ChatInputCommandInteraction) {
    const command: Command = this.client.commands.get(interaction.commandName)!;

    if (!command) {
      await interaction.reply({
        content: 'This command does not exist!',
        ephemeral: true,
      });
      this.client.commands.delete(interaction.commandName);
      return;
    }

    const { cooldowns } = this.client;
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmout = (command.cooldown || 3) * 1000;

    if (
      timestamps?.has(interaction.user.id) &&
      now < (timestamps.get(interaction.user.id) || 0) + cooldownAmout
    ) {
      return interaction.reply({
        content: `Please wait another ${(
          ((timestamps.get(interaction.user.id) || 0) + cooldownAmout - now) /
          1000
        ).toFixed(1)} seconds to use this command again.`,
        ephemeral: true,
      });
    }
    timestamps?.set(interaction.user.id, now);
    setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmout);

    try {
      const subCommandGroup = interaction.options.getSubcommandGroup(false);
      const subCommand = `${interaction.commandName}${
        subCommandGroup ? `.${subCommandGroup}` : ''
      }.${interaction.options.getSubcommand(false) || ''}`;
      return (
        this.client.subCommands.get(subCommand)?.Execute(interaction) ||
        command.Execute(interaction)
      );
    } catch (err) {
      console.log(err);
    }
  }
}
