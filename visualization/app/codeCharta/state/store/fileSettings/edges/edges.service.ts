import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { EdgesActions, setEdges } from "./edges.actions"
import { Edge } from "../../../../codeCharta.model"
import { getMergedEdges } from "./edges.merger"
import { FilesService, FilesSelectionSubscriber } from "../../files/files.service"
import { isActionOfType } from "../../../../util/reduxHelper"
import { getVisibleFiles, isPartialState } from "../../../../model/files/files.helper"
import { FileState } from "../../../../model/files/files"

export interface EdgesSubscriber {
	onEdgesChanged(edges: Edge[])
}

export class EdgesService implements StoreSubscriber, FilesSelectionSubscriber {
	private static EDGES_CHANGED_EVENT = "edges-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, EdgesActions)) {
			this.notify(this.select())
		}
	}

	onFilesSelectionChanged(files: FileState[]) {
		this.merge(files)
	}

	private merge(files: FileState[]) {
		const visibleFiles = getVisibleFiles(files)
		const withUpdatedPath = isPartialState(files)
		const newEdges = getMergedEdges(visibleFiles, withUpdatedPath)
		this.storeService.dispatch(setEdges(newEdges))
	}

	private select() {
		return this.storeService.getState().fileSettings.edges
	}

	private notify(newState: Edge[]) {
		this.$rootScope.$broadcast(EdgesService.EDGES_CHANGED_EVENT, { edges: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: EdgesSubscriber) {
		$rootScope.$on(EdgesService.EDGES_CHANGED_EVENT, (_event_, data) => {
			subscriber.onEdgesChanged(data.edges)
		})
	}
}
