import { Settings, Vector3d, RenderMode, MapColors, RecursivePartial } from "../../codeCharta.model"
import _ from "lodash"
import { IRootScopeService, IAngularEvent } from "angular";

export interface SettingsServiceSubscriber {
	onSettingsChanged(settings: Settings, event: IAngularEvent)
}

export class SettingsService {

    public static SELECTOR = "settingsService"
    private static SETTINGS_CHANGED_EVENT = "settings-changed";
	private static MIN_MARGIN = 15

	private settings: Settings 
	throttledBroadcast: ()=>void;

	constructor(private $rootScope) {
		this.settings = this.getDefaultSettings()
		this.throttledBroadcast = _.throttle(() => this.$rootScope.$broadcast(SettingsService.SETTINGS_CHANGED_EVENT, this.settings), 400)
	}

	public getSettings(): Settings {
		return this.settings
	}

	public updateSettings(update: RecursivePartial<Settings>) {
		// TODO wo und wann this.settings.margin = this.computeMargin(settings); ?
		this.settings = _.merge(this.settings, update)
		this.throttledBroadcast()
	}

	/* TODO this needs to be called at other places, this cannot be here
	private potentiallyUpdateColorRange(update: RecursivePartial<Settings>): RecursivePartial<Settings> {
		if (update.mapSettings.colorMetric) {
			update.appSettings.neutralColorRange = this.getAdaptedRange(update.mapSettings.colorMetric)
		}
		return update
	}*/

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

		const scaling: Vector3d = {
			x: 1,
			y: 1,
			z: 1
		}

		const camera: Vector3d = {
			x: 0,
			y: 300,
			z: 1000
		}

		let settings: Settings = {
			mapSettings: {
				renderMode: RenderMode.Single,
				areaMetric: "",
				heightMetric: "",
				colorMetric: "",
				focusedNodePath: null,
				searchedNodePaths: [],
				searchPattern: null,
				attributeTypes: {},
				blacklist: [],
				edges: []
			},
			appSettings: {
				amountOfTopLabels: 1,
				scaling: scaling,
				camera: camera,
				margin: SettingsService.MIN_MARGIN,
				neutralColorRange: null,
				deltaColorFlipped: false,
				enableEdgeArrows: true,
				hideFlatBuildings: true,
				maximizeDetailPanel: false,
				invertHeight: false,
				dynamicMargin: true,
				isWhiteBackground: false,
				whiteColorBuildings: false,
				mapColors: mapColors
			}
		}

		return settings
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: SettingsServiceSubscriber) {
		$rootScope.$on(SettingsService.SETTINGS_CHANGED_EVENT, (event, data) => {
			subscriber.onSettingsChanged(data, event)
		})
	}

	/* TODO someone else does this
    public onDataChanged(data: DataModel) {

        if(data.metrics && data.renderMap && data.revisions) {
            this.settings.map = data.renderMap;
            this.settings.blacklist = data.renderMap.blacklist;

            if (data.metrics.indexOf(this.settings.areaMetric) === -1) {
                this.settings.areaMetric = this.getMetricByIdOrLast(0, data.metrics);
            }

            if (data.metrics.indexOf(this.settings.heightMetric) === -1) {
                this.settings.heightMetric = this.getMetricByIdOrLast(1, data.metrics);
            }

            if (data.metrics.indexOf(this.settings.colorMetric) === -1) {
                this.settings.colorMetric = this.getMetricByIdOrLast(2, data.metrics);
            }

            this.onSettingsChanged();
        }

    }*/

	/* TODO someone else does this, updateSettingsMethod should offer silent flag (no event triggered)
    public onCameraChanged(camera: PerspectiveCamera) {
        if (
            this.settings.camera.x !== camera.position.x ||
            this.settings.camera.y !== camera.position.y ||
            this.settings.camera.z !== camera.position.z
        ) {
            this.settings.camera.x = camera.position.x;
            this.settings.camera.y = camera.position.y;
            this.settings.camera.z = camera.position.z;
            // There is no component in CC which needs live updates when camera changes. Broadcasting an
            // onSettingsChanged Event would cause big performance issues
            // this.onSettingsChanged();
        }
    }*/

	/* TODO move 
    public updateSettingsFromUrl() {

        let iterateProperties = (obj, prefix) => {
            for (let i in obj) {
                if (obj.hasOwnProperty(i) && i !== "map" && i) {

                    if (typeof obj[i] === "string" || obj[i] instanceof String) {
                        //do not iterate over strings
                    } else {
                        iterateProperties(obj[i], i + ".");
                    }

                    const res = this.urlService.getParam(prefix + i);

                    if (res) {

                        if (res == "true") {
                            obj[i] = true;
                        } else if (res == "false") {
                            obj[i] = false;
                        } else if (res === 0 || res) {

                            let val = parseFloat(res);

                            if (isNaN(val)) {
                                val = res;
                            }

                            obj[i] = val;
                        } else {
                            obj[i] = res;
                        }

                        // if we work with strings here it can cause errors in other parts of the app, check with console.log(typeof obj[i], obj[i]);
                    }

                }
            }
        };

        iterateProperties(this.settings, "");


        this.onSettingsChanged();

    }
    */

    /* TODO move
    	//private static MAX_MARGIN = 100

    public computeMargin(s: Settings = this.settings): number {
        if (s.map !== null && s.dynamicMargin) {
            let leaves = hierarchy<CodeMapNode>(s.map.nodes).leaves();
            let numberOfBuildings = 0;
            let totalArea = 0;

            leaves.forEach((node: HierarchyNode<CodeMapNode>) => {
                numberOfBuildings++;
                if(node.data.attributes && node.data.attributes[s.areaMetric]){
                    totalArea += node.data.attributes[s.areaMetric];
                }
            });

            let margin: number = SettingsService.MARGIN_FACTOR * Math.round(Math.sqrt((totalArea / numberOfBuildings)));
            return Math.min(SettingsService.MAX_MARGIN, Math.max(SettingsService.MIN_MARGIN, margin));
        } else {
            return s.margin;
        }
    }*/
}
