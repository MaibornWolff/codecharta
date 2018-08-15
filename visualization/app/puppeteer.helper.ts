import * as path from "path";

export const puppeteer = require('puppeteer');
export const CC_URL = `file:${path.join(__dirname, '../dist/webpack/index.html')}`;
