import * as path from "path"
import { Browser, Page } from "puppeteer"

export const puppeteer = require("puppeteer")
export const CC_URL = `file:${path.join(__dirname, "../dist/webpack/index.html")}`

export const delay = timeout => {
	return new Promise(resolve => {
		setTimeout(resolve, timeout)
	})
}

export const goto = async (page: Page): Promise<void> => {
	await page.goto(CC_URL)
	await delay(3000)
}

export const launch = async (): Promise<Browser> => {
	return await puppeteer.launch({
		defaultViewport: { width: 1920, height: 1080 },
		headless: false
	})
}
