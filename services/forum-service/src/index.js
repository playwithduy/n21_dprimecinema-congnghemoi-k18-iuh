require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const helmet = require("helmet");
const compression = require("compression");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", require("./routes/forum.route"));

const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
  console.log(`💬 Forum service running on port ${PORT}`);
});
