import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

const app : Express = express();
const port = process.env.PORT;

//Routes Definitions
app.get("/", (req : Request, res : Response) => {
  res.status(200).send("Hi food food");
});


//Server Activation
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});