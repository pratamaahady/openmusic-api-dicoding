const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService, songsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
    this._songsService = songsService;
  }
 
  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
 
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
 
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT 
        p.id, 
        p.name, 
        u.username 
      FROM playlists p
      JOIN users u ON u.id = p.owner
      WHERE 
        p.owner = $1 OR
        (
          EXISTS(
            SELECT * 
            FROM collaborations c
            WHERE 
              c.playlist_id = p.id AND
              c.user_id = $1 
          )
        )`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModel.playlists);
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT 
        p.id, 
        p.name, 
        u.username 
      FROM playlists p
      JOIN users u ON u.id = p.owner
      WHERE p.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
 
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows.map(mapDBToModel.playlists)[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlist-${nanoid(16)}`;

    await this.getPlaylistById(playlistId);
    await this._songsService.getSongById(songId);

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
 
    return result.rows[0].id;
  }

  async getPlaylistSongs(id) {
    const playlist = await this.getPlaylistById(id);
    playlist.songs = await this._songsService.getSongsByPlaylistId(id);

    return playlist;
  }

  async deletePlaylistSongBySongId(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id=$2 RETURNING id',
      values: [playlistId, songId],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rowCount) {
      throw new InvariantError('Gagal menghapus song di playlist.');
    }
  }

  async getPlaylistSongActivitiesById(id) {
    const query = {
      text: `SELECT 
        u.username,
        s.title,
        pa.action,
        pa.time
      FROM playlist_song_activities pa
      JOIN users u ON u.id = pa.user_id
      JOIN songs s ON s.id = pa.song_id
      WHERE pa.playlist_id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async addPlaylistSongActivity(playlistId, songId, userId, action) {
    const id = `playlist-song-activity-${nanoid(16)}`;
 
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, userId, action],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist Song Activity gagal ditambahkan');
    }
 
    return result.rows[0].id;    
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
 
    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try{
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if(error instanceof NotFoundError){
        throw error;
      }
      
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;