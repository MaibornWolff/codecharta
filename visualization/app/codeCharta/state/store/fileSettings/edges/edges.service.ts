import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { EdgesActions, setEdges } from "./edges.actions"
import _ from "lodash"
import { Edge } from "../../../../model/codeCharta.model"
import { getMergedEdges } from "./edges.merger"
import { FilesService, FilesSelectionSubscriber } from "../../files/files.service"
import { Files } from "../../../../model/files"

export interface EdgesSubscriber {
	onEdgesChanged(edges: Edge[])
}

export class EdgesService implements StoreSubscriber, FilesSelectionSubscriber {
	private static EDGES_CHANGED_EVENT = "edges-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		FilesService.subscribeToFilesSelection(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(EdgesActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	public onFilesSelectionChanged(files: Files) {
		this.merge(files)
	}

	private merge(files: Files) {
		const visibleFiles = files.getVisibleFileStates().map(x => x.file)
		const withUpdatedPath = files.isPartialState()
		const newEdges = getMergedEdges(visibleFiles, withUpdatedPath)
		this.storeService.dispatch(setEdges(newEdges))
	}

	private select() {
		return this.storeService.getState().fileSettings.edges
	}

	private notify(newState: Edge[]) {
		this.$rootScope.$broadcast(EdgesService.EDGES_CHANGED_EVENT, { edges: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: EdgesSubscriber) {
		$rootScope.$on(EdgesService.EDGES_CHANGED_EVENT, (event, data) => {
			subscriber.onEdgesChanged(data.edges)
		})
	}
}
