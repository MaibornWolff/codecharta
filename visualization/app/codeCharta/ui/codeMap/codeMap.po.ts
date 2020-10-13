export class CodeMapPageObject {
	async rightClickMap() {
		await expect(page).toClick("#codeMap", { button: "right", timeout: 3000 })
	}

	async mouseWheelWithinMap() {
		// The type definition is not already provided
		// Use the wheel() function anyway
		// @ts-ignore
		await page.mouse.wheel({ deltaX: 100 })
	}
}
