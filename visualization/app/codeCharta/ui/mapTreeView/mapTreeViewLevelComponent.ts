import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {ITimeoutService} from "angular";
import {CodeMap, CodeMapNode} from "../../core/data/model/CodeMap";

export class MapTreeViewLevelController {

    public node: CodeMapNode = null;
    public depth: number = 0;
    public collapsed: boolean = true;

    /* @ngInject */
    constructor(private $timeout: ITimeoutService, private $scope, private settingsService: SettingsService) {
        this.$scope.$on("tree-parent-visibility-changed", (event, visibility)=>{
            this.node.visible = visibility;
        });
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
            //broadcast to children
            this.$scope.$broadcast("tree-parent-visibility-changed", value);
        }
        //TODO ensure to call it after all broadcasts, as of now this leads to timing issues in big maps
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




