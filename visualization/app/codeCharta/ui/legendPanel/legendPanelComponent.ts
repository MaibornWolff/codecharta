import {DataServiceSubscriber, DataService, DataModel} from "../../core/data/data.service";
import {SettingsServiceSubscriber, SettingsService, Settings, Range} from "../../core/settings/settings.service";
import $ from "jquery";
import {MapColors} from "../codeMap/rendering/renderSettings";
import {ITimeoutService} from "angular";
import {STATISTIC_OPS} from "../../core/statistic/statistic.service";
import "./legendPanel.scss";

export class LegendPanelController implements DataServiceSubscriber, SettingsServiceSubscriber {

    private deltas: boolean;
    private pd: string;
    private nd: string;
    private range: Range;
    private areaMetric: string;
    private heightMetric: string;
    private colorMetric: string;
    private positive: string;
    private neutral: string;
    private negative: string;
    private select: string;
    private operation: string;
    private deltaColorsFlipped: boolean;

    private visible: boolean = false;

    /* @ngInject */
    constructor(private $timeout: ITimeoutService,
                private settingsService: SettingsService,
                private dataService: DataService,
                private $element: Element) {

        let ctx = this;

        $timeout(()=> {
            ctx.onDataChanged(dataService.data)
        });
        $timeout(()=> {
            ctx.onSettingsChanged(settingsService.settings)
        });

        this.settingsService.subscribe(this);

        this.dataService.subscribe(this);

    }

    onDataChanged(data: DataModel) {
        if (data && data.revisions && data.revisions.length > 1) {
            this.deltas = true;
            this.refreshDeltaColors();
        }
    }

    refreshDeltaColors() {
        if(this.deltaColorsFlipped){
            this.pd = this.getImageDataUri(MapColors.negativeDelta);
            this.nd = this.getImageDataUri(MapColors.positiveDelta);
        } else {
            this.pd = this.getImageDataUri(MapColors.positiveDelta);
            this.nd = this.getImageDataUri(MapColors.negativeDelta);
        }
        this.$timeout(()=>$("#positiveDelta").attr("src", this.pd), 200);
        this.$timeout(()=>$("#negativeDelta").attr("src", this.nd), 200);
    }

    onSettingsChanged(s: Settings) {
        this.range = s.neutralColorRange;
        this.areaMetric = s.areaMetric;
        this.heightMetric = s.heightMetric;
        this.colorMetric = s.colorMetric;
        this.deltaColorsFlipped = s.deltaColorFlipped;
        this.deltas = s.deltas;

        this.positive = this.getImageDataUri(MapColors.positive);
        this.neutral = this.getImageDataUri(MapColors.neutral);
        this.negative = this.getImageDataUri(MapColors.negative);
        this.select = this.getImageDataUri(MapColors.selected);
        this.operation = this.setOperation(s.operation);

        $("#green").attr("src", this.positive);
        $("#yellow").attr("src", this.neutral);
        $("#red").attr("src", this.negative);
        $("#select").attr("src", this.select);

        this.refreshDeltaColors();

    }

    getImageDataUri(hex: number): string {
        let hexS: string = "#" + hex.toString(16);
        var color: string = this.encodeHex(hexS);
        return this.generatePixel(color);
    }

    encodeHex(s: string): string {
        s = s.substring(1, 7);
        if (s.length < 6) {
            s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
        }
        return this.encodeRGB(
            parseInt(s[0] + s[1], 16), parseInt(s[2] + s[3], 16), parseInt(s[4] + s[5], 16));
    }

    encodeRGB(r: number, g: number, b: number): string {
        return this.encodeTriplet(0, r, g) + this.encodeTriplet(b, 255, 255);
    }

    encodeTriplet(e1: number, e2: number, e3: number): string {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var enc1 = e1 >> 2;
        var enc2 = ((e1 & 3) << 4) | (e2 >> 4);
        var enc3 = ((e2 & 15) << 2) | (e3 >> 6);
        var enc4 = e3 & 63;
        return keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }


    generatePixel(color: string): string {
        return "data:image/gif;base64,R0lGODlhAQABAPAA" + color + "/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
    }

    setOperation(operation: STATISTIC_OPS): string{
        if(!operation || operation=== STATISTIC_OPS.NOTHING){
            return "";
        }
        return (<string>operation).replace("_", " ").toLowerCase();
    }

}

export const legendPanelComponent = {
    selector: "legendPanelComponent",
    template: require("./legendPanel.html"),
    controller: LegendPanelController
};




