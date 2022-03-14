import { validateLocalStorageSize } from "../validateLocalStorageSize"
import { mocked } from "ts-jest/utils"
import { DownloadAndPurgeConfigsComponent } from "./downloadAndPurgeConfigs.component"
import { render, screen } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import { MaterialModule } from "../../../../../../material/material.module"
import userEvent from "@testing-library/user-event"
import { ConfirmationDialogComponent } from "../../../../dialogs/confirmationDialog/confirmationDialog.component"
import { dialogs } from "../../../../dialogs/dialogs"

jest.mock("../validateLocalStorageSize", () => ({ validateLocalStorageSize: jest.fn() }))
const mockedValidateLocalStorageSize = mocked(validateLocalStorageSize)

describe("downloadAndPurgeConfigsComponent", () => {
	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [MaterialModule],
			declarations: [...dialogs]
		})
	})

	it("should not show 'DOWNLOAD & PURGE' button when local storage size is valid", async () => {
		mockedValidateLocalStorageSize.mockReturnValue(true)
		await render(DownloadAndPurgeConfigsComponent)

		expect(screen.queryByText("DOWNLOAD & PURGE...")).toBe(null)
	})

	it("should show 'DOWNLOAD & PURGE' button when local storage size is invalid", async () => {
		mockedValidateLocalStorageSize.mockReturnValue(false)
		await render(DownloadAndPurgeConfigsComponent)
		const button = screen.queryByText("DOWNLOAD & PURGE...")

		expect(button).not.toBeNull()

		userEvent.click(button)

		const { debug } = await render(ConfirmationDialogComponent)
		debug()
		//expect(screen.)
	})
})
