import { TestBed } from "@angular/core/testing"
import { render, waitFor } from "@testing-library/angular"
import { screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import { stubDate } from "../../../../../mocks/dateMock.helper"
import { FILE_META, VALID_NODE_WITH_PATH_AND_EXTENSION } from "../../../util/dataMocks"
import { DownloadButtonComponent } from "./downloadButton.component"
import { DownloadButtonModule } from "./downloadButton.module"

const mockedAccumulatedData = {}
jest.mock("../../../state/selectors/accumulatedData/accumulatedData.selector", () => ({
	accumulatedDataSelector: () => mockedAccumulatedData
}))

describe("downloadButtonComponent", () => {
	stubDate(new Date(Date.UTC(2018, 11, 14, 9, 39)))

	beforeEach(() => {
		mockedAccumulatedData["unifiedMapNode"] = VALID_NODE_WITH_PATH_AND_EXTENSION
		mockedAccumulatedData["unifiedFileMeta"] = FILE_META
		TestBed.configureTestingModule({
			imports: [DownloadButtonModule]
		})
	})

	it("should download a map with custom settings", async () => {
		await render(DownloadButtonComponent, { excludeComponentDeclaration: true })
		userEvent.click(screen.getByRole("button"))

		await waitFor(() =>
			expect((document.querySelector(".file-name-wrapper input") as HTMLInputElement).value).toBe("fileA_2018-12-14_09-39")
		)

		const checkboxes = document.querySelectorAll("mat-checkbox")
		expect(checkboxes[0].textContent).toContain("Nodes (8)")
		expect(checkboxes[1].textContent).toContain("AttributeTypes (0)")
	})
})
