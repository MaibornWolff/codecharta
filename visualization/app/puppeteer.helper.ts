import path from "path"
import { setDefaultOptions } from 'expect-puppeteer'
import { ConsoleMessage } from "puppeteer"

export const CC_URL = `file:${path.join(__dirname, "../dist/webpack/index.html")}`
// expect-puppeteer toClick timeout does not work it might be the reason of flaky tests,
// changed default options globally
// [toClick issue](https://github.com/smooth-code/jest-puppeteer/issues/202)
setDefaultOptions({ timeout: 6000 }) 
export async function goto(url = CC_URL) {
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

export async function disableConsole() {
	page.on("console", async () => {})
}
