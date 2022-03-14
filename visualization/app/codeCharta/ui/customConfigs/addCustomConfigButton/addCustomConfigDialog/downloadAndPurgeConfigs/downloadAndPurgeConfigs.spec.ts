import { validateLocalStorageSize } from "../validateLocalStorageSize"
import { mocked } from "ts-jest/utils"
import { DownloadAndPurgeConfigsComponent } from "./downloadAndPurgeConfigs.component"
import { render, screen } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import { MaterialModule } from "../../../../../../material/material.module"
import userEvent from "@testing-library/user-event"
import { ConfirmationDialogComponent } from "../../../../dialogs/confirmationDialog/confirmationDialog.component"
import { NgModule } from "@angular/core"
import { ErrorDialogComponent } from "../../../../dialogs/errorDialog/errorDialog.component"

jest.mock("../validateLocalStorageSize", () => ({ validateLocalStorageSize: jest.fn() }))
const mockedValidateLocalStorageSize = mocked(validateLocalStorageSize)

describe("downloadAndPurgeConfigsComponent", () => {
	@NgModule({
		imports: [MaterialModule],
		declarations: [ErrorDialogComponent, ConfirmationDialogComponent],
		entryComponents: [ErrorDialogComponent, ConfirmationDialogComponent]
	})
	class TestModule {}

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [TestModule]
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

		expect(screen.queryByText("DOWNLOAD & PURGE...")).not.toBeNull()
	})

	it("should show 'Download Error' dialog when download and purge custom views is not possible", async () => {
		mockedValidateLocalStorageSize.mockReturnValue(false)
		await render(DownloadAndPurgeConfigsComponent)

		userEvent.click(screen.queryByText("DOWNLOAD & PURGE..."))

		expect(screen.queryByText("Download Error")).not.toBeNull()
	})
})
