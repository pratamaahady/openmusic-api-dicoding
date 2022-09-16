/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
    },
    year: {
      type: 'integer',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('albums');
};
