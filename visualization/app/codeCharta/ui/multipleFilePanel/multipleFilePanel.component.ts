import { Settings, SettingsService, SettingsServiceSubscriber } from "../../core/settings/settings.service"
import "./multipleFilePanel.component.scss"
import { DataModel, DataService, DataServiceSubscriber } from "../../core/data/data.service"
import { CodeMap } from "../../core/data/model/CodeMap"
import { MultipleFileService } from "../../core/multipleFile/multipleFile.service"

export class MultipleFilePanelController implements DataServiceSubscriber, SettingsServiceSubscriber {
	public settings: Settings
	public data: DataModel
	public revisions: CodeMap[]
	public selectedMapIndices: number[]
	public mapsToAggregate: CodeMap[]

	/* @ngInject */
	constructor(
		private settingsService: SettingsService,
		private dataService: DataService,
		private multipleFileService: MultipleFileService
	) {
		this.revisions = dataService.data.revisions
		this.settings = settingsService.settings
		this.data = dataService.data
		this.dataService.subscribe(this)
		this.settingsService.subscribe(this)
		this.mapsToAggregate = [] as CodeMap[]
		this.updateSelectedMapIndices()
	}

	public onMultipleChange() {
		this.selectMapsToAggregate()

		let newMap = this.multipleFileService.aggregateMaps(JSON.parse(JSON.stringify(this.mapsToAggregate)))

		this.settings.map = newMap
		this.settings.blacklist = newMap.blacklist

		this.settingsService.applySettings(this.settings)
	}

	public onDataChanged(data: DataModel) {
		this.data = data
		this.revisions = data.revisions
		this.updateSelectedMapIndices()
	}

	public onSettingsChanged(settings: Settings, event: Event) {
		this.settings = settings
	}

	public selectAllRevisions() {
		this.selectedMapIndices = []
		for (let i = 0; i < this.revisions.length; i++) {
			this.selectedMapIndices.push(i)
		}
		this.onMultipleChange()
	}

	public selectNoRevisions() {
		this.selectedMapIndices = []
		this.onMultipleChange()
	}

	public intertRevisionSelection() {
		const oldRevisions = this.selectedMapIndices.map(Number)
		this.selectedMapIndices = []
		for (let i = 0; i < this.revisions.length; i++) {
			if (!oldRevisions.includes(i)) {
				this.selectedMapIndices.push(i)
			}
		}
		this.onMultipleChange()
	}

	private updateSelectedMapIndices() {
		this.selectedMapIndices = []
		for (let i = 0; i < this.revisions.length; i++) {
			this.selectedMapIndices.push(i)
		}
	}

	private selectMapsToAggregate() {
		this.mapsToAggregate = [] as CodeMap[]
		for (let position of this.selectedMapIndices) {
			let currentCodeMap = this.revisions[position]
			this.mapsToAggregate.push(currentCodeMap)
		}
	}
}

export const multipleFilePanelComponent = {
	selector: "multipleFilePanelComponent",
	template: require("./multipleFilePanel.component.html"),
	controller: MultipleFilePanelController
}
