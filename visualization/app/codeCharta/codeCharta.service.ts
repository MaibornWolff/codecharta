interface File { // new cc.json format
	map: Map,
	settings: Partial<Settings>,
	meta: Meta
}

interface Scenario {
	name: string, // meta: ScenarioMeta ???
	settings: Partial<Settings>
}

interface Map {
	nodes: CodeMapNode // readonly
}

interface UrlData {
	filenames: string[], // which RenderMode, when delta wanted, single wanted, although 3 fileNames given?
	settings: Partial<Settings>
}

interface Meta {
	fileName: string,
	apiVersion: string,
	projectName: string,
	// creationDate: Date
}

interface Settings {
	mapSettings: MapSettings,
	appSettings: AppSettings
}

interface MapSettings {
	renderMode: RenderMode,

	neutralColorRange: Range, // ???
	areaMetric: string,
	heightMetric: string,
	colorMetric: string,

	focusedNodePath: string,
	searchedNodePaths: Array<string>,
	searchPattern: string,

	attributeTypes: AttributeTypes,
	blacklist: Array<BlacklistItem>,
	edges: Edge[],
	markedPackages: MarkedPackages[]
}

interface AppSettings {
	amountOfTopLabels: number,
	scaling: Scale,
	camera: Scale,
	margin: number,
	deltaColorFlipped: boolean,
	enableEdgeArrows: boolean,
	hideFlatBuildings: boolean,
	maximizeDetailPanel: boolean,
	invertHeight: boolean,
	dynamicMargin: boolean,
	isWhiteBackground: boolean,
	markingColors: number[], // current highlightColors -> [0xABABAB,...]
	mapColors: MapColors
}

interface MapColors {
	positive: number,
	neutral: number,
	negative: number,
	selected: number,
	defaultC: number,
	positiveDelta: number,
	negativeDelta: number,
	base: number,
	flat: number,
	angularGreen: number
}

enum RenderMode { // current KindOfMap
	Single = "Single",
	Multiple = "Multiple",
	DeltaFrom = "DeltaFrom", // ??? current DataService._lastReferenceMap
	DeltaTo = "DeltaTo" // ??? current DataService._lastComparisonMap
}

class CodeChartaService {

	private importedFiles: File[]
	private importedScenarios: Scenario[]
	private urlData: UrlData
	private renderSettings: Settings

	constructor(
		private codeMapRenderService: CodeMapRenderService,
		private settingsService: SettingsService,
		private dataService: DataService
	) {}

	onChangeImportedFiles() {
		this.importedFiles.forEach(f => this.dataService.decorateFile(f.map))
		this.renderMap()
	}

	onChangeRenderMode() {
		this.resetMapRelatedSettings()
		const usedFiles: File[] = this.importedFiles.filter(f => f.settings.mapSettings.renderMode)
		const mergedSettings: Settings = this.settingsService.mergeMapRelatedSettings(usedFiles)
		this.updateRenderSettings(mergedSettings)
		this.updateRenderSettings(this.urlData.settings)
		this.renderMap()
	}

	onSelectScenario(scenarioName: string) {
		const scenario: Scenario[] = this.importedScenarios.filter(scenario => scenario.name == scenarioName)
		this.updateRenderSettings(scenario[0].settings)
		this.renderMap()
	}

	onLoad() {
		this.setRenderSettings(this.getDefaultSettings())
		this.updateRenderSettings(this.importedFiles[0].settings)
		this.updateRenderSettings(this.urlData.settings)
		this.renderMap()
	}

	setRenderSettings(settings: Settings) {
		this.renderSettings = settings
	}

	updateRenderSettings(partialSettings: Partial<Settings>) {
		this.renderSettings = {...this.renderSettings, ...partialSettings}
	}

	resetMapRelatedSettings() {
		this.renderSettings.mapSettings = this.getDefaultSettings().mapSettings
	}

	renderMap() {
		this.codeMapRenderService.updateMapGeometry(this.renderSettings, this.importedFiles)
	}

	getDefaultSettings(): Settings {
		return {} as Settings
	}
}