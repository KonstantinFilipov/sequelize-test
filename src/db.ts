import { Sequelize } from "sequelize";

export default new Sequelize("postgres://postgres@postgres:5432/test", {
  password: "postgres",
});
