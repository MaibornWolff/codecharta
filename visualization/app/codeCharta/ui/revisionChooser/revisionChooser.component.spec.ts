import { RevisionChooserController } from "./revisionChooser.component"
import { DataService, DataModel } from "../../core/data/data.service"
import { SettingsService, Settings } from "../../core/settings/settings.service"
import { CodeMap } from "../../core/data/model/CodeMap"

describe("RevisionChooserController", () => {
	let dataServiceMock: DataService
	let settingsServiceMock: SettingsService
	let revisionChooserController: RevisionChooserController
	const revs = [{ fileName: "java" } as CodeMap, { fileName: "kotlin" } as CodeMap]

	function buildController() {
		revisionChooserController = new RevisionChooserController(dataServiceMock, settingsServiceMock, {
			$on: jest.fn(),
			$broadcast: jest.fn()
		})
	}

	function mockEverything() {
		const DataServiceMock = jest.fn<DataService>(() => ({
			setComparisonMap: jest.fn(),
			setReferenceMap: jest.fn(),
			subscribe: jest.fn(),
			getComparisonMap: jest.fn(),
			getReferenceMap: jest.fn(),
			getIndexOfMap: jest.fn(),
			$rootScope: {
				$on: jest.fn(),
				$broadcast: jest.fn()
			},
			data: {
				revisions: revs
			},
			notify: () => {
				revisionChooserController.onDataChanged(dataServiceMock.data)
			}
		}))

		dataServiceMock = new DataServiceMock()

		const SettingsServiceMock = jest.fn<SettingsService>(() => ({ applySettings: jest.fn() }))

		settingsServiceMock = new SettingsServiceMock()
	}

	beforeAll(() => {
		mockEverything()
		buildController()
	})

	beforeEach(() => {
		jest.resetAllMocks()
	})

	it("should subscribe to dataService on construction", () => {
		const revisionChooserController = new RevisionChooserController(dataServiceMock, settingsServiceMock, {
			$on: jest.fn(),
			$broadcast: jest.fn()
		})
		expect(dataServiceMock.subscribe).toHaveBeenCalledWith(revisionChooserController)
	})

	it("should get revisions from data service on startup", () => {
		expect(revisionChooserController.revisions).toBe(dataServiceMock.data.revisions)
	})

	it("onDataChanged should refresh revisions", () => {
		revisionChooserController.onDataChanged({ revisions: revs } as DataModel)

		expect(revisionChooserController.revisions).toBe(revs)
		expect(dataServiceMock.getIndexOfMap).toHaveBeenCalledTimes(2)
		expect(dataServiceMock.getComparisonMap).toHaveBeenCalledTimes(1)
		expect(dataServiceMock.getReferenceMap).toHaveBeenCalledTimes(1)
	})

	it("onReferenceChange should set the referenceMap", () => {
		revisionChooserController.onReferenceChange(42)

		expect(dataServiceMock.setReferenceMap).toBeCalledWith(42)
		expect(dataServiceMock.setReferenceMap).toHaveBeenCalledTimes(1)
	})

	it("onComparisonChange should set the comparisonMap", () => {
		revisionChooserController.onComparisonChange(42)

		expect(dataServiceMock.setComparisonMap).toBeCalledWith(42)
		expect(dataServiceMock.setComparisonMap).toHaveBeenCalledTimes(1)
	})

	it("onShowChange should update the settings and set the referenceMap", () => {
		const expected = { areaMetric: "rloc" } as Settings

		revisionChooserController.onShowChange(expected)

		expect(revisionChooserController.settings).toBe(expected)
		expect(settingsServiceMock.applySettings).toHaveBeenCalledTimes(1)
		expect(dataServiceMock.setReferenceMap).toHaveBeenCalledTimes(1)
		expect(dataServiceMock.setReferenceMap).toBeCalledWith(revisionChooserController.ui.chosenReference)
	})

	it("onDataChanged should be called when dataService.notify is called", () => {
		revisionChooserController.onDataChanged = jest.fn()
		dataServiceMock.notify()
		expect(revisionChooserController.onDataChanged).toHaveBeenCalled()
	})
})
