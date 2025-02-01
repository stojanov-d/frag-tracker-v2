export default interface ICommandOptions {
  name: string;
  description: string;
  category: string; // TODO: Make this an enum
  options: object;
  default_member_permissions: bigint;
  dm_permissions: boolean;
  cooldown: number;
}
