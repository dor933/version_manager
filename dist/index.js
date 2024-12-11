"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const Classes_1 = require("./Classes");
const data = require('./Data.json');
node_cron_1.default.schedule('*/10 * * * *', () => {
    console.log('Running every 10 minutes');
    const db = new Classes_1.Database();
});
