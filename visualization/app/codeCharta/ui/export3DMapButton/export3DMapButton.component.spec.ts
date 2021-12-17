import { TestBed } from "@angular/core/testing"
import { Export3DMapButtonComponent } from "./export3DMapButton.component"
import { fireEvent, render } from "@testing-library/angular"
import { Export3DMapButtonModule } from "./export3DMapButton.module"

describe("Export3DMapButtonComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [Export3DMapButtonModule]
		})
	})

	it("should start download on click", async function () {
		const { container } = await render(Export3DMapButtonComponent, { excludeComponentDeclaration: true })
		// mock download and therefore only verify the Angular binding.
		// A better approach would be, if the component would only fire an action
		// and an https://ngrx.io/guide/effects would do the side effect and logic.
		// Then we could test the logic in the effect without mocking a lot
		// and the component wouldn't need to know anything about store values
		// @ts-ignore
		const mockedDownload = jest.spyOn(ng.probe(container).componentInstance, "downloadStlFile").mockImplementation(() => null)

		const downloadButton = container.querySelector(".export-3d-button")
		expect(downloadButton).not.toBe(null)

		fireEvent.click(downloadButton)
		expect(mockedDownload).toHaveBeenCalledTimes(1)
	})
})
