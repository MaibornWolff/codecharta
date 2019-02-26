import * as path from "path";

export const puppeteer = require('puppeteer');
export const CC_URL = `file:${path.join(__dirname, '../dist/webpack/index.html')}`;

export const delay = function(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout)
    })
}
