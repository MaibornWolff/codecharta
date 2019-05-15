import { ColorRange, DynamicSettings, FileSettings, FileState, MapColors, RecursivePartial, Settings } from "../codeCharta.model"
import _ from "lodash"
import { IAngularEvent, IRootScopeService, ITimeoutService } from "angular"
import { FileStateService, FileStateServiceSubscriber } from "./fileState.service"
import { FileStateHelper } from "../util/fileStateHelper"
import { SettingsMerger } from "../util/settingsMerger"
import { Vector3 } from "three"
import { LoadingGifService } from "../ui/loadingGif/loadingGif.service"

export interface SettingsServiceSubscriber {
	onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: IAngularEvent)
}

export class SettingsService implements FileStateServiceSubscriber {
	private static SETTINGS_CHANGED_EVENT = "settings-changed"

	private settings: Settings
	private readonly debounceBroadcast: (update: RecursivePartial<Settings>) => void

	constructor(private $rootScope: IRootScopeService, private $timeout: ITimeoutService, private loadingGifService: LoadingGifService) {
		this.settings = this.getDefaultSettings()
		this.debounceBroadcast = _.debounce(
			(update: RecursivePartial<Settings>) =>
				this.$rootScope.$broadcast(SettingsService.SETTINGS_CHANGED_EVENT, { settings: this.settings, update: update }),
			400
		)
		FileStateService.subscribe(this.$rootScope, this)
	}

	public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		this.updateSettings({
			dynamicSettings: this.getDefaultDynamicSettingsWithoutMetrics()
		})
		this.updateSettings({
			fileSettings: this.getNewFileSettings(fileStates)
		})
	}

	public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {}

	public getSettings(): Settings {
		return this.settings
	}

	public updateSettings(update: RecursivePartial<Settings>, isSilent: boolean = false) {
		// _.merge(this.settings, update) didnt work with arrays like blacklist
		this.settings = this.updateSettingsUsingPartialSettings(this.settings, update)
		if (!isSilent) {
			this.loadingGifService.updateLoadingMapFlag(true)
			this.debounceBroadcast(update)
		}
		this.synchronizeAngularTwoWayBinding()
	}

	public getDefaultSettings(): Settings {
		const mapColors: MapColors = {
			positive: "#69AE40",
			neutral: "#ddcc00",
			negative: "#820E0E",
			selected: "#EB8319",
			defaultC: "#89ACB4",
			positiveDelta: "#69FF40",
			negativeDelta: "#ff0E0E",
			base: "#666666",
			flat: "#AAAAAA",
			lightGrey: "#DDDDDD",
			angularGreen: "#00BFA5",
			markingColors: ["#FF1D8E", "#1d8eff", "#1DFFFF", "#8eff1d", "#8e1dff", "#FFFF1D"]
		}

		const scaling: Vector3 = new Vector3(1, 1, 1)
		const camera: Vector3 = new Vector3(0, 300, 1000)
		const colorRange: ColorRange = { flipped: false, from: null, to: null }

		let settings: Settings = {
			fileSettings: {
				attributeTypes: {},
				blacklist: [],
				edges: [],
				markedPackages: []
			},
			dynamicSettings: {
				areaMetric: null,
				heightMetric: null,
				colorMetric: null,
				focusedNodePath: "",
				searchedNodePaths: [],
				searchPattern: "",
				margin: null,
				neutralColorRange: colorRange
			},
			appSettings: {
				amountOfTopLabels: 1,
				scaling: scaling,
				camera: camera,
				deltaColorFlipped: false,
				enableEdgeArrows: true,
				hideFlatBuildings: true,
				maximizeDetailPanel: false,
				invertHeight: false,
				dynamicMargin: true,
				isWhiteBackground: false,
				whiteColorBuildings: false,
				mapColors: mapColors
			},
			treeMapSettings: {
				mapSize: 500
			}
		}

		return settings
	}

	private getDefaultDynamicSettingsWithoutMetrics(): RecursivePartial<DynamicSettings> {
		const defaultSettings = this.getDefaultSettings()
		return {
			focusedNodePath: defaultSettings.dynamicSettings.focusedNodePath,
			searchedNodePaths: defaultSettings.dynamicSettings.searchedNodePaths,
			searchPattern: defaultSettings.dynamicSettings.searchPattern,
			margin: defaultSettings.dynamicSettings.margin,
			neutralColorRange: defaultSettings.dynamicSettings.neutralColorRange
		}
	}

	private getNewFileSettings(fileStates: FileState[]): FileSettings {
		let withUpdatedPath = !!FileStateHelper.isPartialState(fileStates)
		let visibleFiles = FileStateHelper.getVisibleFileStates(fileStates).map(x => x.file)
		return SettingsMerger.getMergedFileSettings(visibleFiles, withUpdatedPath)
	}

	private updateSettingsUsingPartialSettings(settings: Settings, update: RecursivePartial<Settings>): Settings {
		for (let key of Object.keys(settings)) {
			if (update.hasOwnProperty(key)) {
				if (_.isObject(settings[key]) && !_.isArray(settings[key])) {
					if (this.containsArrayObject(update[key])) {
						settings[key] = this.updateSettingsUsingPartialSettings(settings[key], update[key])
					} else {
						settings[key] = _.merge(settings[key], update[key])
					}
				} else {
					settings[key] = update[key]
				}
			}
		}
		return settings
	}

	private containsArrayObject(obj: Object): boolean {
		if (obj) {
			for (let key of Object.keys(obj)) {
				if (typeof obj[key] === "object") {
					if (_.isArray(obj[key])) {
						return true
					} else {
						return this.containsArrayObject(obj[key])
					}
				}
			}
		}
		return false
	}

	private synchronizeAngularTwoWayBinding() {
		this.$timeout(() => {})
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: SettingsServiceSubscriber) {
		$rootScope.$on(SettingsService.SETTINGS_CHANGED_EVENT, (event, data) => {
			subscriber.onSettingsChanged(data.settings, data.update, event)
		})
	}
}
