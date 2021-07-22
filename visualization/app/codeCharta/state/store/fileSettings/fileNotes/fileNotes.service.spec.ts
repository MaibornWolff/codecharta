import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { FileNotesAction, FileNotesActions } from "./fileNotes.actions"
import { FileNotesService } from "./fileNotes.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("FileNotesService", () => {
	let fileNotesService: FileNotesService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		fileNotesService = new FileNotesService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, fileNotesService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new fileNotes value", () => {
			const action: FileNotesAction = {
				type: FileNotesActions.SET_FILE_NOTES,
				payload: [
					{
						fileName: "sample1.cc.json",
						notes: [
							{ nodePath: "root/ParentLeaf", text: "Some text", metricData: ["mcc, rloc, rloc, pairingRate"] },
							{
								nodePath: "root/ParentLeaf/smallLeaf.html",
								text: "Some more text",
								metricData: ["mcc, rloc, rloc, pairingRate"]
							}
						]
					},
					{
						fileName: "sample2.cc.json",
						notes: [
							{ nodePath: "root/ParentLeaf", text: "Some note", metricData: ["mcc, rloc, rloc, pairingRate"] },
							{ nodePath: "root/bigLeaf.ts", text: "Some more notes", metricData: ["mcc, rloc, rloc, pairingRate"] }
						]
					}
				]
			}
			storeService["store"].dispatch(action)

			fileNotesService.onStoreChanged(FileNotesActions.SET_FILE_NOTES)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("file-notes-changed", {
				fileNotes: [
					{
						fileName: "sample1.cc.json",
						notes: [
							{ nodePath: "root/ParentLeaf", text: "Some text", metricData: ["mcc, rloc, rloc, pairingRate"] },
							{
								nodePath: "root/ParentLeaf/smallLeaf.html",
								text: "Some more text",
								metricData: ["mcc, rloc, rloc, pairingRate"]
							}
						]
					},
					{
						fileName: "sample2.cc.json",
						notes: [
							{ nodePath: "root/ParentLeaf", text: "Some note", metricData: ["mcc, rloc, rloc, pairingRate"] },
							{ nodePath: "root/bigLeaf.ts", text: "Some more notes", metricData: ["mcc, rloc, rloc, pairingRate"] }
						]
					}
				]
			})
		})

		it("should not notify anything on non-file-notes-events", () => {
			fileNotesService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
