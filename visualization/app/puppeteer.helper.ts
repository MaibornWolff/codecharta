import * as path from "path"

export const puppeteer = require("puppeteer")
export const CC_URL = `file:${path.join(__dirname, "../dist/webpack/index.html")}`

export const goto = async (url: string = CC_URL): Promise<void> => {
	await page.goto(url)
	await waitForElementRemoval("#loading-gif-file")
	await page.waitFor(500)
}

export async function waitForElementRemoval(selector: string) {
	await page.waitForSelector(selector, { visible: false })
}

export const enableConsole = async () => {
	/* eslint-disable no-console */
	page.on("console", async (msg: any) => console[msg._type](...(await Promise.all(msg.args().map(arg => arg.jsonValue())))))
}
