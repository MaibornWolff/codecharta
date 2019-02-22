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
import {ColorService} from "../../core/colorService";

export interface PackageList {
    colorPixel: string,
    markedPackages: MarkedPackage[],
}

export class LegendPanelController implements DataServiceSubscriber, SettingsServiceSubscriber {

    private _deltas: boolean;
    private pd: string;
    private nd: string;
    private _range: Range;
    private positive: string;
    private neutral: string;
    private negative: string;
    private select: string;
    private deltaColorsFlipped: boolean;
    private packageLists: PackageList[];

    /* @ngInject */
    constructor(private $timeout: ITimeoutService,
                private settingsService: SettingsService,
                private dataService: DataService) {
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

    public onDataChanged(data: DataModel) {
        if (data && data.revisions && data.revisions.length > 1) {
            this._deltas = true;
            this.refreshDeltaColors();
        }
    }

    public onSettingsChanged(s: Settings) {
        this._range = s.neutralColorRange;
        this.deltaColorsFlipped = s.deltaColorFlipped;
        this._deltas = s.mode == KindOfMap.Delta;

        this.positive = ColorService.getImageDataUri((s.whiteColorBuildings) ? MapColors.lightGrey : MapColors.positive);
        this.neutral = ColorService.getImageDataUri(MapColors.neutral);
        this.negative = ColorService.getImageDataUri(MapColors.negative);
        this.select = ColorService.getImageDataUri(MapColors.selected);

        $("#green").attr("src", this.positive);
        $("#yellow").attr("src", this.neutral);
        $("#red").attr("src", this.negative);
        $("#select").attr("src", this.select);

        this.refreshDeltaColors();
        this.setMarkedPackageLists();
    }

    public refreshDeltaColors() {
        if(this.deltaColorsFlipped){
            this.pd = ColorService.getImageDataUri(MapColors.negativeDelta);
            this.nd = ColorService.getImageDataUri(MapColors.positiveDelta);
        } else {
            this.pd = ColorService.getImageDataUri(MapColors.positiveDelta);
            this.nd = ColorService.getImageDataUri(MapColors.negativeDelta);
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
        const colorPixel = ColorService.getImageDataUri(mp.color);

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

    private initAnimations() {
        $(document).ready(() => {
            let start = 40;
            let target = -500;
            let visible = false;
            $("legend-panel-component .panel-button").click(() => {
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



