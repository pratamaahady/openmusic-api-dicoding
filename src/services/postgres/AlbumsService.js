const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(songsService, usersService, cacheService) {
    this._pool = new Pool();
    this._songsService = songsService;
    this._usersService = usersService;
    this._cacheService = cacheService;

    this._albumLikesCacheName = 'album_likes';
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows.map(mapDBToModel.albums);
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const songs = await this._songsService.getSongs({ albumId: id });
    const album = result.rows.map(mapDBToModel.albums)[0];
    album.songs = songs ?? [];

    return album;
  }

  async editAlbumById(id, { name, year, cover }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, cover = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [name, year, cover, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async getAlbumLikeById(id, userId) {
    let where = '';

    if (userId) {
      where += `AND ual.user_id = '${userId}'`;
    }

    const query = {
      text: `SELECT 
          a.id,
          CAST(count(ual.id) AS INT) as likes
        FROM albums a
        LEFT JOIN user_album_likes ual ON ual.album_id = a.id ${where}
        WHERE a.id = $1
        GROUP BY a.id`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return result.rows[0];
  }

  async getAlbumLikeByIdWithCache(id, userId) {
    try {
      const result = await this._cacheService.get(`${this._albumLikesCacheName}:${id}`);
      return {
        data: JSON.parse(result),
        cache: true,
      };
    } catch (error) {
      const album = await this.getAlbumLikeById(id, userId);

      await this._cacheService.set(`${this._albumLikesCacheName}:${id}`, JSON.stringify(album));

      return {
        data: album,
        cache: false,
      };
    }
  }

  async likeAlbum(albumId, userId) {
    await this.getAlbumById(albumId);
    await this._usersService.getUserById(userId);

    const id = `user-album-like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menyukai album');
    }

    await this._cacheService.delete(`${this._albumLikesCacheName}:${albumId}`);

    return result.rows[0].id;
  }

  async unlikeAlbum(albumId, userId) {
    await this.getAlbumById(albumId);
    await this._usersService.getUserById(userId);

    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal batal menyukai album');
    }

    await this._cacheService.delete(`${this._albumLikesCacheName}:${albumId}`);

    return result.rows[0].id;
  }
}

module.exports = AlbumsService;
