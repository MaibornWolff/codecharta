export class CodeMapPageObject {
	async clickMap() {
		await expect(page).toClick("#codeMap", { button: "left", timeout: 3000 })
	}

	async rightClickMouseDownOnMap() {
		await page.mouse.down({ button: "right" })
	}

	async mouseWheelWithinMap() {
		// The type definition is not already provided
		// Use the wheel() function anyway
		// @ts-ignore
		await page.mouse.wheel({ deltaX: 100 })
	}
}
