import {DataServiceSubscriber, DataService, DataModel} from "../../core/data/data.service";
import {
    SettingsServiceSubscriber,
    SettingsService,
    Settings,
    Range,
    MarkingPackages
} from "../../core/settings/settings.service";
import $ from "jquery";
import {MapColors} from "../codeMap/rendering/renderSettings";
import {ITimeoutService} from "angular";
import {STATISTIC_OPS} from "../../core/statistic/statistic.service";
import "./legendPanel.scss";
import {CodeMapNode} from "../../core/data/model/CodeMap";
import {hierarchy} from "d3-hierarchy";
import Code = marked.Tokens.Code;

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
    private markingPackages: MarkingPackages[];

    /* @ngInject */
    constructor(private $timeout: ITimeoutService,
                private settingsService: SettingsService,
                private dataService: DataService,
                private $element: Element) {
        let ctx = this;

        $timeout(()=> {
            ctx.onDataChanged(dataService.data);
        });
        $timeout(()=> {
            ctx.onSettingsChanged(settingsService.settings);
        });

        this.settingsService.subscribe(this);

        this.dataService.subscribe(this);

        this.initAnimations();

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


    private setMarkingPackagesIntoLegend() {
        this.settingsService.settings.markingPackages = [];
        if (this.settingsService.settings.map) {
            var rootNode: CodeMapNode = this.settingsService.settings.map.root;

            hierarchy<CodeMapNode>(rootNode).descendants().forEach((hierarchyNode) => {
                const node: CodeMapNode = hierarchyNode.data;
                if (node.markingColor) {
                    const mp = this.getNewMarkingPackageFromNode(node);
                    if (this.legendContainsMarkingPackages()) {
                        this.handleMarkingPackageWithExistingColor(mp);

                    } else {
                        this.settingsService.settings.markingPackages = [mp];
                    }
                }
            });
        }
    }

    private legendContainsMarkingPackages() {
        return this.settingsService.settings.markingPackages &&
            this.settingsService.settings.markingPackages.length > 0 &&
            this.settingsService.settings.markingPackages != [];
    }

    private getNewMarkingPackageFromNode(node: CodeMapNode) {
        return {
            markingColor: node.markingColor,
            packageItem: [{
                name: node.name.split('/').slice(-1)[0],
                path: node.path
            }]
        };
    }

    private handleMarkingPackageWithExistingColor(mp: MarkingPackages) {
        var addMP = true;
        const packagesWithSameMarkingColor: MarkingPackages[] = this.getPackagesWithSameMarkingColor(mp, this.settingsService.settings.markingPackages);
        if (packagesWithSameMarkingColor != []) {
            for (const mpWithSameColor of packagesWithSameMarkingColor) {
                if (this.isPartOfSecondPackage(mp, mpWithSameColor)) {
                    addMP = false;
                }
            }
        } else {
            addMP = true;
        }
        if (addMP) {
            this.settingsService.settings.markingPackages.push(mp);
        }
    }

    private getPackagesWithSameMarkingColor(mp: MarkingPackages, allMP: MarkingPackages[]) {
        var packagesWithSameMarkingColor: MarkingPackages[] = [];
        for(const otherMP of allMP) {
            if (otherMP.markingColor == mp.markingColor) {
                packagesWithSameMarkingColor.push(otherMP);
            }
        }
        return packagesWithSameMarkingColor;
    }

    private isPartOfSecondPackage(mp1: MarkingPackages, mp2: MarkingPackages) {
        return mp1.packageItem[0].path.indexOf(mp2.packageItem[0].path) >= 0;
    }

    private combineMarkingPackagesByColors(allMP: MarkingPackages[]) {
        this.markingPackages = [];
        if (allMP) {
            for (var i = 0; i < allMP.length; i++) {
                var markingPackage: MarkingPackages = {
                    markingColor: this.getImageDataUri(Number(allMP[i].markingColor)),
                    packageItem: [{
                        name: allMP[i].packageItem[0].name,
                        path: allMP[i].packageItem[0].path,
                    }],
                };

                const markingPackageWithSameColor = this.getPackagesWithSameMarkingColor(markingPackage, this.markingPackages);
                if (markingPackageWithSameColor != [] && markingPackageWithSameColor.length > 0) {
                    console.log(markingPackageWithSameColor);
                    const index = this.markingPackages.indexOf(markingPackageWithSameColor[0]);
                    console.log(index);
                    console.log(this.markingPackages[index].packageItem);
                    console.log(markingPackage.packageItem[0]);
                    this.markingPackages[index].packageItem.push(markingPackage.packageItem[0]);
                } else {
                    this.markingPackages.push(markingPackage);
                }
            }
        }
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
        this.setMarkingPackagesIntoLegend();
        this.combineMarkingPackagesByColors(s.markingPackages);
    }

    getImageDataUri(hex: number): string {
        let hexS: string = "#" + hex.toString(16);
        let color: string = this.encodeHex(hexS);
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
        let keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        let enc1 = e1 >> 2;
        let enc2 = ((e1 & 3) << 4) | (e2 >> 4);
        let enc3 = ((e2 & 15) << 2) | (e3 >> 6);
        let enc4 = e3 & 63;
        return keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }


    generatePixel(color: string): string {
        return "data:image/gif;base64,R0lGODlhAQABAPAA" + color + "/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
    }

    setOperation(operation: STATISTIC_OPS): string{
        if(operation=== STATISTIC_OPS.NOTHING || !operation){
            return "";
        }
        return (<string>operation).replace("_", " ").toLowerCase();
    }

    private initAnimations() {
        $(document).ready(function(){
            let start = 40;
            let target = -500;
            let visible = false;
            $("legend-panel-component .panel-button").click(function(){
                $("legend-panel-component .block-wrapper").animate({left: visible ? target+"px" : start+"px"}, "fast");
                visible = !visible;
            });
        });
    }

}

export const legendPanelComponent = {
    selector: "legendPanelComponent",
    template: require("./legendPanel.html"),
    controller: LegendPanelController
};



