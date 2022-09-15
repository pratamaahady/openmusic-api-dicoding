const mapDBToModel = {
  albums: ({ 
    id,
    name,
    year,
    songs, 
  }) => ({
    id,
    name,
    year,
    songs
  }),

  songs: ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId
  }) => ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId
  }),

  playlists: ({
    id,
    name,
    username,
    songs
  }) => ({
    id,
    name,
    username,
    songs
  }),

  playlistActivities: ({
    playlistId,
    activities
  }) => ({
    playlistId,
    activities
  }),
}

module.exports = { mapDBToModel };