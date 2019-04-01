const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./data/dbConfig.js');

const server = express();
server.use(cors());
server.use(express.json());

server.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 4);
  db.insert({
    username: username,
    password: hash
  })
  .then(success => {
    res.status(200).json({ message: "Register successful"});
  })
  .catch(error => {
    res.status(400).json({ message: "Register unsuccessful"});
  })
})