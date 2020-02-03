import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { EdgesActions, setEdges } from "./edges.actions"
import _ from "lodash"
import { Edge, FileState } from "../../../../codeCharta.model"
import { FileStateService, FileStateSubscriber } from "../../../fileState.service"
import { getMergedEdges } from "./edges.reset"
import { FileStateHelper } from "../../../../util/fileStateHelper"

export interface EdgesSubscriber {
	onEdgesChanged(edges: Edge[])
}

export class EdgesService implements StoreSubscriber, FileStateSubscriber {
	private static EDGES_CHANGED_EVENT = "edges-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(EdgesActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	public onFileStatesChanged(fileStates: FileState[]) {
		this.merge(fileStates)
	}

	public merge(fileStates: FileState[]) {
		const visibleFiles = FileStateHelper.getVisibleFileStates(fileStates).map(x => x.file)
		const withUpdatedPath = FileStateHelper.isPartialState(fileStates)
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
