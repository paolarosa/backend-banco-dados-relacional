import { Client } from "pg";
import 'dotenv/config'

const client: Client = new Client({
  user    : process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host    : process.env.HOST,
  database: process.env.DB,
  port    : parseInt(process.env.DB_PORT!),
});

export default client