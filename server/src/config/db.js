import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'teamflow',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connecté');
    await sequelize.sync({ alter: true });
    console.log('Tables synchronisées');
  } catch (error) {
    console.error(`Erreur de connexion PostgreSQL: ${error.message}`);
    process.exit(1);
  }
};

export default sequelize;
