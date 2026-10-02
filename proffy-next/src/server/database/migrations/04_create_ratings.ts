import type { Knex } from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('ratings', table => {
        table.increments('id').primary();

        table.integer('user_id')
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');

        table.integer('stars').notNullable();

        table.text('comment').nullable();

        table.time('created_at')
            .defaultTo('CURRENT_TIMESTAMP')
            .notNullable();
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('ratings');
}
