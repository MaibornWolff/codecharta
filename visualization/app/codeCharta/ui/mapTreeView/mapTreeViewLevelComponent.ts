import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {ITimeoutService} from "angular";
import {CodeMap, CodeMapNode} from "../../core/data/model/CodeMap";
import {hierarchy} from "d3-hierarchy";

export class MapTreeViewLevelController {

    public node: CodeMapNode = null;
    public depth: number = 0;
    public collapsed: boolean = true;

    /* @ngInject */
    constructor(private $timeout: ITimeoutService, private $scope, private settingsService: SettingsService) {

    }

    onLabelClick() {
        this.collapsed = !this.collapsed;
    }

    onEyeClick() {
        this.setAndBroadcastVisibility(!this.node.visible);
    }

    setAndBroadcastVisibility(value: boolean) {
        this.node.visible = value;
        if(!this.isLeaf()) {
            let h = hierarchy(this.node);
            h.descendants().forEach((d)=>{
                d.data.visible = value;
            });
        }
        //TODO ensure to call it after all broadcasts
        //TODO performance :(
        this.$timeout(()=>{
            this.settingsService.onSettingsChanged();
        },100);
    }

    isLeaf(): boolean {
        return !(this.node && this.node.children && this.node.children.length > 0);
    }

}

export const mapTreeViewLevelComponent = {
    selector: "mapTreeViewLevelComponent",
    template: require("./mapTreeViewLevel.html"),
    controller: MapTreeViewLevelController,
    bindings: {
        node: '<',
        depth: '<'
    }
};




