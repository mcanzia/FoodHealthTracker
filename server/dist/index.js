"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = process.env.PORT;
//Routes Definitions
app.get("/", (req, res) => {
    res.status(200).send("Hi food food");
});
//Server Activation
app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});
