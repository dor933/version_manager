"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const Db_1 = require("./Db");
const db = new Db_1.Database();
const data = require('./Data.json');
node_cron_1.default.schedule('*/1 * * * *', () => {
    console.log('Running every 1 minute');
    db.HandleData();
});
