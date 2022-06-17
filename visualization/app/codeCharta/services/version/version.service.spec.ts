import { MatDialog } from "@angular/material/dialog"
import { ChangelogDialogComponent } from "../../ui/dialogs/changelogDialog/changelogDialog.component"
import { VersionService } from "./version.service"

describe("versionService", () => {
	let versionService: VersionService & { version: string }
	let mockedDialog: MatDialog
	const mockedSetLocalStorageItem = jest.spyOn(Storage.prototype, "setItem")

	beforeEach(() => {
		mockedDialog = { open: jest.fn() } as unknown as MatDialog
		mockedSetLocalStorageItem.mockReset()
		versionService = new VersionService(mockedDialog)
		versionService.version = "1.42.0"
	})

	describe("synchronizeLocalCodeChartaVersion", () => {
		it("should not open changelog but set latest version when there is no saved code charta version in local storage", () => {
			Storage.prototype.getItem = jest.fn(() => null)
			versionService.synchronizeLocalCodeChartaVersion()
			expect(mockedDialog.open).not.toHaveBeenCalled()
			expect(mockedSetLocalStorageItem).toHaveBeenCalledWith("codeChartaVersion", "1.42.0")
		})

		it("should do nothing when latest version is in local storage", () => {
			Storage.prototype.getItem = jest.fn(() => "1.42.0")
			versionService.synchronizeLocalCodeChartaVersion()
			expect(mockedDialog.open).not.toHaveBeenCalled()
			expect(mockedSetLocalStorageItem).not.toHaveBeenCalled()
		})

		it("should show changelog and update version in local storage when an old version is in local storage", () => {
			Storage.prototype.getItem = jest.fn(() => "1.41.0")
			versionService.synchronizeLocalCodeChartaVersion()
			expect(mockedDialog.open).toHaveBeenCalledWith(ChangelogDialogComponent, {
				panelClass: "cc-changelog-dialog",
				data: { previousVersion: "1.41.0", currentVersion: "1.42.0" }
			})
			expect(mockedSetLocalStorageItem).toHaveBeenCalledWith("codeChartaVersion", "1.42.0")
		})
	})
})
