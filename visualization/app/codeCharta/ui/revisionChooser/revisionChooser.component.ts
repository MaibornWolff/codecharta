import { DataServiceSubscriber, DataService, DataModel } from "../../core/data/data.service"
import { KindOfMap, Settings, SettingsService } from "../../core/settings/settings.service"
import { CodeMap } from "../../core/data/model/CodeMap"
import "./revisionChooser.component.scss"
import "./revisionChooserFileDropDown.component.scss"

/**
 * Controls the RevisionChooser
 */
export class RevisionChooserController implements DataServiceSubscriber {
	public revisions: CodeMap[]
	public settings: Settings
	public ui = {
		chosenReference: null,
		chosenComparison: null
	}
	public show = KindOfMap

	/* @ngInject */

	/**
	 * @listens {data-changed}
	 * @constructor
	 * @param {DataService} dataService
	 */
	constructor(private dataService: DataService, private settingsService: SettingsService, private $rootScope) {
		this.revisions = dataService.data.revisions
		this.settings = settingsService.settings
		this.ui.chosenComparison = this.dataService.getIndexOfMap(this.dataService.getComparisonMap(), this.revisions)
		this.ui.chosenReference = this.dataService.getIndexOfMap(this.dataService.getReferenceMap(), this.revisions)
		dataService.subscribe(this)
		this.$rootScope.$on("revision-mode-changed", (event, data) => {
			this.show = data
		})
	}

	public onDataChanged(data: DataModel) {
		this.revisions = data.revisions
		this.ui.chosenComparison = this.dataService.getIndexOfMap(this.dataService.getComparisonMap(), this.revisions)
		this.ui.chosenReference = this.dataService.getIndexOfMap(this.dataService.getReferenceMap(), this.revisions)
	}

	public onReferenceChange(mapIndex: number) {
		this.dataService.setReferenceMap(mapIndex)
	}

	public onComparisonChange(mapIndex: number) {
		this.dataService.setComparisonMap(mapIndex)
	}

	public onShowChange(settings: Settings) {
		this.settings = settings
		this.settingsService.applySettings()
		this.dataService.setReferenceMap(this.ui.chosenReference)
	}
}

export const revisionChooserComponent = {
	selector: "revisionChooserComponent",
	template: require("./revisionChooser.component.html"),
	controller: RevisionChooserController
}
export const revisionChooserFileDropDownComponent = {
	selector: "revisionChooserFileDropDownComponent",
	template: require("./revisionChooserFileDropDown.component.html"),
	controller: RevisionChooserController
}
