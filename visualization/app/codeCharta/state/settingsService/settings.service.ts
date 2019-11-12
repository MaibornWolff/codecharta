import { ColorRange, DynamicSettings, FileSettings, FileState, MapColors, RecursivePartial, Settings } from "../../codeCharta.model"
import _ from "lodash"
import { IRootScopeService, ITimeoutService } from "angular"
import { FileStateService, FileStateServiceSubscriber } from "../fileState.service"
import { FileStateHelper } from "../../util/fileStateHelper"
import { SettingsMerger } from "../../util/settingsMerger"
import { Vector3 } from "three"
import { LoadingStatusService } from "../loadingStatus.service"
import {
	AreaMetricSubscriber,
	BlacklistSubscriber,
	ColorMetricSubscriber,
	DistributionMetricSubscriber,
	EdgeMetricSubscriber,
	HeightMetricSubscriber,
	SearchPatternSubscriber,
	SettingsEvents,
	SettingsServiceSubscriber,
	FocusNodeSubscriber,
	UnfocusNodeSubscriber
} from "./settings.service.events"

export class SettingsService implements FileStateServiceSubscriber {
	private static DEBOUNCE_TIME = 400

	private settings: Settings
	private update: RecursivePartial<Settings> = {}
	private readonly debounceBroadcast: { [key: string]: (eventName: string, data: any) => void } = {}

