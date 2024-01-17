import db from "./db";
import { DataTypes, Model, Sequelize, Utils } from "sequelize";

// class SOMETYPE extends DataTypes.ABSTRACT {
//   // Mandatory: complete definition of the new type in the database
//   toSql() {
//     return "INTEGER(11) UNSIGNED ZEROFILL";
//   }

//   // Optional: validator function
//   validate(value, options) {
//     return typeof value === "number" && !Number.isNaN(value);
//   }

//   // Optional: sanitizer
//   _sanitize(value) {
//     // Force all numbers to be positive
//     return value < 0 ? 0 : Math.round(value);
//   }

//   // Optional: value stringifier before sending to database
//   _stringify(value) {
//     return value.toString();
//   }

//   // Optional: parser for values received from the database
//   static parse(value) {
//     return Number.parseInt(value);
//   }
// }

// // Mandatory: set the type key
// SOMETYPE.prototype.key = SOMETYPE.key = "SOMETYPE";

// // Mandatory: add the new type to DataTypes. Optionally wrap it on `Utils.classToInvokable` to
// // be able to use this datatype directly without having to call `new` on it.
// DataTypes.SOMETYPE = Utils.classToInvokable(SOMETYPE);

class Patient extends Model {
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
    indexes: [
      {
        name: "people_data_id",
        fields: [Sequelize.literal("((\"document\"#>>'{id}'))")],
      },
      // {
      //   name: "people_data_name",
      //   using: "gin",
      //   operator: "jsonb_path_ops",
      //   fields: [Sequelize.literal("(\"document\" -> 'name' -> 0 ->> 'text')")],
      // },
      // {
      //   fields: [
      //     Sequelize.literal(
      //       "(\"document\" -> 'name' -> 0 ->> 'text' || ' ' || \"document\" -> 'identifier' -> 0 ->> 'value') gin_trgm_ops"
      //     ),
      //   ],
      //   using: "gin",
      //   operator: "gin_trgm_ops",
      // },
      {
        fields: [
          Sequelize.literal(
            "(\"document\" -> 'name' -> 0 ->> 'text') gin_trgm_ops"
          ),
        ],
        using: "gin",
        operator: "gin_trgm_ops",
      },
      // {
      //   fields: ["document"],
      //   using: "gin",
      //   operator: "jsonb_path_ops",
      // },
      // {
      //   name: "MyIndexName",
      //   fields: [Sequelize.literal("((\"document\"#>>'{name}'))")],
      // },
    ],
  }
);

export default Patient;
