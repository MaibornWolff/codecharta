import {DataServiceSubscriber, DataService} from "../../core/data/dataService.ts";
import {SettingsServiceSubscriber, SettingsService} from "../../core/settings/settingsService.ts";
import $ from "jquery";
import {MapColors} from "../../codeMap/rendering/renderSettings.ts";

export class LegendPanelController implements DataServiceSubscriber, SettingsServiceSubscriber{

    private deltas;
    private pd;
    private nd;
    private range;
    private areaMetric;
    private heightMetric;
    private colorMetric;
    private positive;
    private neutral;
    private negative;
    private select;

    private visible: boolean = false;

    /* @ngInject */
    constructor(
        private $timeout,
        private settingsService: SettingsService,
        private dataService: DataService,
        private $element: Element
    ) {

        let ctx = this;
        $timeout(ctx.onDataChanged(dataService.data));
        $timeout(ctx.onSettingsChanged(settingsService.settings));
        this.settingsService.subscribe(this);
        this.dataService.subscribe(this);

    }

    /**
     * Links the click Handler
     * @param {Scope} scope
     * @param {object} element dom element
     */
    $postLink() {
        $(this.$element).bind("click", this.toggle.bind(this));
    }

    /**
     * Toggles the visibility
     */
    toggle(){
        if (this.visible) {
            //noinspection TypeScriptUnresolvedFunction
            $("#legendPanel").animate({left: -500 + "px"});
            this.visible = false;
        } else {
            //noinspection TypeScriptUnresolvedFunction
            $("#legendPanel").animate({left: 2.8+"em"});
            this.visible = true;
        }
    }

    onDataChanged(data) {
        if(data && data.revisions && data.revisions.length > 1){
            this.deltas = true;
            this.pd = this.getImageDataUri(MapColors.positiveDelta);
            this.nd = this.getImageDataUri(MapColors.negativeDelta);
            this.$timeout(()=>$("#positiveDelta").attr("src", this.pd),200);
            this.$timeout(()=>$("#negativeDelta").attr("src", this.nd),200);
        }
    }

    onSettingsChanged(s) {
        this.range =s.neutralColorRange;
        this.areaMetric = s.areaMetric;
        this.heightMetric = s.heightMetric;
        this.colorMetric = s.colorMetric;

        this.positive = this.getImageDataUri(MapColors.positive);
        this.neutral = this.getImageDataUri(MapColors.neutral);
        this.negative = this.getImageDataUri(MapColors.negative);
        this.select = this.getImageDataUri(MapColors.selected);

        $("#green").attr("src", this.positive);
        $("#yellow").attr("src", this.neutral);
        $("#red").attr("src", this.negative);
        $("#select").attr("src", this.select);
    }

    getImageDataUri(hex){
        hex = "#"+hex.toString(16);
        var color = this.encodeHex(hex);
        return this.generatePixel(color);
    }

    encodeHex(s) {
        s = s.substring(1, 7);
        if (s.length < 6) {
            s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
        }
        return this.encodeRGB(
            parseInt(s[0] + s[1], 16), parseInt(s[2] + s[3], 16), parseInt(s[4] + s[5], 16));
    }

    encodeRGB(r, g, b) {
        return this.encodeTriplet(0, r, g) + this.encodeTriplet(b, 255, 255);
    }

    encodeTriplet(e1, e2, e3) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var enc1 = e1 >> 2;
        var enc2 = ((e1 & 3) << 4) | (e2 >> 4);
        var enc3 = ((e2 & 15) << 2) | (e3 >> 6);
        var enc4 = e3 & 63;
        return keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }


    generatePixel(color) {
        return "data:image/gif;base64,R0lGODlhAQABAPAA" + color + "/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
    }


}

export const legendPanelComponent = {
    selector: "legendPanelComponent",
    template: require("./legendPanel.html"),
    controller: LegendPanelController
};




