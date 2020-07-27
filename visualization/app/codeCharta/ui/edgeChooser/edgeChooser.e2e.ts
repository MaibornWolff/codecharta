import { goto, waitForElementRemoval } from "../../../puppeteer.helper"
import { EdgeChooserPageObject } from "./edgeChooser.po"
import { FileChooserPageObject } from "../fileChooser/fileChooser.po"

describe("MapTreeViewLevel", () => {
	let edgeChooser: EdgeChooserPageObject
	let fileChooser: FileChooserPageObject

	beforeEach(async () => {
		await goto()

		edgeChooser = new EdgeChooserPageObject()
		fileChooser = new FileChooserPageObject()
	})

	describe("EdgeChooser", () => {
		it("should update metrics correctly after switching to a map with different metrics", async () => {
			await fileChooser.openFile("./app/codeCharta/ressources/sample1_with_different_edges.cc.json")
			await waitForElementRemoval("#loading-gif-file")

			await edgeChooser.open()
			const metrics = await edgeChooser.getMetrics()

			expect(metrics).toHaveLength(2)
		})
	})
})
