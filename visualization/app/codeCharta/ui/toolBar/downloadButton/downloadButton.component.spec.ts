import { TestBed } from "@angular/core/testing"
import { render, waitFor } from "@testing-library/angular"
import { screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import { stubDate } from "../../../../../mocks/dateMock.helper"
import { State } from "../../../state/angular-redux/state"
import { FILE_META, VALID_EDGES, VALID_NODE_WITH_PATH_AND_EXTENSION } from "../../../util/dataMocks"
import { FileDownloader } from "../../../util/fileDownloader"
import { DownloadButtonComponent } from "./downloadButton.component"
import { DownloadButtonModule } from "./downloadButton.module"

const mockedAccumulatedData = {}
jest.mock("../../../state/selectors/accumulatedData/accumulatedData.selector", () => ({
	accumulatedDataSelector: () => mockedAccumulatedData
}))

describe("downloadButtonComponent", () => {
	stubDate(new Date(Date.UTC(2018, 11, 14, 9, 39)))
	const mockedFileSettings = {
		attributeTypes: {
			nodes: { rloc: "absolute" },
			edges: { pairingRate: "relative", avgCommits: "absolute" }
		},
		blacklist: [],
		edges: VALID_EDGES,
		markedPackages: []
	}

	beforeEach(() => {
		mockedAccumulatedData["unifiedMapNode"] = VALID_NODE_WITH_PATH_AND_EXTENSION
		mockedAccumulatedData["unifiedFileMeta"] = FILE_META
		TestBed.configureTestingModule({
			imports: [DownloadButtonModule],
			providers: [
				{
					provide: State,
					useValue: {
						getValue: () => ({
							files: [], // files are only used to decide if in delta mode. So just mocking the key is enough
							fileSettings: mockedFileSettings
						})
					}
				}
			]
		})
	})

	it("should download a map with custom settings", async () => {
		const mockedDownload = jest.fn()
		FileDownloader.downloadCurrentMap = mockedDownload
		await render(DownloadButtonComponent, { excludeComponentDeclaration: true })
		userEvent.click(screen.getByRole("button"))

		await waitFor(() =>
			expect((document.querySelector(".file-name-wrapper input") as HTMLInputElement).value).toBe("fileA_2018-12-14_09-39")
		)

		const checkboxes = document.querySelectorAll("mat-checkbox")

		expect(checkboxes[0].textContent).toContain("Nodes (8)")
		expect(checkboxes[0].querySelector("input").checked).toBe(true)
		expect(checkboxes[0].querySelector("input").disabled).toBe(true)

		expect(checkboxes[1].textContent).toContain("AttributeTypes (3)")
		expect(checkboxes[1].querySelector("input").checked).toBe(true)
		expect(checkboxes[1].querySelector("input").disabled).toBe(true)

		expect(checkboxes[2].textContent).toContain("Edges (3)")
		expect(checkboxes[2].querySelector("input").checked).toBe(true)
		expect(checkboxes[2].querySelector("input").disabled).toBe(false)

		userEvent.click(checkboxes[2].querySelector("input"))
		expect(checkboxes[2].querySelector("input").checked).toBe(false)

		userEvent.click(screen.getByText("SAVE"))
		expect(mockedDownload).toHaveBeenCalled()
		expect(mockedDownload.mock.calls[0][0]).toBe(mockedAccumulatedData["unifiedMapNode"])
		expect(mockedDownload.mock.calls[0][1]).toBe(mockedAccumulatedData["unifiedFileMeta"])
		expect(mockedDownload.mock.calls[0][3].length).toBe(2)
		expect(mockedDownload.mock.calls[0][4]).toBe("fileA_2018-12-14_09-39")
	})
})
