import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {IRootScopeService, ITimeoutService} from "angular";
import {CodeMap, CodeMapNode} from "../../core/data/model/CodeMap";
import {hierarchy} from "d3-hierarchy";

export interface MapTreeViewHoverEventSubscriber {
    onShouldHoverNode(node: CodeMapNode);
    onShouldUnhoverNode(node: CodeMapNode);
}

export class MapTreeViewLevelController {

    public node: CodeMapNode = null;
    public depth: number = 0;
    public collapsed: boolean = true;

    /* @ngInject */
    constructor(private $timeout: ITimeoutService, private $scope, private settingsService: SettingsService, private $rootScope: IRootScopeService) {

    }

    static subscribeToHoverEvents($rootScope: IRootScopeService, subscriber: MapTreeViewHoverEventSubscriber){
        $rootScope.$on("should-hover-node", (event, args)=>subscriber.onShouldHoverNode(args));
        $rootScope.$on("should-unhover-node", (event, args)=>subscriber.onShouldUnhoverNode(args));
    }

    onMouseEnter() {
        this.$rootScope.$broadcast("should-hover-node", this.node);
    }

    onMouseLeave() {
        this.$rootScope.$broadcast("should-unhover-node", this.node);
    }

    onFolderClick() {
        this.collapsed = !this.collapsed;
    }

    onLabelClick() {
        this.setParentsInvisibleAndChildrenVisible();
    }

    onEyeClick() {
        this.setAndBroadcastVisibilityToChildren(!this.node.visible);
    }

    setParentsInvisibleAndChildrenVisible() {
        // set root and all others invisible
        // TODO not sure if we should acces the map through settings without getting triggered by the event. this saves memory though and should not be a problem
        this.setAndBroadcastVisibilityToChildren(false, this.settingsService.settings.map.root);
        // set this visible
        this.setAndBroadcastVisibilityToChildren(true);
    }

    setAndBroadcastVisibilityToChildren(value: boolean, node: CodeMapNode = this.node) {
        this.node.visible = value;
        let h = hierarchy(node);
        h.descendants().forEach((d) => {
            d.data.visible = value;
        });

        //TODO ensure to call it after all broadcasts
        //TODO performance :(
        this.$timeout(() => {
            this.settingsService.onSettingsChanged();
        }, 100);
    }

    isLeaf(node: CodeMapNode = this.node): boolean {
        return !(node && node.children && node.children.length > 0);
    }

    sortByFolder(node: CodeMapNode) {
        if(!(node && node.children && node.children.length > 0)){
            return 0;
        } else {
            return 1;
        }
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




