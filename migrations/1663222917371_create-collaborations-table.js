/* eslint-disable camelcase */
 
exports.up = (pgm) => {
  // membuat table collaborations
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
        type: 'VARCHAR(50)',
        notNull: true,
        references: '"playlists"',
        onDelete: 'cascade',
    },
    user_id: {
        type: 'VARCHAR(50)',
        notNull: true,
        references: '"users"',
        onDelete: 'cascade',
    },
  });
 
  pgm.addConstraint('collaborations', 'unique_playlist_id_and_user_id', 'UNIQUE(playlist_id, user_id)');
};
 
exports.down = (pgm) => {
  // menghapus tabel collaborations
  pgm.dropTable('collaborations');
};