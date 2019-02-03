import {DataModel, DataService, DataServiceSubscriber} from "../../core/data/data.service";
import {
    KindOfMap, MarkedPackage,
    Range,
    Settings,
    SettingsService,
    SettingsServiceSubscriber
} from "../../core/settings/settings.service";
import $ from "jquery";
import {MapColors} from "../codeMap/rendering/renderSettings";
import {ITimeoutService} from "angular";
import "./legendPanel.component.scss";
import {ColorService} from "../../core/color/color.service";

export interface PackageList {
    colorPixel: string,
    markedPackages: MarkedPackage[],
}

export class LegendPanelController implements DataServiceSubscriber, SettingsServiceSubscriber {

    private deltas: boolean;
    private pd: string;
    private nd: string;
    private range: Range;
    private positive: string;
    private neutral: string;
    private negative: string;
    private select: string;
    private deltaColorsFlipped: boolean;
    private packageLists: PackageList[];

    /* @ngInject */
    constructor(private $timeout: ITimeoutService,
                private settingsService: SettingsService,
                private dataService: DataService,
                private colorService: ColorService) {
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
            this.pd = this.colorService.getImageDataUri(MapColors.negativeDelta);
            this.nd = this.colorService.getImageDataUri(MapColors.positiveDelta);
        } else {
            this.pd = this.colorService.getImageDataUri(MapColors.positiveDelta);
            this.nd = this.colorService.getImageDataUri(MapColors.negativeDelta);
        }
        this.$timeout(()=>$("#positiveDelta").attr("src", this.pd), 200);
        this.$timeout(()=>$("#negativeDelta").attr("src", this.nd), 200);
    }

    private setMarkedPackageLists() {
        const markedPackages: MarkedPackage[] = this.settingsService.settings.markedPackages;
        if (markedPackages) {
            this.packageLists = [];
            markedPackages.forEach(mp => this.handleMarkedPackage(mp));
        }
    }

    private handleMarkedPackage(mp: MarkedPackage) {
        const colorPixel = this.colorService.getImageDataUri(Number(mp.color));

        if (!mp.attributes["name"]) {
            mp.attributes["name"] = this.getPackagePathPreview(mp);
        }

        if (this.isColorPixelInPackageLists(colorPixel)) {
            this.insertMPIntoPackageList(mp, colorPixel);
        } else {
            const packageList: PackageList = {colorPixel: colorPixel, markedPackages: [mp]};
            this.addNewPackageList(packageList);
        }
    }

    private addNewPackageList(packageList: PackageList) {
        this.packageLists.push(packageList);
    }

    private insertMPIntoPackageList(mp: MarkedPackage, colorPixel: string) {
        this.packageLists.filter(packageList => packageList.colorPixel == colorPixel)[0].markedPackages.push(mp);
    }

    private isColorPixelInPackageLists(colorPixel: string) {
        return this.packageLists.filter(mpList => mpList.colorPixel == colorPixel).length > 0;
    }

    private getPackagePathPreview(mp: MarkedPackage): string {
        const MAX_NAME_LENGTH = { lowerLimit: 24, upperLimit: 28 };
        const packageName = this.getPackageNameFromPath(mp.path);

        if (packageName.length > MAX_NAME_LENGTH.lowerLimit && packageName.length < MAX_NAME_LENGTH.upperLimit) {
            return ".../" + packageName;

        } else if (packageName.length > MAX_NAME_LENGTH.upperLimit) {
            const firstPart = packageName.substr(0, MAX_NAME_LENGTH.lowerLimit / 2);
            const secondPart = packageName.substr(packageName.length - MAX_NAME_LENGTH.lowerLimit / 2);
            return firstPart + "..." + secondPart;

        } else {
            const from = Math.max(mp.path.length - MAX_NAME_LENGTH.lowerLimit, 0);
            const previewPackagePath = mp.path.substring(from);
            const rootNode = this.settingsService.settings.map.nodes;
            const startingDots = (previewPackagePath.startsWith(rootNode.path)) ? "" : "...";
            return startingDots + previewPackagePath;
        }
    }

    private getPackageNameFromPath(path: string): string {
        const pathArray = path.split("/");
        return pathArray[pathArray.length - 1];
    }

    onSettingsChanged(s: Settings) {
        this.range = s.neutralColorRange;
        this.deltaColorsFlipped = s.deltaColorFlipped;
        this.deltas = s.mode == KindOfMap.Delta;

        this.positive = this.colorService.getImageDataUri((s.whiteColorBuildings) ? MapColors.lightGrey : MapColors.positive);
        this.neutral = this.colorService.getImageDataUri(MapColors.neutral);
        this.negative = this.colorService.getImageDataUri(MapColors.negative);
        this.select = this.colorService.getImageDataUri(MapColors.selected);

        $("#green").attr("src", this.positive);
        $("#yellow").attr("src", this.neutral);
        $("#red").attr("src", this.negative);
        $("#select").attr("src", this.select);

        this.refreshDeltaColors();
        this.setMarkedPackageLists();
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
    template: require("./legendPanel.component.html"),
    controller: LegendPanelController
};



