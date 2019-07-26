import { RibbonBarController } from "./ribbonBar.component"

describe("RibbonBarController", () => {
	let ribbonBarController = new RibbonBarController()

	describe("toggle", () => {
		it("should set isExpanded to true if was not expanded yet", () => {
			ribbonBarController["isExpanded"] = false

			ribbonBarController.toggle()

			expect(ribbonBarController["isExpanded"]).toBeTruthy()
		})

		it("should set isExpanded to false if is expanded", () => {
			ribbonBarController["isExpanded"] = true

			ribbonBarController.toggle()

			expect(ribbonBarController["isExpanded"]).toBeFalsy()
		})
	})
})
