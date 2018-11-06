import {CodeMapActionsService} from "./codeMap.actions.service";
import {CodeMapNode, Edge, Exclude, ExcludeType} from "../../core/data/model/CodeMap";

import {SettingsService} from "../../core/settings/settings.service";
import {ThreeOrbitControlsService} from "./threeViewer/threeOrbitControlsService";

jest.mock("../../core/settings/settings.service");

jest.mock("./threeViewer/threeOrbitControlsService");

describe("code map action service tests", ()=>{

    let codeMapActionService: CodeMapActionsService;
    let $timeout;
    let visibleNode: CodeMapNode;
    let hiddenNode: CodeMapNode;
    let simpleHiddenHierarchy: CodeMapNode;
    let blacklistItems: Array<Exclude>;
    let edgeList: Array<Edge>;

    let nodeA: CodeMapNode;
    let nodeB: CodeMapNode;
    let nodeChildAa: CodeMapNode;

    function checkBlacklistItems(type: ExcludeType, node: CodeMapNode, shouldExist: boolean) {
        const amountOfFoundItems = codeMapActionService.settingsService.settings.blacklist.filter(b =>
            b.type == type && b.path == node.path).length == 1;
        expect(amountOfFoundItems).toBe(shouldExist);
    }

    function checkDependentEdgeVisibility(nodes: CodeMapNode[], visibility: boolean) {
        expect(edgesHaveSameVisibility(getEdgesFromNode(nodes), visibility)).toBe(true);
    }

    function getEdgesFromNode(nodes: CodeMapNode[]) {
        const nodePaths = nodes.map(node => node.path);

        return codeMapActionService.settingsService.settings.map.edges.filter(edge =>
            nodePaths.includes(edge.fromNodeName) || nodePaths.includes(edge.toNodeName));
    }

    function edgesHaveSameVisibility(edges: Edge[], visibility: boolean) {
        return edges.filter(edge => edge.visible == visibility).length == edges.length;
    }

    beforeEach(()=>{
       visibleNode = {name: "test", type: "File", attributes: {}, visible: true};
       hiddenNode = {name: "test", type: "File", attributes: {}, visible: false};
       simpleHiddenHierarchy = {
            name: "root",
            path: "/root",
            type: "Folder",
            attributes: {},
            visible: false,
            children: [
                {
                    name: "a",
                    path: "/root/a",
                    type: "Folder",
                    attributes: {},
                    visible: false,
                    children: [
                        {
                            name: "aa",
                            path: "/root/a/aa",
                            type: "File",
                            attributes: {},
                            visible: false
                        },
                        {
                            name: "ab",
                            path: "/root/a/ab",
                            type: "File",
                            attributes: {},
                            visible: false
                        }
                    ]
                },
                {
                    name: "b",
                    path: "/root/b",
                    type: "File",
                    attributes: {},
                    visible: false
                }
            ]
        };
        blacklistItems = [
            {
                path: "/root/a/aa",
                type: ExcludeType.exclude
            },
            {
                path: "/root/a/ab",
                type: ExcludeType.hide
            },
            {
                path: "/root/b",
                type: ExcludeType.hide
            }
        ];
        edgeList = [
            {
                fromNodeName: "/root/a",
                toNodeName: "/root/b",
                attributes: {
                    "attribute": 42,
                },
                visible: false
            },
            {
                fromNodeName: "/root/a/aa",
                toNodeName: "/root/b",
                attributes: {
                    "attribute": 42,
                },
                visible: false
            },
            {
                fromNodeName: "/root/b",
                toNodeName: "/root/a/ab",
                attributes: {
                    "attribute": 42,
                },
                visible: false
            }
        ];
        $timeout = jest.fn();
        codeMapActionService = new CodeMapActionsService(
            new SettingsService(),
            new ThreeOrbitControlsService(),
            $timeout);

        nodeA = simpleHiddenHierarchy.children[0];
        nodeB = simpleHiddenHierarchy.children[1];
        nodeChildAa = simpleHiddenHierarchy.children[0].children[0];
    });

    describe("marking folders", ()=>{

        let markedNode: CodeMapNode;
        let unmarkedNode: CodeMapNode;
        let simpleUnmarkedHierarchy: CodeMapNode;

        beforeEach(()=>{
            markedNode = visibleNode;
            markedNode.markingColor = "0x000FFF";
            unmarkedNode = visibleNode;
            simpleUnmarkedHierarchy = simpleHiddenHierarchy;
        });

        it("marking an unmarked folder should mark it", ()=>{
            codeMapActionService.markFolder(unmarkedNode, "#FFF000");
            expect(unmarkedNode.markingColor).toBe("0xFFF000");
        });

        it("marking an marked folder should update its color", ()=>{
            expect(unmarkedNode.markingColor).not.toBe("0xFFF000");
            codeMapActionService.markFolder(markedNode, "#FFF000");
            expect(unmarkedNode.markingColor).toBe("0xFFF000");
        });

        it("marking an unmarked folder should mark its unmarked children but should not overwrite marked childrens colors", ()=>{
            simpleUnmarkedHierarchy.children[1].markingColor="0x330033";
            codeMapActionService.markFolder(simpleUnmarkedHierarchy, "#FFF000");
            expect(simpleUnmarkedHierarchy.children[1].markingColor).toBe("0x330033");
            expect(simpleUnmarkedHierarchy.children[0].markingColor).toBe("0xFFF000");
            expect(simpleUnmarkedHierarchy.children[0].children[0].markingColor).toBe("0xFFF000");
            expect(simpleUnmarkedHierarchy.children[0].children[1].markingColor).toBe("0xFFF000");
            expect(simpleUnmarkedHierarchy.markingColor).toBe("0xFFF000");
        });

        it("unmarking an marked folder should unmark it", ()=>{
            expect(markedNode.markingColor).not.toBeFalsy();
            codeMapActionService.unmarkFolder(markedNode);
            expect(markedNode.markingColor).toBeFalsy();
        });

        it("unmarking an marked folder should unmark its marked children as long as they have the same color", ()=>{
            simpleUnmarkedHierarchy.markingColor="0x330033";
            simpleUnmarkedHierarchy.children[0].markingColor="0x330033";
            simpleUnmarkedHierarchy.children[1].markingColor="0x777777";
            codeMapActionService.unmarkFolder(simpleUnmarkedHierarchy);
            expect(simpleUnmarkedHierarchy.markingColor).toBeFalsy();
            expect(simpleUnmarkedHierarchy.children[0].markingColor).toBeFalsy();
            expect(simpleUnmarkedHierarchy.children[1].markingColor).toBe("0x777777");
            expect(simpleUnmarkedHierarchy.children[0].children[0].markingColor).toBeFalsy();
            expect(simpleUnmarkedHierarchy.children[0].children[1].markingColor).toBeFalsy();
        });

    });

    describe("blacklist items with node visibility", ()=>{

        beforeEach(()=>{
            codeMapActionService.settingsService.settings = {
                map: {
                    root: simpleHiddenHierarchy
                },
                blacklist: blacklistItems
            };
        });

        it("showing hidden node should remove blacklistHide item", ()=>{
            codeMapActionService.hideNode(nodeA);
            checkBlacklistItems(ExcludeType.hide, nodeA, true);

            codeMapActionService.showNode(nodeA);
            checkBlacklistItems(ExcludeType.hide, nodeA, false);
        });

        it("showing all nodes should remove all nodes of type blacklistHide and blacklistIsolate", ()=>{
            codeMapActionService.isolateNode(simpleHiddenHierarchy);
            codeMapActionService.hideNode(nodeChildAa);
            codeMapActionService.hideNode(nodeA);
            checkBlacklistItems(ExcludeType.isolate, simpleHiddenHierarchy, true);
            checkBlacklistItems(ExcludeType.hide, nodeChildAa, true);
            checkBlacklistItems(ExcludeType.hide, nodeA, true);

            codeMapActionService.showAllNodes();
            checkBlacklistItems(ExcludeType.isolate, simpleHiddenHierarchy, false);
            checkBlacklistItems(ExcludeType.hide, nodeChildAa, false);
            checkBlacklistItems(ExcludeType.hide, nodeA, false);
        });

        it("isolating node should remove this node if it was hidden and add it as blacklistIsolate item", ()=>{
            codeMapActionService.hideNode(nodeB);
            checkBlacklistItems(ExcludeType.hide, nodeB, true);

            codeMapActionService.isolateNode(nodeB);
            checkBlacklistItems(ExcludeType.isolate, nodeB, true);
            checkBlacklistItems(ExcludeType.hide, nodeB, false);
        });

        it("isolating/unisolating node should keep other hidden nodes and add/remove a blacklistIsolate item", ()=>{
            codeMapActionService.hideNode(nodeA);
            checkBlacklistItems(ExcludeType.hide, nodeA, true);
            expect(codeMapActionService.isNodeIsolated(nodeA)).toBe(false);

            codeMapActionService.isolateNode(nodeB);
            checkBlacklistItems(ExcludeType.isolate, nodeB, true);
            checkBlacklistItems(ExcludeType.hide, nodeA, true);
            expect(codeMapActionService.isNodeIsolated(nodeB)).toBe(true);

            codeMapActionService.unisolateNode(nodeB);
            expect(codeMapActionService.isNodeIsolated(nodeB)).toBe(false);
        });

        it("hiding node should create blacklistHide item", ()=>{
            codeMapActionService.hideNode(simpleHiddenHierarchy);
            checkBlacklistItems(ExcludeType.hide, simpleHiddenHierarchy, true);
        });

        it("hiding the same node again should not create blacklistHide item", ()=>{
            codeMapActionService.hideNode(simpleHiddenHierarchy);
            checkBlacklistItems(ExcludeType.hide, simpleHiddenHierarchy, true);
            codeMapActionService.hideNode(simpleHiddenHierarchy);
            checkBlacklistItems(ExcludeType.hide, simpleHiddenHierarchy, true);
        });

        it("excluding node should create blacklistExcluded item", ()=>{
            codeMapActionService.excludeNode(simpleHiddenHierarchy);
            checkBlacklistItems(ExcludeType.exclude, simpleHiddenHierarchy, true);
        });

        it("removing node should remove blacklistExcluded item", ()=>{
            codeMapActionService.excludeNode(simpleHiddenHierarchy);
            checkBlacklistItems(ExcludeType.exclude, simpleHiddenHierarchy, true);
            codeMapActionService.removeBlacklistEntry({path: "/root", type: ExcludeType.exclude});
            checkBlacklistItems(ExcludeType.exclude, simpleHiddenHierarchy, false);
        });

        it("toggling visible node should call hide method", ()=>{
            let tmp = codeMapActionService.hideNode;
            codeMapActionService.hideNode = jest.fn();
            codeMapActionService.toggleNodeVisibility(visibleNode);
            expect(codeMapActionService.hideNode).toHaveBeenCalledWith(visibleNode);
            codeMapActionService.hideNode = tmp;
        });

        it("toggling hidden node should call show method", ()=>{
            let tmp = codeMapActionService.showNode;
            codeMapActionService.showNode = jest.fn();
            codeMapActionService.toggleNodeVisibility(hiddenNode);
            expect(codeMapActionService.showNode).toHaveBeenCalledWith(hiddenNode);
            codeMapActionService.showNode = tmp;
        });
    });

    describe("edge visibility", ()=>{

        beforeEach(()=>{
            codeMapActionService.settingsService.settings = {
                map: {
                    root: simpleHiddenHierarchy,
                    edges: edgeList
                }
            };
        });

        it("checks amountOfDependentEdges from node", ()=>{
            const amountOfDependentEdges = codeMapActionService.amountOfDependentEdges(nodeB);
            expect(amountOfDependentEdges).toBe(3);
        });

        it("checks amountOfVisibleDependentEdges from node", ()=>{
            codeMapActionService.showDependentEdges(nodeB); // show 3 edges
            checkDependentEdgeVisibility([nodeB], true);
            codeMapActionService.hideDependentEdges(nodeA); // hide 1 edge
            const amountOfVisibleDependentEdges = codeMapActionService.amountOfVisibleDependentEdges(nodeB);
            expect(amountOfVisibleDependentEdges).toBe(2);
        });

        it("makes multiple edges visible and hide them all and check if any edge is visible", ()=>{
            codeMapActionService.showDependentEdges(nodeA);
            codeMapActionService.showDependentEdges(nodeB);
            checkDependentEdgeVisibility([nodeA, nodeB], true);
            expect(codeMapActionService.anyEdgeIsVisible()).toBe(true);

            codeMapActionService.hideAllEdges();
            checkDependentEdgeVisibility([nodeA, nodeB], false);
            expect(codeMapActionService.anyEdgeIsVisible()).toBe(false);

        });

        it("makes multiple edges visible and hide one of them", ()=>{
            codeMapActionService.showDependentEdges(nodeA);
            codeMapActionService.showDependentEdges(nodeB);
            checkDependentEdgeVisibility([nodeA, nodeB], true);

            codeMapActionService.hideDependentEdges(nodeA);
            checkDependentEdgeVisibility([nodeA], false);
        });
    });
});