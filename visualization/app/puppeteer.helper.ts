import * as path from "path"

export const puppeteer = require("puppeteer")
export const CC_URL = `file:${path.join(__dirname, "../dist/webpack/index.html")}`

export async function goto(url: string = CC_URL): Promise<void> {
	await page.goto(url)
	await page.waitForSelector("#loading-gif-file")
	await page.waitForSelector("#loading-gif-file", { visible: false })
}

export async function enableConsole() {
	/* eslint-disable no-console */
	page.on("console", async (msg: any) => console[msg._type](...(await Promise.all(msg.args().map(arg => arg.jsonValue())))))
}
