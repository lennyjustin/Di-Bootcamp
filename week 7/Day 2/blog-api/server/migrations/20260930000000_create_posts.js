exports.up = async function up(knex) {
  await knex.schema.createTable('posts', (table) => {
    table.increments('id').primary();
    table.string('title', 200).notNullable();
    table.text('content').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('posts');
};
