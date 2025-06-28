import express from "express";
import cors from "cors";
import axios from "axios";
import { exec } from "child_process";

const port = 3000;
const app = express();

import handleSetCookie from "./handlers/setCookie.js";
import sanitizeUrl from "./utils/sanitizeUrl.js";
import getInfo from "./handlers/extractInfo.js";
import saveToCloud from "./handlers/saveToCloudinary.js";

app.use(express.json());
app.use(cors());

app.post("/setCookie", handleSetCookie);
app.post("/saveToCloud", saveToCloud);
app.post("/getInfo", getInfo);

app.listen(port, () => console.log("app started"));
