import { TestBed } from "@angular/core/testing"
import { Export3DMapButtonComponent } from "./export3DMapButton.component"
import { render } from "@testing-library/angular"
import { Export3DMapButtonModule } from "./export3DMapButton.module"

describe("Export3DMapButtonComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [Export3DMapButtonModule]
		})
	})
	it("should show 3d file export button", async function () {
		const { container } = await render(Export3DMapButtonComponent, { excludeComponentDeclaration: true })

		expect(container.querySelector(".export-3d-button")).not.toBe(null)
	})
})
