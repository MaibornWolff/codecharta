import {
	BlacklistItem,
	ColorRange,
	DynamicSettings,
	FileSettings,
	FileState,
	MapColors,
	RecursivePartial,
	Settings
} from "../codeCharta.model"
import _ from "lodash"
import { IRootScopeService, ITimeoutService } from "angular"
import { FileStateService, FileStateServiceSubscriber } from "./fileState.service"
import { FileStateHelper } from "../util/fileStateHelper"
import { SettingsMerger } from "../util/settingsMerger"
import { Vector3 } from "three"
import { LoadingGifService } from "../ui/loadingGif/loadingGif.service"

export interface SettingsServiceSubscriber {
	onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>)
}

export interface BlacklistSubscriber {
	onBlacklistChanged(blacklist: BlacklistItem[])
}

export class SettingsService implements FileStateServiceSubscriber {
	private static SETTINGS_CHANGED_EVENT = "settings-changed"
	private static BLACKLIST_CHANGED_EVENT = "blacklist-changed"
	private static DEBOUNCE_TIME = 400

	private settings: Settings
	private update: RecursivePartial<Settings> = {}
	private readonly debounceBroadcast: () => void

	constructor(private $rootScope: IRootScopeService, private $timeout: ITimeoutService, private loadingGifService: LoadingGifService) {
		this.settings = this.getDefaultSettings()
		this.debounceBroadcast = _.debounce(this.notifySubscribers, SettingsService.DEBOUNCE_TIME)
		FileStateService.subscribe(this.$rootScope, this)
	}

	public onFileSelectionStatesChanged(fileStates: FileState[]) {
		this.resetDynamicAndFileSettings(fileStates)
	}

	public onImportedFilesChanged(fileStates: FileState[]) {}

	public getSettings(): Settings {
		return this.settings
	}

	public updateSettings(update: RecursivePartial<Settings>, isSilent: boolean = false) {
		this.settings = this.mergePartialSettings(this.settings, update, this.settings) as Settings
		if (!isSilent) {
			this.loadingGifService.updateLoadingMapFlag(true)
			this.update = this.mergePartialSettings(this.update, update, this.settings)

			if (update && update.fileSettings && update.fileSettings.blacklist) {
				this.notifyBlacklistSubscribers()
			} else {
				this.debounceBroadcast()
			}
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
		const colorRange: ColorRange = { from: null, to: null }

		const settings: Settings = {
			fileSettings: {
				attributeTypes: { nodes: [], edges: [] },
				blacklist: [],
				edges: [],
				markedPackages: []
			},
			dynamicSettings: {
				areaMetric: null,
				heightMetric: null,
				colorMetric: null,
				distributionMetric: null,
				focusedNodePath: "",
				searchedNodePaths: [],
				searchPattern: "",
				margin: null,
				colorRange: colorRange
			},
			appSettings: {
				amountOfTopLabels: 1,
				scaling: scaling,
				camera: camera,
				enableEdgeArrows: true,
				hideFlatBuildings: true,
				maximizeDetailPanel: false,
				invertColorRange: false,
				invertDeltaColors: false,
				invertHeight: false,
				dynamicMargin: true,
				isWhiteBackground: false,
				whiteColorBuildings: false,
				mapColors: mapColors,
				isPresentationMode: false
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
			colorRange: defaultSettings.dynamicSettings.colorRange
		}
	}

	private getNewFileSettings(fileStates: FileState[]): FileSettings {
		let withUpdatedPath = !!FileStateHelper.isPartialState(fileStates)
		let visibleFiles = FileStateHelper.getVisibleFileStates(fileStates).map(x => x.file)
		return SettingsMerger.getMergedFileSettings(visibleFiles, withUpdatedPath)
	}

	private mergePartialSettings(
		mergedSettings: RecursivePartial<Settings>,
		newSettings: RecursivePartial<Settings>,
		initialSettings: Settings
	): Settings | RecursivePartial<Settings> {
		for (let key of Object.keys(initialSettings)) {
			if (mergedSettings.hasOwnProperty(key) && newSettings.hasOwnProperty(key)) {
				if (_.isObject(mergedSettings[key]) && !_.isArray(mergedSettings[key])) {
					if (this.containsArrayObject(newSettings[key])) {
						mergedSettings[key] = this.mergePartialSettings(mergedSettings[key], newSettings[key], initialSettings[key])
					} else {
						mergedSettings[key] = _.merge(mergedSettings[key], newSettings[key])
					}
				} else {
					mergedSettings[key] = newSettings[key]
				}
			} else if (newSettings.hasOwnProperty(key)) {
				mergedSettings[key] = newSettings[key]
			}
		}
		return mergedSettings
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

	private resetDynamicAndFileSettings(fileStates: FileState[]) {
		this.updateSettings({
			dynamicSettings: this.getDefaultDynamicSettingsWithoutMetrics()
		})
		this.updateSettings({
			fileSettings: this.getNewFileSettings(fileStates)
		})
	}

	private notifySubscribers() {
		this.$rootScope.$broadcast(SettingsService.SETTINGS_CHANGED_EVENT, { settings: this.settings, update: this.update })
		this.update = {}
	}

	private notifyBlacklistSubscribers() {
		this.$rootScope.$broadcast(SettingsService.BLACKLIST_CHANGED_EVENT, { blacklist: this.settings.fileSettings.blacklist })
	}

	private synchronizeAngularTwoWayBinding() {
		this.$timeout(() => {})
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: SettingsServiceSubscriber) {
		$rootScope.$on(SettingsService.SETTINGS_CHANGED_EVENT, (event, data) => {
			subscriber.onSettingsChanged(data.settings, data.update)
		})
	}

	public static subscribeToBlacklist($rootScope: IRootScopeService, subscriber: BlacklistSubscriber) {
		$rootScope.$on(SettingsService.BLACKLIST_CHANGED_EVENT, (event, data) => {
			subscriber.onBlacklistChanged(data.blacklist)
		})
	}
}
