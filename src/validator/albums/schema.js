const Joi = require('joi');

const currentYear = new Date().getFullYear();

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().max(100).required(),
  year: Joi.number().integer().min(1900).max(currentYear)
    .required(),
});

module.exports = { AlbumPayloadSchema };
