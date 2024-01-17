import db from "./db";
import { DataTypes, Model, Sequelize, Utils } from "sequelize";

export class Patient extends Model {
  declare id: string;

  declare document: any;
}

Patient.init(
  {
    id: {
      type: new DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true,
    },
    // Model attributes are defined here
    document: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize: db, // We need to pass the connection instance
    modelName: "Patient", // We need to choose the model name
    indexes: [],
  }
);

export class Group extends Model {
  declare id: string;

  declare document: any;
}

Group.init(
  {
    id: {
      type: new DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true,
    },
    // Model attributes are defined here
    document: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize: db, // We need to pass the connection instance
    modelName: "Group", // We need to choose the model name
    indexes: [],
  }
);

Group.belongsToMany(Patient, { through: "PatientGroups" });
Patient.belongsToMany(Group, { through: "PatientGroups" });
