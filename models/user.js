import database from "infra/database.js";
import { ValidationError, NotFoundError } from "infra/errors.js";
import password from "models/password.js";

async function create(userInputValues) {
  await validadeUniqueUsername(userInputValues.username);
  await validadeUniqueEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);

  return newUser;

  async function runInsertQuery(userInputValues) {
    const { username, email, password } = userInputValues;

    const results = await database.query({
      text: `
        INSERT INTO
          users (username,email, password) 
        VALUES 
          ($1, $2, $3)
        RETURNING
          *
        ;`,
      values: [username, email, password],
    });

    return results.rows[0];
  }
}

async function update(username, userInputValues) {
  let currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validadeUniqueUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validadeUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = { ...currentUser, ...userInputValues };

  const updatedUser = await runUpdateQuery(userWithNewValues);

  return updatedUser;

  async function runUpdateQuery(userWithNewValues) {
    const { id, username, email, password } = userWithNewValues;

    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          username = $1,
          email = $2,
          password = $3,
          updated_at = timezone('utc', now())
        WHERE
          id = $4
        RETURNING
          *
        ;`,
      values: [username, email, password, id],
    });

    return results.rows[0];
  }
}

async function validadeUniqueUsername(username) {
  const results = await database.query({
    text: `
        SELECT 
          username 
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        ;`,
    values: [username],
  });
  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar esta operação.",
    });
  }
}

async function validadeUniqueEmail(email) {
  const results = await database.query({
    text: `
        SELECT 
          email 
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        ;`,
    values: [email],
  });
  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar esta operação.",
    });
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
      SELECT 
        *
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      LIMIT 
        1
      ;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O usuário informado não foi encontrado.",
        action: "Verifique se o username informado está correto.",
      });
    }

    return results.rows[0];
  }
}

async function findOneByEmail(email) {
  const userFound = await runSelectQuery(email);

  return userFound;

  async function runSelectQuery(email) {
    const results = await database.query({
      text: `
      SELECT 
        *
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      LIMIT 
        1
      ;`,
      values: [email],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O usuário informado não foi encontrado.",
        action: "Verifique se o email informado está correto.",
      });
    }

    return results.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
  findOneByEmail,
  update,
};

export default user;
