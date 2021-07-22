import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { FileNotesActions } from "./fileNotes.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface FileNote {
	fileName: string
	notes: Note[]
}

export interface Note {
	nodePath: string
	text: string
	metricData: string[]
}

export interface FileNotesSubscriber {
	onFileNotesChanged(fileNotes: FileNote[])
}

export class FileNotesService implements StoreSubscriber {
	private static FILE_NOTES_CHANGED_EVENT = "file-notes-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, FileNotesActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().fileSettings.fileNotes
	}

	private notify(newState: FileNote[]) {
		this.$rootScope.$broadcast(FileNotesService.FILE_NOTES_CHANGED_EVENT, { fileNotes: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: FileNotesSubscriber) {
		$rootScope.$on(FileNotesService.FILE_NOTES_CHANGED_EVENT, (_event, data) => {
			subscriber.onFileNotesChanged(data.fileNotes)
		})
	}
}
