import * as path from "path"
import { Page } from "puppeteer"

export const puppeteer = require("puppeteer")
export const CC_URL = `file:${path.join(__dirname, "../dist/webpack/index.html")}`

export const delay = async timeout => {
	await page.waitFor(timeout)
}

export const goto = async (): Promise<void> => {
	await page.goto(CC_URL)
	await delay(1000) // Wait for Loading Gif to finish
}

export const enableConsole = async (page: Page) => {
	/* eslint-disable no-console */
	page.on("console", async (msg: any) => console[msg._type](...(await Promise.all(msg.args().map(arg => arg.jsonValue())))))
}
