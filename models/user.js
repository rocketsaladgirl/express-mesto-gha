const mongoose = require('mongoose');
const validator = require('validator');

// eslint-disable-next-line function-paren-newline
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
    required: [true, 'Поле "name" должно быть заполнено'],
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
    required: [true, 'Поле "about" должно быть заполнено'],
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    validate: {
      validator: (v) => validator.isURL(v),
      message: 'Некорректный URL',
    },
    required: true,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    unique: true,
    validate: {
      validator: (v) => validator.isURL(v),
      message: 'Некорректный email',
    },
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
},
// eslint-disable-next-line function-paren-newline
{ versionKey: false });

module.exports = mongoose.model('user', userSchema);
