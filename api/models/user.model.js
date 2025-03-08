import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  history: {
    type: Array,
    required: false,
    default: [],
  },
  targets: {
    type: Array,
    default: [],
  },
});

export default model('users', userSchema);
