import {SettingsService, SettingsServiceSubscriber} from "../../state/settings.service";
import $ from "jquery";
import {MapColors} from "../codeMap/rendering/renderSettings";
import {IRootScopeService, ITimeoutService} from "angular";
import "./legendPanel.component.scss";
import {ColorService} from "../../core/colorService";
import {ColorRange, MarkedPackage, RenderMode, Settings} from "../../codeCharta.model";
import {CodeChartaService} from "../../codeCharta.service";

export interface PackageList {
    colorPixel: string,
    markedPackages: MarkedPackage[],
}

export class LegendPanelController implements SettingsServiceSubscriber {

    private _viewModel: {
        isDeltaMode: boolean;
        range: ColorRange;
        packageLists: PackageList[];
    } = {
        isDeltaMode: null,
        range: null,
        packageLists: null
    }

    /* @ngInject */
    constructor(private $rootScope: IRootScopeService,
                private $timeout: ITimeoutService,
                private settingsService: SettingsService,
                private codeChartaService: CodeChartaService) {

        SettingsService.subscribe(this.$rootScope, this);

        this.initAnimations();
    }

    /* TODO: Change deltaColors
    public onDataChanged(data: DataModel) {
        if (data && data.revisions && data.revisions.length > 1) {
            this._deltas = true;
            this.refreshDeltaColors();
        }
    }*/

    public onSettingsChanged(s: Settings, event: angular.IAngularEvent) {
        this._viewModel.range = s.dynamicSettings.neutralColorRange;
        this._viewModel.isDeltaMode = s.dynamicSettings.renderMode == RenderMode.Delta;

        const select = ColorService.getImageDataUri(MapColors.selected);
        $("#select").attr("src", select);

        if (this._viewModel.isDeltaMode) {
            this.refreshDeltaColors(s);
        } else {
            this.refreshNormalColors(s);
        }
        this.setMarkedPackageLists(s);
    }

    private refreshNormalColors(s: Settings) {
        const positive = ColorService.getImageDataUri(s.appSettings.whiteColorBuildings ? MapColors.lightGrey : MapColors.positive);
        const neutral = ColorService.getImageDataUri(MapColors.neutral);
        const negative = ColorService.getImageDataUri(MapColors.negative);
        $("#green").attr("src", positive);
        $("#yellow").attr("src", neutral);
        $("#red").attr("src", negative);
    }

    private refreshDeltaColors(s: Settings) {
        const positiveDeltaPixel = ColorService.getImageDataUri(s.appSettings.deltaColorFlipped ? MapColors.negativeDelta : MapColors.positiveDelta);
        const negativeDeltaPixel = ColorService.getImageDataUri(s.appSettings.deltaColorFlipped ? MapColors.positiveDelta : MapColors.negativeDelta);
        $("#positiveDelta").attr("src", positiveDeltaPixel);
        $("#negativeDelta").attr("src", negativeDeltaPixel);
    }

    private setMarkedPackageLists(s: Settings) {
        const markedPackages: MarkedPackage[] = s.fileSettings.markedPackages;
        if (markedPackages) {
            this._viewModel.packageLists = [];
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
        this._viewModel.packageLists.push(packageList);
    }

    private insertMPIntoPackageList(mp: MarkedPackage, colorPixel: string) {
        this._viewModel.packageLists.filter(packageList => packageList.colorPixel == colorPixel)[0].markedPackages.push(mp);
    }

    private isColorPixelInPackageLists(colorPixel: string) {
        return this._viewModel.packageLists.filter(mpList => mpList.colorPixel == colorPixel).length > 0;
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
            const rootNode = this.codeChartaService.getRenderMap();
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



