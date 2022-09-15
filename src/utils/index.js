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
    performer,
  }) => ({
    id,
    title,
    performer,
  }),

  songById: ({
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
}

module.exports = { mapDBToModel };