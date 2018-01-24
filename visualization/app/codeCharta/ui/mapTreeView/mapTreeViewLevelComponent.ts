import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {ITimeoutService} from "angular";
import {CodeMap, CodeMapNode} from "../../core/data/model/CodeMap";

export class MapTreeViewLevelController {

    public node: CodeMapNode = null;
    public depth: number = 0;
    public collapsed: boolean = true;
    public visible: boolean = true;

    /* @ngInject */
    constructor(private $timeout: ITimeoutService, private $scope) {
        this.$scope.$on("tree-parent-visibility-changed", (event, visibility)=>{
            this.visible = visibility;
        });
    }

    onLabelClick() {
        this.collapsed = !this.collapsed;
    }

    onEyeClick() {
        this.setAndBroadcastVisibility(!this.visible);
    }

    setAndBroadcastVisibility(value: boolean) {
        this.visible = value;
        if(!this.isLeaf()) {
            //broadcast to children
            this.$scope.$broadcast("tree-parent-visibility-changed", value);
        }
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




