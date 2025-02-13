import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db';
import { Player } from './Player';

export class Match extends Model {
  declare matchId: string;
  declare playerId: string;
  declare kills: number;
  declare deaths: number;
  declare assists: number;
  declare headshots: number;
  declare kdRatio: number;
  declare map: string;
  declare result: string;
}

Match.init(
  {
    matchId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    playerId: {
      type: DataTypes.STRING,
      references: {
        model: Player,
        key: 'faceitId',
      },
    },
    kills: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deaths: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    assists: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    headshots: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kdRatio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    map: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    result: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Match',
  }
);

Player.hasMany(Match, { foreignKey: 'playerId' });
Match.belongsTo(Player, { foreignKey: 'playerId' });
