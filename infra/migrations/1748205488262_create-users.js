exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    // For reference, Github limits usernames to 39 characters.
    username: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },
    // 254 characters is the max length of an e-mail
    email: {
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },
    password: {
      type: "varchar(72)",
      notNull: true,
    },
    created_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
    updated_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
  });
};

exports.down = false;
