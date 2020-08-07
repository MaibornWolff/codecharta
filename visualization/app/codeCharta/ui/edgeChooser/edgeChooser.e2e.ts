import { goto } from "../../../puppeteer.helper"
import { EdgeChooserPageObject } from "./edgeChooser.po"
import { FileChooserPageObject } from "../fileChooser/fileChooser.po"

describe("MapTreeViewLevel", () => {
	let edgeChooser: EdgeChooserPageObject
	let fileChooser: FileChooserPageObject

	beforeEach(async () => {
		edgeChooser = new EdgeChooserPageObject()
		fileChooser = new FileChooserPageObject()

		await goto()
	})

	describe("EdgeChooser", () => {
		it("should update metrics correctly after switching to a map with different metrics", async () => {
			await fileChooser.openFiles(["./app/codeCharta/ressources/sample1_with_different_edges.cc.json"])

			await edgeChooser.open()
			const metrics = await edgeChooser.getMetrics()

			expect(metrics).toHaveLength(2)
		})
	})
})
