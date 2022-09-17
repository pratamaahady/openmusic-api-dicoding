const mapDBToModel = {
  albums: ({
    id,
    name,
    year,
    songs,
    cover,
  }) => ({
    id,
    name,
    year,
    songs,
    coverUrl: cover,
  }),

  songs: ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) => ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }),

  playlists: ({
    id,
    name,
    username,
    songs,
  }) => ({
    id,
    name,
    username,
    songs,
  }),

  playlistActivities: ({
    playlistId,
    activities,
  }) => ({
    playlistId,
    activities,
  }),
};

module.exports = { mapDBToModel };
