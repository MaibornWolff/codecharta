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
import { downloadAndCollectPurgeableConfigs } from "../downloadAndCollectPurgeableConfigs"
import { CustomConfig } from "../../../../../model/customConfig/customConfig.api.model"
import { CustomConfigHelper } from "../../../../../util/customConfigHelper"
import { InteractivityChecker } from "@angular/cdk/a11y"

jest.mock("../validateLocalStorageSize", () => ({ validateLocalStorageSize: jest.fn() }))
const mockedValidateLocalStorageSize = mocked(validateLocalStorageSize)

jest.mock("../downloadAndCollectPurgeableConfigs", () => ({ downloadAndCollectPurgeableConfigs: jest.fn() }))
const mockedDownloadAndCollectPurgeableOldConfigs = mocked(downloadAndCollectPurgeableConfigs)

describe("downloadAndPurgeConfigsComponent", () => {
	@NgModule({
		imports: [MaterialModule],
		providers: [{ provide: InteractivityChecker, useValue: { isFocusable: () => true, isTabbable: () => true } }],
		declarations: [ErrorDialogComponent, ConfirmationDialogComponent],
		entryComponents: [ErrorDialogComponent, ConfirmationDialogComponent]
	})
	class TestModule {}

	beforeEach(() => {
		document.body.innerHTML = ""
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
		mockedDownloadAndCollectPurgeableOldConfigs.mockReturnValue(new Set())
		await render(DownloadAndPurgeConfigsComponent)

		await userEvent.click(screen.queryByText("DOWNLOAD & PURGE..."))

		expect(screen.queryByText("Download Error")).not.toBeNull()
	})

	describe("ConfirmationDialogComponent", () => {
		let spyOnDeleteCustomConfigs

		beforeEach(() => {
			mockedValidateLocalStorageSize.mockReturnValue(false)
			mockedDownloadAndCollectPurgeableOldConfigs.mockReturnValue(new Set([{} as CustomConfig]))
			spyOnDeleteCustomConfigs = jest.spyOn(CustomConfigHelper, "deleteCustomConfigs").mockImplementation(() => undefined)
		})

		it("should let user abort purging old custom views", async () => {
			await render(DownloadAndPurgeConfigsComponent)

			await userEvent.click(screen.queryByText("DOWNLOAD & PURGE..."))
			expect(screen.queryByText("Confirm to purge old Configs")).not.toBeNull()
			await userEvent.click(screen.queryByText("CANCEL"))
			expect(screen.queryByText("CANCEL")).toBeNull()
			expect(spyOnDeleteCustomConfigs).toHaveBeenCalledTimes(0)
		})

		it("should let user confirm purging old custom views", async () => {
			await render(DownloadAndPurgeConfigsComponent)

			await userEvent.click(screen.queryByText("DOWNLOAD & PURGE..."))
			expect(screen.queryByText("Confirm to purge old Configs")).not.toBeNull()
			await userEvent.click(screen.queryByText("OK"))
			expect(screen.queryByText("OK")).toBeNull()
			expect(spyOnDeleteCustomConfigs).toHaveBeenCalledTimes(1)
		})
	})
})