	constructor(
		private $rootScope: IRootScopeService,
		private $timeout: ITimeoutService,
		private loadingStatusService: LoadingStatusService
	) {
		this.settings = this.getDefaultSettings()

		for (const key in SettingsEvents) {
			this.debounceBroadcast[SettingsEvents[key]] = _.debounce((eventName: string, data: any) => {
				if (eventName == SettingsEvents.SETTINGS_CHANGED_EVENT) {
					this.update = {}
				} else if (this.update.dynamicSettings && eventName == SettingsEvents.EDGE_METRIC_CHANGED_EVENT) {
					delete this.update.dynamicSettings.edgeMetric
				} else if (this.update.dynamicSettings && eventName == SettingsEvents.AREA_METRIC_CHANGED_EVENT) {
					delete this.update.dynamicSettings.areaMetric
				} else if (this.update.dynamicSettings && eventName == SettingsEvents.HEIGHT_METRIC_CHANGED_EVENT) {
					delete this.update.dynamicSettings.heightMetric
				} else if (this.update.dynamicSettings && eventName == SettingsEvents.COLOR_METRIC_CHANGED_EVENT) {
					delete this.update.dynamicSettings.colorMetric
				} else if (this.update.fileSettings && eventName == SettingsEvents.BLACKLIST_CHANGED_EVENT) {
					delete this.update.fileSettings.blacklist
				} else if (this.update.dynamicSettings && eventName == SettingsEvents.DISTRIBUTION_METRIC_CHANGED_EVENT) {
					delete this.update.dynamicSettings.distributionMetric
				} else if (this.update.dynamicSettings && eventName == SettingsEvents.SEARCH_PATTERN_CHANGED_EVENT) {
					delete this.update.dynamicSettings.searchPattern
				} else if (
					this.update.dynamicSettings &&
					(eventName == SettingsEvents.NODE_FOCUSED_EVENT || eventName == SettingsEvents.NODE_UNFOCUSED_EVENT)
				) {
					delete this.update.dynamicSettings.focusedNodePath
				}
				this.$rootScope.$broadcast(eventName, data)
			}, SettingsService.DEBOUNCE_TIME)
		}

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
			this.loadingStatusService.updateLoadingMapFlag(true)
			this.update = this.mergePartialSettings(this.update, update, this.settings)
			this.notifySettingsSubscribers()

			if (update.fileSettings && update.fileSettings.blacklist) {
				this.notifyBlacklistSubscribers()
			}

			if (update.dynamicSettings) {
				if (update.dynamicSettings.areaMetric) {
					this.notifyAreaMetricSubscribers()
				}

				if (update.dynamicSettings.heightMetric) {
					this.notifyHeightMetricSubscribers()
				}

				if (update.dynamicSettings.colorMetric) {
					this.notifyColorMetricSubscribers()
				}

				if (update.dynamicSettings.edgeMetric) {
					this.notifyEdgeMetricSubscribers()
				}

				if (update.dynamicSettings.distributionMetric) {
					this.notifyDistributionMetricSubscribers()
				}

				if (update.dynamicSettings.searchPattern) {
					this.notifySearchPatternSubscribers()
				}
				if (update.dynamicSettings.focusedNodePath !== undefined) {
					if (_.isEmpty(update.dynamicSettings.focusedNodePath)) {
						this.notifyUnfocusNodeSubscribers()
					}
					if (!_.isEmpty(update.dynamicSettings.focusedNodePath)) {
						this.notifyFocusNodeSubscribers()
					}
				}
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
			markingColors: ["#FF1D8E", "#1d8eff", "#1DFFFF", "#8eff1d", "#8e1dff", "#FFFF1D"],
			incomingEdge: "#00ffff",
			outgoingEdge: "#ff00ff"
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
				edgeMetric: null,
				focusedNodePath: "",
				searchedNodePaths: [],
				searchPattern: "",
				margin: null,
				colorRange: colorRange
			},
			appSettings: {
				amountOfTopLabels: 1,
				amountOfEdgePreviews: 1,
				edgeHeight: 4,
				scaling: scaling,
				camera: camera,
				hideFlatBuildings: true,
				invertColorRange: false,
				invertDeltaColors: false,
				invertHeight: false,
				dynamicMargin: true,
				isWhiteBackground: false,
				whiteColorBuildings: false,
				mapColors: mapColors,
				isPresentationMode: false,
				showOnlyBuildingsWithEdges: false,
				resetCameraIfNewFileIsLoaded: true
			},
			treeMapSettings: {
				mapSize: 250
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

	private notifySettingsSubscribers() {
		this.notify(SettingsEvents.SETTINGS_CHANGED_EVENT, {
			settings: this.settings,
			update: this.update
		})
	}

	private notifyBlacklistSubscribers() {
		this.notify(SettingsEvents.BLACKLIST_CHANGED_EVENT, { blacklist: this.settings.fileSettings.blacklist })
	}

	private notifyAreaMetricSubscribers() {
		this.notify(SettingsEvents.AREA_METRIC_CHANGED_EVENT, { areaMetric: this.settings.dynamicSettings.areaMetric })
	}

	private notifyHeightMetricSubscribers() {
		this.notify(SettingsEvents.HEIGHT_METRIC_CHANGED_EVENT, { heightMetric: this.settings.dynamicSettings.heightMetric })
	}

	private notifyColorMetricSubscribers() {
		this.notify(SettingsEvents.COLOR_METRIC_CHANGED_EVENT, { colorMetric: this.settings.dynamicSettings.colorMetric })
	}

	private notifyEdgeMetricSubscribers() {
		this.notify(SettingsEvents.EDGE_METRIC_CHANGED_EVENT, { edgeMetric: this.settings.dynamicSettings.edgeMetric })
	}

	private notifyDistributionMetricSubscribers() {
		this.notify(SettingsEvents.DISTRIBUTION_METRIC_CHANGED_EVENT, {
			distributionMetric: this.settings.dynamicSettings.distributionMetric
		})
	}

	private notifySearchPatternSubscribers() {
		this.notify(SettingsEvents.SEARCH_PATTERN_CHANGED_EVENT, { searchPattern: this.settings.dynamicSettings.searchPattern })
	}

	private notifyFocusNodeSubscribers() {
		this.notify(SettingsEvents.NODE_FOCUSED_EVENT, { focusedNodePath: this.settings.dynamicSettings.focusedNodePath })
	}

	private notifyUnfocusNodeSubscribers() {
		this.notify(SettingsEvents.NODE_UNFOCUSED_EVENT, { focusedNodePath: this.settings.dynamicSettings.focusedNodePath })
	}

	private notify(eventName: string, data: object) {
		this.debounceBroadcast[eventName](eventName, data)
	}

	private synchronizeAngularTwoWayBinding() {
		this.$timeout(() => {})
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: SettingsServiceSubscriber) {
		$rootScope.$on(SettingsEvents.SETTINGS_CHANGED_EVENT, (event, data) => {
			subscriber.onSettingsChanged(data.settings, data.update)
		})
	}

	public static subscribeToBlacklist($rootScope: IRootScopeService, subscriber: BlacklistSubscriber) {
		$rootScope.$on(SettingsEvents.BLACKLIST_CHANGED_EVENT, (event, data) => {
			subscriber.onBlacklistChanged(data.blacklist)
		})
	}

	public static subscribeToAreaMetric($rootScope: IRootScopeService, subscriber: AreaMetricSubscriber) {
		$rootScope.$on(SettingsEvents.AREA_METRIC_CHANGED_EVENT, (event, data) => {
			subscriber.onAreaMetricChanged(data.areaMetric)
		})
	}

	public static subscribeToHeightMetric($rootScope: IRootScopeService, subscriber: HeightMetricSubscriber) {
		$rootScope.$on(SettingsEvents.HEIGHT_METRIC_CHANGED_EVENT, (event, data) => {
			subscriber.onHeightMetricChanged(data.heightMetric)
		})
	}

	public static subscribeToColorMetric($rootScope: IRootScopeService, subscriber: ColorMetricSubscriber) {
		$rootScope.$on(SettingsEvents.COLOR_METRIC_CHANGED_EVENT, (event, data) => {
			subscriber.onColorMetricChanged(data.colorMetric)
		})
	}

	public static subscribeToEdgeMetric($rootScope: IRootScopeService, subscriber: EdgeMetricSubscriber) {
		$rootScope.$on(SettingsEvents.EDGE_METRIC_CHANGED_EVENT, (event, data) => {
			subscriber.onEdgeMetricChanged(data.edgeMetric)
		})
	}

	public static subscribeToDistributionMetric($rootScope: IRootScopeService, subscriber: DistributionMetricSubscriber) {
		$rootScope.$on(SettingsEvents.DISTRIBUTION_METRIC_CHANGED_EVENT, (event, data) => {
			subscriber.onDistributionMetricChanged(data.distributionMetric)
		})
	}

	public static subscribeToSearchPattern($rootScope: IRootScopeService, subscriber: SearchPatternSubscriber) {
		$rootScope.$on(SettingsEvents.SEARCH_PATTERN_CHANGED_EVENT, (event, data) => {
			subscriber.onSearchPatternChanged(data.searchPattern)
		})
	}

	public static subscribeToFocusNode($rootScope: IRootScopeService, subscriber: FocusNodeSubscriber) {
		$rootScope.$on(SettingsEvents.NODE_FOCUSED_EVENT, (event, data) => {
			subscriber.onFocusNode(data.focusedNodePath)
		})
	}

	public static subscribeToUnfocusNode($rootScope: IRootScopeService, subscriber: UnfocusNodeSubscriber) {
		$rootScope.$on(SettingsEvents.NODE_UNFOCUSED_EVENT, (event, data) => {
			subscriber.onUnfocusNode()
		})
	}
}
