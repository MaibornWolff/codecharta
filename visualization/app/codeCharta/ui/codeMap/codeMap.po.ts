export class CodeMapPageObject {
	async clickMap() {
		await expect(page).toClick("#codeMap", { button: "left", timeout: 3000 })
	}

	async rightClickMouseDownOnMap() {
		await page.mouse.down({ button: "right" })
	}

	async mouseWheelWithinMap() {
		const codeMapElement = await page.waitForSelector("#codeMap")
		await codeMapElement.hover()

		// The wheel() type definition is not already provided
		// Use the wheel() function anyway
		// @ts-ignore
		await page.mouse.wheel({ deltaX: 100 })
	}
}
