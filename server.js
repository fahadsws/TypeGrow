const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const routes = require("./src/routes/index");
const { initCron } = require("./src/cron");
dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", routes);

initCron();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
