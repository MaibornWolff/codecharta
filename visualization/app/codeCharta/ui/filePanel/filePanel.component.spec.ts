import { FilePanelComponent } from "./filePanel.component"
import { mocked } from "ts-jest/utils"
import { TestBed } from "@angular/core/testing"
import { FilePanelModule } from "./filePanel.module"
import { render } from "@testing-library/angular"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"

jest.mock("../../state/selectors/isDeltaState.selector", () => ({
	isDeltaStateSelector: jest.fn()
}))
const mockedIsDeltaStateSelector = mocked(isDeltaStateSelector)

describe("filePanelComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [FilePanelModule]
		})
	})

	it("should render delta-selector when in delta mode", async () => {
		mockedIsDeltaStateSelector.mockReturnValue(true)
		const { container } = await render(FilePanelComponent, { excludeComponentDeclaration: true })
		expect(container.querySelector("cc-file-panel-delta-selector")).not.toBe(null)
		expect(container.querySelector("cc-file-panel-file-selector")).toBe(null)
	})

	it("should render file-selector when not in delta mode", async () => {
		mockedIsDeltaStateSelector.mockReturnValue(false)
		const { container } = await render(FilePanelComponent, { excludeComponentDeclaration: true })
		expect(container.querySelector("cc-file-panel-file-selector")).not.toBe(null)
		expect(container.querySelector("cc-file-panel-delta-selector")).toBe(null)
	})
})

// describe("onPartialSelectionClosed", () => {
// 	it("should set the filenames of the maps that are visible again", () => {
// 		storeService.dispatch(setStandard([TEST_DELTA_MAP_A, TEST_DELTA_MAP_B]))
// 		filePanelController.onFilesSelectionChanged(storeService.getState().files)
// 		filePanelController["_viewModel"].selectedFileNames.partial = []

// 		filePanelController.onPartialSelectionClosed()

// 		expect(filePanelController["_viewModel"].selectedFileNames.partial).toEqual([
// 			TEST_DELTA_MAP_A.fileMeta.fileName,
// 			TEST_DELTA_MAP_B.fileMeta.fileName
// 		])
// 	})
// })
