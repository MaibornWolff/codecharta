const tsPreset = require("ts-jest/jest-preset")
const puppeteerPreset = require("jest-puppeteer/jest-preset")

module.exports = Object.assign(tsPreset, puppeteerPreset)
