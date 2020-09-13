import path from "path"
import { ConsoleMessage } from "puppeteer"

export const CC_URL = `file:${path.join(__dirname, "../dist/webpack/index.html")}`

export async function goto(url: string = CC_URL) {
	await page.goto(url)
	await page.waitForSelector("#loading-gif-file")
	await page.waitForSelector("#loading-gif-file", { visible: false })
}

export async function enableConsole() {
	page.on("console", async (message: ConsoleMessage) => {
		const data = await Promise.all(message.args().map(async argument => argument.jsonValue()))
		// @ts-ignore
		// eslint-disable-next-line no-console
		console[message._type](...data)
	})
}
