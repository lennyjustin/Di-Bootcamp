exports.up = async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email', 254).nullable().unique();
    table.string('username', 50).notNullable().unique();
    table.string('first_name', 100).notNullable().defaultTo('');
    table.string('last_name', 100).notNullable().defaultTo('');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('hashpwd', (table) => {
    table.increments('id').primary();
    table.string('username', 50).notNullable().unique();
    table.string('password', 60).notNullable();
    table
      .foreign('username')
      .references('username')
      .inTable('users')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.timestamps(true, true);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('hashpwd');
  await knex.schema.dropTableIfExists('users');
};
