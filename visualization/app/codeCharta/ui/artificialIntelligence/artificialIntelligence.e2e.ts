import { goto } from "../../../puppeteer.helper"
import { ArtificialIntelligencePageObject } from "./artificialIntelligence.po"

describe("ArtificialIntelligence", () => {
	let artificialIntelligence: ArtificialIntelligencePageObject

	beforeEach(async () => {
		artificialIntelligence = new ArtificialIntelligencePageObject()

		await goto()
	})

	it("should do something", async () => {
		expect(await artificialIntelligence.doSomething()).toContain("SOME_RESULT")
	})
})
