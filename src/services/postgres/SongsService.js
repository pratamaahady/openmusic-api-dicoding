const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }
 
  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = nanoid(16);
 
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [`song-${id}`, title, year, genre, performer, duration, albumId],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan');
    }
 
    return result.rows[0].id;
  }

  async getSongs({ title, performer, albumId }) {
    const query = {
      text: 'SELECT * FROM songs',
    };

    // Create an array to store any criteria
    var where = [];

    if (title) {
      where.push(`lower(title) like lower('%${title}%')`);
    }

    if (performer) {
      where.push(`lower(performer) like lower('%${performer}%')`);
    }

    if (albumId) {
      where.push(`"albumId"='${albumId}'`);
    }
    
    // If criteria were added, append to query text
    if (where.length > 0) {
      query.text += ' where ' + where.join(' and ');
    }

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModel.songs);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }
 
    return result.rows.map(mapDBToModel.songById)[0];
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;