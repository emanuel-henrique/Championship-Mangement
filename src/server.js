import express from "express";
import Routes from "./Routes/index.js";

const app = express()

app.use(express.json());
app.use(Routes)

const PORT = 3333
app.listen(PORT, () => {
  console.log(`Servidor rodando no endereço => localhost:${PORT}`)
})