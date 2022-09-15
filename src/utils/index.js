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
}

module.exports = { mapDBToModel };