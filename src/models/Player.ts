import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db';

export class Player extends Model {
  declare faceitId: string;
  declare discordId: string;
  declare nickname: string;
  declare avatarUrl?: string;
}

Player.init(
  {
    faceitId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    discordId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Player',
  }
);
