export class CodeMapPageObject {
	async rightClickMap() {
		await expect(page).toClick("#codeMap", { button: "right", timeout: 3000 })
	}

	// TODO: activate this function call
	//  if the new puppeteer mouse wheel API is supported by it's type definition:
	// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/48710
	async mouseWheelWithinMap() {
		//await page.mouse.wheel()
		return true
	}
}
