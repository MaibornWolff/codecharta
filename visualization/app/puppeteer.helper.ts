import path from "path"
import { setDefaultOptions } from "expect-puppeteer"

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

export async function clickButtonOnPageElement(selectorString: string, expectToClickOptions?) {
	await page.waitForSelector(selectorString)
	await expect(page).toClick(selectorString, expectToClickOptions)
}

export async function clearIndexedDB() {
	const client = await page.target().createCDPSession()
	await client.send("Storage.clearDataForOrigin", {
		origin: page.url(),
		storageTypes: "indexeddb"
	})
}
