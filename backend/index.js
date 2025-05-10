const pg = require("pg");

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
require("dotenv").config();
const cors = require("cors");
const corsOptions = {
  origin: "http://localhost:8080", // Only allowing frontend
  optionsSuccessStatus: 200,
};

const port = 3000;

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

console.log("Connecting...:");

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/authenticate/:username/:password", async (req, res) => {
  const { username, password } = req.params;
  const query = "SELECT * FROM users WHERE user_name = $1 AND password = crypt($2, password)";

  try {
    const { rows } = await pool.query(query, [username, password]);

    if (!rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({ message: "Authenticated", user: rows[0].user_name });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
