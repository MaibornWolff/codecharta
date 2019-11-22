import "./dialog.module"
import "../codeMap/codeMap.module"
import { DialogDownloadController, DownloadCheckboxNames } from "./dialog.download.component"
import { SettingsService } from "../../state/settingsService/settings.service"
import { FileStateService } from "../../state/fileState.service"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { Settings, AttributeTypes, AttributeTypeValue } from "../../codeCharta.model"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { stubDate } from "../../../../mocks/dateMock.helper"
import {
	DEFAULT_SETTINGS,
	FILE_STATES,
	VALID_NODE_WITH_PATH_AND_EXTENSION,
	FILE_META,
	VALID_EDGES,
	BLACKLIST,
	MARKED_PACKAGES
} from "../../util/dataMocks"
import _ from "lodash"

describe("DialogDownloadController", () => {
	stubDate(new Date(Date.UTC(2018, 11, 14, 9, 39)))
	const newDate: string = "2018-12-14_09-39"

	let dialogDownloadController: DialogDownloadController
	let $mdDialog
	let codeMapPreRenderService: CodeMapPreRenderService
	let settingsService: SettingsService
	let fileStateService: FileStateService
	let settings: Settings

	beforeEach(() => {
		restartSystem()
		withMockedSettingsService()
		withMockedFileStateService()
		withMockedCodeMapPreRenderService()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.dialog")

		$mdDialog = getService("$mdDialog")
		codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService")
		settingsService = getService<SettingsService>("settingsService")
		fileStateService = getService<FileStateService>("fileStateService")

		settings = _.cloneDeep(DEFAULT_SETTINGS)
	}

	function rebuildController() {
		dialogDownloadController = new DialogDownloadController($mdDialog, codeMapPreRenderService, settingsService, fileStateService)
	}

	function withMockedCodeMapPreRenderService() {
		codeMapPreRenderService = jest.fn<CodeMapPreRenderService>(() => {
			return {
				getRenderMap: jest.fn().mockReturnValue(VALID_NODE_WITH_PATH_AND_EXTENSION),
				getRenderFileMeta: jest.fn().mockReturnValue(FILE_META)
			}
		})()
	}

	function withMockedSettingsService(mockSettings: Settings = settings) {
		settingsService = jest.fn<SettingsService>(() => {
			return {
				getSettings: jest.fn().mockReturnValue(mockSettings)
			}
		})()
	}

	function withMockedFileStateService() {
		fileStateService = jest.fn<FileStateService>(() => {
			return {
				getFileStates: jest.fn().mockReturnValue(FILE_STATES)
			}
		})()
	}

	function getFilteredFileContent(name: DownloadCheckboxNames) {
		return dialogDownloadController["_viewModel"].fileContent.find(x => x.name == name)
	}

	describe("constructor", () => {
		describe("fileName", () => {
			it("should set correct fileName", () => {
				expect(dialogDownloadController["_viewModel"].fileName).toEqual("fileA_" + newDate)
			})
		})

		describe("amountOfNodes", () => {
			it("should set correct amountOfNodes", () => {
				expect(dialogDownloadController["_viewModel"].amountOfNodes).toEqual(8)
			})
		})

		describe("amountOfAttributeTypes", () => {
			it("should set correct amountOfAttributeTypes with no attributeTypes available", () => {
				settings.fileSettings.attributeTypes = {} as AttributeTypes
				withMockedSettingsService(settings)

				rebuildController()

				expect(dialogDownloadController["_viewModel"].amountOfAttributeTypes).toEqual(0)
			})

			it("should set correct amountOfAttributeTypes with attributeTypes available", () => {
				settings.fileSettings.attributeTypes = {
					nodes: [
						{ metric1: AttributeTypeValue.relative },
						{ metric2: AttributeTypeValue.absolute },
						{ metric3: AttributeTypeValue.absolute }
					],
					edges: [{ metric4: AttributeTypeValue.absolute }, { metric5: AttributeTypeValue.relative }]
				}
				withMockedSettingsService(settings)

				rebuildController()

				expect(dialogDownloadController["_viewModel"].amountOfAttributeTypes).toEqual(5)
			})
		})

		describe("fileContent edges", () => {
			describe("no edge available", () => {
				beforeEach(() => {
					settings.fileSettings.edges = []
					withMockedSettingsService(settings)

					rebuildController()
				})

				it("should set correct numberOfListItems", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.edges).numberOfListItems).toEqual(0)
				})

				it("should set correct isDisabled flag", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.edges).isDisabled).toBeTruthy()
				})

				it("should set correct isSelected flag", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.edges).isSelected).toBeFalsy()
				})
			})

			describe("with edges available", () => {
				beforeEach(() => {
					settings.fileSettings.edges = VALID_EDGES
					withMockedSettingsService(settings)

					rebuildController()
				})

				it("should set correct numberOfListItems", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.edges).numberOfListItems).toEqual(3)
				})

				it("should set correct isDisabled flag", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.edges).isDisabled).toBeFalsy()
				})

				it("should set correct isSelected flag", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.edges).isSelected).toBeTruthy()
				})
			})
		})

		describe("fileContent excludes", () => {
			describe("no excludes available", () => {
				beforeEach(() => {
					settings.fileSettings.blacklist = []
					withMockedSettingsService(settings)

					rebuildController()
				})

				it("should set correct numberOfListItems", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.excludes).numberOfListItems).toEqual(0)
				})

				it("should set correct isDisabled flag", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.excludes).isDisabled).toBeTruthy()
				})

				it("should set correct isSelected flag", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.excludes).isSelected).toBeFalsy()
				})
			})

			describe("with excludes available", () => {
				beforeEach(() => {
					settings.fileSettings.blacklist = BLACKLIST
					withMockedSettingsService(settings)

					rebuildController()
				})

				it("should set correct numberOfListItems", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.excludes).numberOfListItems).toEqual(2)
				})

				it("should set correct isDisabled flag", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.excludes).isDisabled).toBeFalsy()
				})

				it("should set correct isSelected flag", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.excludes).isSelected).toBeTruthy()
				})
			})
		})

		describe("fileContent hides", () => {
			describe("no flattens available", () => {
				beforeEach(() => {
					settings.fileSettings.blacklist = []
					withMockedSettingsService(settings)

					rebuildController()
				})

				it("should set correct numberOfListItems", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.flattens).numberOfListItems).toEqual(0)
				})

				it("should set correct isDisabled flag", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.flattens).isDisabled).toBeTruthy()
				})

				it("should set correct isSelected flag", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.flattens).isSelected).toBeFalsy()
				})
			})

			describe("with flattens available", () => {
				beforeEach(() => {
					settings.fileSettings.blacklist = BLACKLIST
					withMockedSettingsService(settings)

					rebuildController()
				})

				it("should set correct numberOfListItems", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.flattens).numberOfListItems).toEqual(1)
				})

				it("should set correct isDisabled flag", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.flattens).isDisabled).toBeFalsy()
				})

				it("should set correct isSelected flag", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.flattens).isSelected).toBeTruthy()
				})
			})
		})

		describe("fileContent markedPackages", () => {
			describe("no markedPackages available", () => {
				beforeEach(() => {
					settings.fileSettings.markedPackages = []
					withMockedSettingsService(settings)

					rebuildController()
				})

				it("should set correct numberOfListItems", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.markedPackages).numberOfListItems).toEqual(0)
				})

				it("should set correct isDisabled flag", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.markedPackages).isDisabled).toBeTruthy()
				})

				it("should set correct isSelected flag", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.markedPackages).isSelected).toBeFalsy()
				})
			})

			describe("with markedPackages available", () => {
				beforeEach(() => {
					settings.fileSettings.markedPackages = MARKED_PACKAGES
					withMockedSettingsService(settings)

					rebuildController()
				})

				it("should set correct numberOfListItems", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.markedPackages).numberOfListItems).toEqual(4)
				})

				it("should set correct isDisabled flag", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.markedPackages).isDisabled).toBeFalsy()
				})

				it("should set correct isSelected flag", () => {
					expect(getFilteredFileContent(DownloadCheckboxNames.markedPackages).isSelected).toBeTruthy()
				})
			})
		})
	})
})
