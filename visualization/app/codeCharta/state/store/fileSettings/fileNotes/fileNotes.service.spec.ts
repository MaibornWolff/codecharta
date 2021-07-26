import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { addFileNote, addNotesToFileNotes, FileNotesAction, FileNotesActions, removeFileNote, removeNoteByIndex } from "./fileNotes.actions"
import { FileNote, FileNotesService, Note } from "./fileNotes.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

const note1: Note = { nodePath: "/root/database.ts", text: "Nice work", metricData: ["rloc", "mcc"] }
const note2: Note = { nodePath: "/root/database.ts", text: "Fix bugs!", metricData: ["rloc", "mcc"] }
const note3: Note = { nodePath: "/root/database.ts", text: "Lets do this!", metricData: ["rloc", "mcc"] }
// const note4 : Note = {nodePath: "/root/leaf2", text: "Nice work", metricData: ["rloc", "mcc"]}
// const note5 : Note = {nodePath: "/root/leaf2", text: "Fix bugs!", metricData: ["rloc", "mcc"]}
// const note6 : Note = {nodePath: "/root/leaf2", text: "Lets do this!", metricData: ["rloc", "mcc"]}

const fileNote1: FileNote = { fileName: "sample1.cc.json", notes: [] }
const fileNote2: FileNote = { fileName: "sample2.cc.json", notes: [] }

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

	describe("addFileNote", () => {
		it("should add a FileNote", () => {
			storeService.dispatch(addFileNote(fileNote1))
			expect(storeService.getState().fileSettings.fileNotes.length).toBe(1)

			storeService.dispatch(addFileNote(fileNote2))
			expect(storeService.getState().fileSettings.fileNotes.length).toBe(2)
		})

		it("should have the correct structure", () => {
			storeService.dispatch(addFileNote(fileNote1))

			expect(storeService.getState().fileSettings.fileNotes[0]).toStrictEqual(fileNote1)
		})
	})

	describe("removeFileNote", () => {
		it("should remove a FileNote", () => {
			storeService.dispatch(addFileNote(fileNote1))
			storeService.dispatch(addFileNote(fileNote2))
			storeService.dispatch(removeFileNote(fileNote1))

			expect(storeService.getState().fileSettings.fileNotes.length).toBe(1)
			expect(storeService.getState().fileSettings.fileNotes[0]).toStrictEqual(fileNote2)
		})
	})

	describe("addNotesToFileNote", () => {
		it("should add a note to a FileNote", () => {
			const newNotes1: FileNote = { fileName: fileNote1.fileName, notes: [note1] }
			const newNotes2: FileNote = { fileName: fileNote1.fileName, notes: [note2, note3] }

			storeService.dispatch(addFileNote(fileNote1))
			storeService.dispatch(addNotesToFileNotes(newNotes1))

			expect(storeService.getState().fileSettings.fileNotes[0].notes.length).toBe(1)

			storeService.dispatch(addNotesToFileNotes(newNotes2))

			expect(storeService.getState().fileSettings.fileNotes[0].notes.length).toBe(3)
		})
	})

	describe("removeNoteByIndex", () => {
		it("should remove a note by index", () => {
			const fileName = fileNote1.fileName
			const nodePath = "/root/database.ts"
			const index = 1
			storeService.dispatch(addFileNote(fileNote1))
			storeService.dispatch(addNotesToFileNotes({ fileName: fileNote1.fileName, notes: [note1, note2, note3] }))
			storeService.dispatch(removeNoteByIndex(fileName, nodePath, index))
			expect(storeService.getState().fileSettings.fileNotes[0].notes.length).toBe(2)
			expect(storeService.getState().fileSettings.fileNotes[0].notes[1]).toStrictEqual(note3)
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
