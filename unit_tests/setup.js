import fastify from "../app";
import { Client } from "pg";

let testDbClient;

beforeAll(async () => {
  testDbClient = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });
  await testDbClient.connect();

  await testDbClient.query(`
    CREATE TABLE IF NOT EXISTS userprofiles (
      pid VARCHAR(50) PRIMARY KEY,
      firstName VARCHAR(50) NOT NULL,
      lastName VARCHAR(50) NOT NULL,
      dateOfBirth TIMESTAMP WITHOUT TIME ZONE NOT NULL
    );
  `);

  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
  await testDbClient.end();
});

beforeEach(async () => {
  await testDbClient.query("TRUNCATE userprofiles");
  // await testDbClient.query('BEGIN');
  await testDbClient.query(`
    INSERT INTO userprofiles (pid, firstName, lastName, dateOfBirth) VALUES
    ('EJohn19800502', 'Emma', 'John', '1980-05-02'),
    ('LDona20000609', 'Lekha', 'Donald', '2000-06-09')
  `);
});

// afterEach(async () => {
//   await testDbClient.query('ROLLBACK');
// });
