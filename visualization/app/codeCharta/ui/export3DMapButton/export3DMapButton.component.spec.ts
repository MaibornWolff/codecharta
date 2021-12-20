import { TestBed } from "@angular/core/testing"
import { Export3DMapButtonComponent } from "./export3DMapButton.component"
import { fireEvent, render } from "@testing-library/angular"
import { Export3DMapButtonModule } from "./export3DMapButton.module"
import { FileDownloader } from "../../util/fileDownloader"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { CodeMapMesh } from "../codeMap/rendering/codeMapMesh"
import { stubDate } from "../../../../mocks/dateMock.helper"
import { FILE_STATES } from "../../util/dataMocks"

stubDate(new Date(Date.UTC(2018, 11, 14, 9, 39)))
const newDate = "2018-12-14_09-39"

const mockFileStates = FILE_STATES

jest.mock("../../state/store/files/files.selector", () => ({
	filesSelector: () => mockFileStates
}))

jest.mock("../../state/selectors/accumulatedData/accumulatedData.selector", () => ({
	accumulatedDataSelector: () => ({
		unifiedFileMeta: { fileName: "sample" }
	})
}))

jest.mock("three/examples/jsm/exporters/STLExporter", () => ({
	STLExporter: jest.fn(() => ({ parse: jest.fn().mockImplementation(() => null) }))
}))

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
	it("should call downloadStlFile with the right parameters", async function () {
		const { container } = await render(Export3DMapButtonComponent, { excludeComponentDeclaration: true })
		const downloadButton = container.querySelector(".export-3d-button")

		const downloadData = jest.spyOn(FileDownloader, "downloadData").mockImplementation(() => null)
		ThreeSceneService.mapMeshInstance = { getThreeMesh: jest.fn() } as unknown as CodeMapMesh

		fireEvent.click(downloadButton)

		expect(downloadData).toHaveBeenCalledWith(null, `sample_${newDate}.stl`)
	})
})
