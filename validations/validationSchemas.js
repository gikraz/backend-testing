const Joi = require('joi');

const rejisoriSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  dob: Joi.date()
});

const movieSchema = Joi.object({
  title: Joi.string().min(1).required(),
  releaseYear: Joi.number().integer().min(1888).max(new Date().getFullYear()),
  rejisoriId: Joi.string().hex().length(24).required()
});

module.exports = {
  rejisoriSchema,
  movieSchema
};
