import { config as _config } from 'dotenv';

import fastify from 'fastify';
import postgres from '@fastify/postgres';

_config();

// # 2. Observability
const app = fastify({
  logger: true //process.env.NODE_ENV !== "test" - Can be included later
});

app.register(postgres, {
  connectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
});

app.get('/health', async () => {
  return { message: `Server is healthy` };
});

// 1. Retrieve all profiles
app.get('/profiles', async (request, response) => {
  try {
    const result = await app.pg.query(
      `SELECT pid, firstName, lastName, TO_CHAR(dateOfBirth, 'YYYY-MM-DD') AS dateOfBirth FROM userprofiles`
    );
    response.send(result.rows);
  } catch (err) {
    request.log.error(err);
    response
      .status(500)
      .send({ error: 'Failed to retrieve profiles', details: err.message });
  }
});

// 2. Retrieve a single profile
app.get('/profileById/:pid', async (request, response) => {
  try {
    const pid = request.params.pid;

    // Parameterized to prevent SQL injection
    const findQuery =
      `SELECT pid, firstName, lastName, TO_CHAR(dateOfBirth, 'YYYY-MM-DD') AS dateOfBirth FROM userprofiles WHERE pid = $1`;
    const queryParam = [pid];

    const result = await app.pg.query(findQuery, queryParam);

    if (!result.rows.length) {
      response.status(404).send({ message: `Profile ${pid} not found` });
    } else {
      response.send(result.rows[0]);
    }
  } catch (err) {
    request.log.error(err);
    response.status(500).send({
      error: 'Failed to retrieve profile due to a server error',
      details: err.message,
    });
  }
});

// 2. Retrieve a single profile
app.get('/profileByLastName/:lastName', async (request, response) => {
  try {
    const lastName = request.params.lastName;

    // Parameterized to prevent SQL injection
    const findQuery =
      `SELECT pid, firstName, lastName, TO_CHAR(dateOfBirth, 'YYYY-MM-DD') AS dateOfBirth FROM userprofiles WHERE lastName = $1`;
    const queryParam = [lastName];

    const result = await app.pg.query(findQuery, queryParam);

    if (!result.rows.length) {
      response.status(404).send({ message: `Profile ${lastName} not found` });
    } else {
      response.send(result.rows[0]);
    }
  } catch (err) {
    request.log.error(err);
    response.status(500).send({
      error: 'Failed to retrieve profile due to a server error',
      details: err.message,
    });
  }
});

// 2. Retrieve a single profile
app.get('/profileByDob/:dob', async (request, response) => {
  try {
    const dob = request.params.dob;

    // Parameterized to prevent SQL injection
    const findQuery =
      `SELECT pid, firstName, lastName, TO_CHAR(dateOfBirth, 'YYYY-MM-DD') AS dateOfBirth FROM userprofiles WHERE dateOfBirth = $1`;
    const queryParam = [dob];

    const result = await app.pg.query(findQuery, queryParam);

    if (!result.rows.length) {
      response.status(404).send({ message: `Profile with ${dob} not found` });
    } else {
      response.send(result.rows[0]);
    }
  } catch (err) {
    request.log.error(err);
    response.status(500).send({
      error: 'Failed to retrieve profile due to a server error',
      details: err.message,
    });
  }
});

// 3. Create a new profile
app.post(
  '/profile',
  {
    // Validation
    schema: {
      body: {
        type: 'object',
        required: ['firstName', 'lastName', 'dateOfBirth'],
        properties: {
          firstName: { type: 'string', minLength: 2 },
          lastName: { type: 'string', minLength: 2 },
          dateOfBirth: { type: 'string', format: 'date' },
        },
        additionalProperties: false,
      },
    },
  },
  async (request, response) => {
    try {
      const {firstName, lastName, dateOfBirth } = request.body;

      // Generate pid - Primary Key
      const pid = firstName.charAt(0) + lastName.substring(0, 4) + dateOfBirth.replaceAll('-', '');

      const addUserQuery =
        'INSERT INTO userprofiles (pid, firstName, lastName, dateOfBirth) VALUES ($1, $2, $3, $4)';
      const queryParams = [pid, firstName, lastName, dateOfBirth];

      const result = await app.pg.query(addUserQuery, queryParams);

      response.status(201).send(result.rows[0]);
    } catch (err) {
      request.log.error(err);
      if (err.code === '23505') {
        return response.status(409).send({ // Conflict HTTP code
          error: 'A profile with same name and date of birth already exists.',
        });
      }
      response.status(500).send({
        error: 'Failed to create user due to a server error',
        details: err.message,
      });
    }
  }
);

// 4. Update an existing profile
app.patch(
  '/profile/:pid',
  {
    // Validation - fields are optional
    schema: {
      body: {
        type: 'object',
        properties: {
          firstName: { type: 'string', minLength: 2 },
          lastName: { type: 'string', minLength: 2 },
          dateOfBirth: { type: 'string', format: 'date' },
        },
        minProperties: 1,
        additionalProperties: false,
      },
    },
  },
  async (request, response) => {
    try {
      const pid = request.params.pid;

      const profileExists = await app.pg.query(
        `SELECT firstName, lastName, TO_CHAR(dateOfBirth, 'YYYY-MM-DD') AS dateOfBirth FROM userprofiles WHERE pid = $1`,
        [pid]
      );
      if (!profileExists.rowCount) {
        return response
          .status(400)
          .send({ message: `Profile ${pid} not found` });
      }
      const { firstname, lastname, dateofbirth } = profileExists.rows[0];

      // Pid should change based on  while updating
      const new_pid = firstname.charAt(0) + lastname.substring(0, 4) + dateofbirth.replaceAll('-', '');         
      const fieldsToUpdate = {'pid': new_pid, ...request.body};
      const fieldKeys = Object.keys(fieldsToUpdate);

      const queryClauses = [];
      const queryParams = [];
      let paramIndex = 1;

      for (const key of fieldKeys) {
        queryClauses.push(`${key} = $${paramIndex}`);
        queryParams.push(fieldsToUpdate[key]);
        paramIndex++;
      }

      queryParams.push(pid); // last param for WHERE
      const updateQuery = `
            UPDATE userprofiles
            SET ${queryClauses.join(', ')}
            WHERE pid = $${paramIndex}
            RETURNING pid, firstName, lastName, dateOfBirth
          `;
      const result = await app.pg.query(updateQuery, queryParams);

      response.status(204).send(result.rows[0]);
    } catch (err) {
      request.log.error(err);
      if (err.code === '23505') {
        return response.status(409).send({ // Conflict HTTP code
          error: 'A profile with same name and date of birth already exists.',
        });
      }
      response.status(500).send({
        error: 'Failed to update profile due to a server error',
        details: err.message,
      });
    }
  }
);

// For testing
export default app;

if (process.env.NODE_ENV !== 'test') {
  const start = async () => {
    try {
      await app.listen({ port: process.env.PORT, host: '0.0.0.0' });
      app.log.info(`Server listening on http://localhost:${process.env.PORT}`);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  };
  start();
}
