import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { expect } from "@jest/globals"
import { LegendMarkedPackagesComponent } from "./legendMarkedPackages.component"

import { LegendMarkedPackagesModule } from "./legendMarkedPackages.module"
import { legendMarkedPackagesSelector } from "./legendMarkedPackages.selector"

jest.mock("./legendMarkedPackages.selector", () => ({
	legendMarkedPackagesSelector: jest.fn()
}))
const mockedLegendMarkedPackagesSelector = legendMarkedPackagesSelector as jest.Mock

describe("LegendMarkedPackages", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [LegendMarkedPackagesModule]
		})
	})

	it("shouldn't display anything if there are no marked packages", async () => {
		mockedLegendMarkedPackagesSelector.mockImplementation(() => ({}))
		const { container } = await render(LegendMarkedPackagesComponent, { excludeComponentDeclaration: true })

		expect(container.textContent).toBe("")
	})

	it("should display color pickers for each marked package, sorted by first marked path", async () => {
		mockedLegendMarkedPackagesSelector.mockImplementation(() => ({
			"#ffffff": ["/blackMarked/whiteMarked"],
			"#000000": ["/blackMarked"]
		}))
		const { container } = await render(LegendMarkedPackagesComponent, { excludeComponentDeclaration: true })

		expect(container.querySelectorAll("cc-labelled-color-picker").length).toBe(2)
		expect(container.querySelectorAll("cc-labelled-color-picker")[0].textContent).toMatch("/blackMarked")
		expect(container.querySelectorAll("cc-labelled-color-picker")[1].textContent).toMatch("/blackMarked/whiteMarked")
	})
})
