import { CC_URL, puppeteer } from "../../puppeteer.helper"
import { ErrorDialogPageObject } from "../ui/dialog/errorDialog.po"
import { RevisionChooserFileDropDownPageObject } from "../ui/revisionChooser/revisionChooserFileDropdown.po"

jest.setTimeout(15000)

describe("codecharta", () => {
	let browser, page

	beforeEach(async () => {
		browser = await puppeteer.launch({
			headless: true,
			args: ["--allow-file-access-from-files"]
		})
		page = await browser.newPage()
	})

	afterEach(async () => {
		await browser.close()
	})

	async function handleErrorDialog() {
		let errorDialog = new ErrorDialogPageObject(page)
		let msg = await errorDialog.getMessage()
		expect(msg).toEqual("One or more files from the given file URL parameter could not be loaded. Loading sample files instead.")
		await page.waitFor(1000)
		return errorDialog.clickOk()
	}

	async function checkSelectedRevisionName(shouldBe: string) {
		let revisionChooser = new RevisionChooserFileDropDownPageObject(page)
		await page.waitFor(1000)
		let name = await revisionChooser.getSelectedName()
		expect(name).toEqual(shouldBe)
	}

	async function checkAllRevisionNames(shouldBe: string[]) {
		let revisionChooser = new RevisionChooserFileDropDownPageObject(page)
		await page.waitFor(1000)
		await revisionChooser.clickChooser()
		await page.waitFor(1000)
		let names = await revisionChooser.getAllNames()
		expect(names).toEqual(shouldBe)
	}

	async function mockResponses() {
		await page.setRequestInterception(true)
		page.on("request", request => {
			if (request.url().includes("/fileOne.json")) {
				request.respond({
					content: "application/json",
					headers: { "Access-Control-Allow-Origin": "*" },
					body: JSON.stringify(require("../assets/sample2.cc.json"))
				})
			} else if (request.url().includes("/fileTwo.json")) {
				request.respond({
					content: "application/json",
					headers: { "Access-Control-Allow-Origin": "*" },
					body: JSON.stringify(require("../assets/sample3.cc.json"))
				})
			} else {
				request.continue()
			}
		})
	}

	it("should load data when file parameters in url are valid", async () => {
		await mockResponses()
		await page.goto(CC_URL + "?file=fileOne.json&file=fileTwo.json")
		await checkSelectedRevisionName("fileOne.json")
		await checkAllRevisionNames(["fileOne.json", "fileTwo.json"])
	})

	it("should throw errors when file parameters in url are invalid and load sample data instead", async () => {
		await page.goto(CC_URL + "?file=invalid234")
		await handleErrorDialog()
		await checkSelectedRevisionName("sample1.cc.json")
		await checkAllRevisionNames(["sample1.cc.json", "sample2.cc.json"])
	})
})
