import { CC_URL, goto } from "../../puppeteer.helper"
import { DialogErrorPageObject } from "../ui/dialog/dialog.error.po"
import { FilePanelPageObject } from "../ui/filePanel/filePanel.po"

describe("codecharta", () => {
	let dialogError: DialogErrorPageObject
	let filePanel: FilePanelPageObject

	beforeEach(async () => {
		dialogError = new DialogErrorPageObject()
		filePanel = new FilePanelPageObject()

		await goto()
	})

	async function handleErrorDialog() {
		const msg = await dialogError.getMessage()
		expect(msg).toEqual("One or more files from the given file URL parameter could not be loaded. Loading sample files instead.")
		await page.waitForSelector(".md-dialog-container")
		await dialogError.clickOk()
	}

	async function checkSelectedFileName(shouldBe: string) {
		const name = await filePanel.getSelectedName()
		expect(name).toEqual(shouldBe)
	}

	async function checkAllFileNames(shouldBe: string[]) {
		const names = await filePanel.getAllNames()
		expect(names).toEqual(shouldBe)
	}

	async function mockResponses() {
		await page.setRequestInterception(true)
		page.on("request", request => {
			if (request.url().includes("/fileOne.json")) {
				request.respond({
					contentType: "application/json",
					headers: { "Access-Control-Allow-Origin": "*" },
					body: JSON.stringify(require("../assets/sample2.cc.json"))
				})
			} else if (request.url().includes("/fileTwo.json")) {
				request.respond({
					contentType: "application/json",
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
		await goto(CC_URL + "?file=fileOne.json&file=fileTwo.json")
		await checkSelectedFileName("fileOne.json")
		await checkAllFileNames(["fileOne.json", "fileTwo.json"])
	})

	it("should throw errors when file parameters in url are invalid and load sample data instead", async () => {
		await goto(CC_URL + "?file=invalid234")
		await handleErrorDialog()
		await checkSelectedFileName("sample1.cc.json")
		await checkAllFileNames(["sample1.cc.json", "sample2.cc.json"])
	})
})
