import { TestBed } from "@angular/core/testing"
import { Export3DMapDialogComponent } from "./export3DMapDialog.component"
import { render, screen } from "@testing-library/angular"
import { State } from "@ngrx/store"
import { ThreeSceneService } from "../../codeMap/threeViewer/threeSceneService"
import { DEFAULT_STATE, TEST_NODES } from "../../../util/dataMocks"
import { CodeMapMesh } from "../../codeMap/rendering/codeMapMesh"
import { defaultState } from "../../../state/store/state.manager"

describe("Export3DMapDialogComponent", () => {
	beforeEach(() => {
		const codeMapMesh = new CodeMapMesh(TEST_NODES, DEFAULT_STATE, false)

		TestBed.configureTestingModule({
			providers: [
				{ provide: State, useValue: { getValue: () => defaultState } },
				{
					provide: ThreeSceneService,
					useValue: {
						getMapMesh: jest.fn().mockReturnValue(codeMapMesh)
					}
				}
			]
		})
	})

	it("should render the dialog", async function () {
		await render(Export3DMapDialogComponent, { excludeComponentDeclaration: true })
		const dialog = screen.getByText("3D Print CodeCharta Map")
		expect(dialog).not.toBe(null)
	})

	// Add more test cases as needed
})
