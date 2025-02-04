import { CommandCategory } from '../../enums/CommandCategory';

export default interface ICommandOptions {
  name: string;
  description: string;
  category: CommandCategory;
  options: object;
  default_member_permissions: bigint;
  dm_permissions: boolean;
  cooldown: number;
}
