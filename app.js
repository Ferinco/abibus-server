require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const connectDb = require('./db/connect');
const morgan = require('morgan');
const config = require('./config');

const { MONGODB_URI } = require('./config');

const app = express();
const port = config.PORT || 3000;

// Middleware
app.use(express.json());
app.use(morgan('dev'));
const apiVersion = 'v1';  // API version

// Routes
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/rooms`, roomRoutes);

app.get('/', (req, res) => {
  res.send(`Welcome to Abibus Server ${apiVersion}!`);
});

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

const start = async () => {
  console.log(config.MONGODB_URI);
  try {
    if (process.env.NODE_ENV === "development") {
      await connectDb(config.MONGODB_URI);
    }
    if (process.env.NODE_ENV === "test") {
      const mongoUri = config.MONGODB_URI_TEST;
      if (mongoUri) {
        await connectDb(mongoUri);
      } else {
        throw new Error("MONGODB_URI_TEST is not defined");
      }
    }
    if(process.env.NODE_ENV === "production"){
      await connectDb(config.MONGODB_URI);
    }
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
