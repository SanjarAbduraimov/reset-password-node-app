const express = require('express');
const mogoose = require('mongoose');
const path = require('path');
const app = express();
const mainRouter = require('./routes');
const isLoggedIn = require('./utils/index').authHandler
const envVeribles = process.env.NODE__ENV === 'development' ? './.env.local' : './.env';
require('dotenv').config({ path: path.resolve(__dirname, envVeribles) })
const PORT = process.env.PORT || 8000;

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.use(isLoggedIn);
app.use('/api', mainRouter);


mogoose.connect(process.env.DB_URL).then(() => {
  console.log(`Database connected successfully`);
}).catch(() => {
  console.log(`Database failed to connect`);
})

app.listen(PORT, () => {
  console.log(`App is running on ${PORT} port`)
})