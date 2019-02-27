import "./ribbonBar.component.scss";
import $ from "jquery";
import {SettingsService} from "../../core/settings/settings.service";
import { DownloadService } from "../../core/download/download.service";
import {CodeMapNode, RenderMode, Settings} from "../../codeCharta.model";
import {hierarchy, HierarchyNode} from "d3-hierarchy";
import {CodeChartaService} from "../../codeCharta.service";

export class RibbonBarController {

    private collapsingElements = $("code-map-component #codeMap, ribbon-bar-component #header, ribbon-bar-component .section-body, #toggle-ribbon-bar-fab");
    private toggleElements = $("ribbon-bar-component .section-title");
    private isExpanded: boolean = false;
    private _deltaMode = RenderMode.Delta;
    private static MAX_MARGIN = 100
    private static MARGIN_FACTOR = 4;


    /* @ngInject */
    constructor(
        private settingsService: SettingsService,
        private downloadService: DownloadService,
        private codeChartaService: CodeChartaService
    ) {
    }

    public downloadFile() {
        this.downloadService.downloadCurrentMap();
    }

    public changeMargin(){
        this.settingsService.updateSettings({
            dynamicSettings: {
                margin: this.computeMargin(this.codeChartaService.getRenderMap())
            },
            appSettings: {
                dynamicMargin: false
            }
        });
    }


    // TODO: Check if works
     public computeMargin(renderMap: CodeMapNode): number {
         const s = this.settingsService.getSettings();
         let leaves = hierarchy<CodeMapNode>(renderMap).leaves();
         let numberOfBuildings = 0;
         let totalArea = 0;

         leaves.forEach((node: HierarchyNode<CodeMapNode>) => {
             numberOfBuildings++;
             if(node.data.attributes && node.data.attributes[s.dynamicSettings.areaMetric]){
                 totalArea += node.data.attributes[s.dynamicSettings.areaMetric];
             }
         });

         let margin: number = RibbonBarController.MARGIN_FACTOR * Math.round(Math.sqrt((totalArea / numberOfBuildings)));
         return Math.min(RibbonBarController.MAX_MARGIN, Math.max(SettingsService.MIN_MARGIN, margin));
     }

    public toggle() {
        if (!this.isExpanded) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    public expand() {
        this.isExpanded = true;
        this.collapsingElements.addClass("expanded");
    }

    public collapse() {
        this.isExpanded = false;
        this.collapsingElements.removeClass("expanded");
    }

    public hoverToggle() {
        this.toggleElements.addClass("toggle-hovered")
    }

    public unhoverToggle() {
        this.toggleElements.removeClass("toggle-hovered")
    }

}

export const ribbonBarComponent = {
    selector: "ribbonBarComponent",
    template: require("./ribbonBar.component.html"),
    controller: RibbonBarController
};

