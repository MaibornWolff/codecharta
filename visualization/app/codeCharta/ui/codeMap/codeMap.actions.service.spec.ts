import {CodeMapActionsService} from "./codeMap.actions.service";
import {hierarchy} from "d3-hierarchy";
import {CodeMapNode} from "../../core/data/model/CodeMap";

import {SettingsService} from "../../core/settings/settings.service";
jest.mock("../../core/settings/settings.service");

import {ThreeOrbitControlsService} from "./threeViewer/threeOrbitControlsService";
jest.mock("./threeViewer/threeOrbitControlsService");

describe("code map action service tests", ()=>{

    let codeMapActionService: CodeMapActionsService;
    let $timeout;
    let visibleNode: CodeMapNode;
    let hiddenNode: CodeMapNode;
    let simpleHiddenHierarchy: CodeMapNode;

    function checkTreeVisibility(node: CodeMapNode, shouldBeVisible: boolean) {
        hierarchy<CodeMapNode>(node).eachAfter((node: CodeMapNode) => {
            expect(node.data.visible).toBe(shouldBeVisible);
        });
    };

    beforeEach(()=>{
       visibleNode = {name: "test", attributes: {}, visible: true};
       hiddenNode = {name: "test", attributes: {}, visible: false};
       simpleHiddenHierarchy = {
            name: "root",
            attributes: {},
            visible: false,
            children: [
                {
                    name: "a",
                    attributes: {},
                    visible: false,
                    children: [
                        {
                            name: "aa",
                            attributes: {},
                            visible: false
                        },
                        {
                            name: "ab",
                            attributes: {},
                            visible: false
                        }
                    ]
                },
                {
                    name: "b",
                    attributes: {},
                    visible: false
                }
            ]
        };
        $timeout = jest.fn();
        codeMapActionService = new CodeMapActionsService(
            new SettingsService(),
            new ThreeOrbitControlsService(),
            $timeout);
    });

    describe("marking folders", ()=>{

        let markedNode: CodeMapNode;
        let unmarkedNode: CodeMapNode;
        let simpleUnmarkedHierarchy: CodeMapNode;

        beforeEach(()=>{
            markedNode = visibleNode;
            markedNode.markingColor = 0x000FFF;
            unmarkedNode = visibleNode;
            simpleUnmarkedHierarchy = simpleHiddenHierarchy;
        });

        it("marking an unmarked folder should mark it", ()=>{
            codeMapActionService.markFolder(unmarkedNode, "#FFF000");
            expect(unmarkedNode.markingColor).toBe("0xFFF000");
        })

        it("marking an marked folder should update its color", ()=>{
            expect(unmarkedNode.markingColor).not.toBe("0xFFF000");
            codeMapActionService.markFolder(markedNode, "#FFF000");
            expect(unmarkedNode.markingColor).toBe("0xFFF000");
        })

        it("marking an unmarked folder should mark its unmarked children but should not overwrite marked childrens colors", ()=>{
            simpleUnmarkedHierarchy.children[1].markingColor="0x330033";
            codeMapActionService.markFolder(simpleUnmarkedHierarchy, "#FFF000");
            expect(simpleUnmarkedHierarchy.children[1].markingColor).toBe("0x330033");
            expect(simpleUnmarkedHierarchy.children[0].markingColor).toBe("0xFFF000");
            expect(simpleUnmarkedHierarchy.children[0].children[0].markingColor).toBe("0xFFF000");
            expect(simpleUnmarkedHierarchy.children[0].children[1].markingColor).toBe("0xFFF000");
            expect(simpleUnmarkedHierarchy.markingColor).toBe("0xFFF000");
        })

        it("unmarking an marked folder should unmark it", ()=>{
            expect(markedNode.markingColor).not.toBeFalsy();
            codeMapActionService.unmarkFolder(markedNode);
            expect(markedNode.markingColor).toBeFalsy();
        })

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
        })

    });

    describe("node visibility", ()=>{

        it("showing all nodes should make all nodes visible", ()=>{
            codeMapActionService.settingsService.settings = {
                map: {
                    root: simpleHiddenHierarchy
                }
            };
            codeMapActionService.showAllNodes();
            checkTreeVisibility(simpleHiddenHierarchy, true);
        });

        it("isolationg node should show all descendants and hide all ascendants", ()=>{
            codeMapActionService.settingsService.settings = {
                map: {
                    root: simpleHiddenHierarchy
                }
            };
            simpleHiddenHierarchy.visible = true;
            codeMapActionService.isolateNode(simpleHiddenHierarchy.children[0]);
            expect(simpleHiddenHierarchy.visible).toBe(false);
            checkTreeVisibility(simpleHiddenHierarchy.children[0], true);
            checkTreeVisibility(simpleHiddenHierarchy.children[1], false);
        });

        it("hiding invisible node with invisible children should make them all hidden", ()=>{
            codeMapActionService.hideNode(simpleHiddenHierarchy);
            checkTreeVisibility(simpleHiddenHierarchy, false);
        });

        it("hiding visible node with invisible children should make them all hidden", ()=>{
            simpleHiddenHierarchy.visible = true;
            codeMapActionService.hideNode(simpleHiddenHierarchy);
            checkTreeVisibility(simpleHiddenHierarchy, false);
        });

        it("hiding visible node with mixed children should make them all hidden", ()=>{
            simpleHiddenHierarchy.visible = true;
            simpleHiddenHierarchy.children[0].visible = true;
            codeMapActionService.hideNode(simpleHiddenHierarchy);
            checkTreeVisibility(simpleHiddenHierarchy, false);
        });

        it("showing invisible node with invisible children should make them all visible", ()=>{
            codeMapActionService.showNode(simpleHiddenHierarchy);
            checkTreeVisibility(simpleHiddenHierarchy, true);
        });

        it("showing visible node with invisible children should make them all visible", ()=>{
            simpleHiddenHierarchy.visible = true;
            codeMapActionService.showNode(simpleHiddenHierarchy);
            checkTreeVisibility(simpleHiddenHierarchy, true);
        });

        it("showing visible node with mixed children should make them all visible", ()=>{
            simpleHiddenHierarchy.visible = true;
            simpleHiddenHierarchy.children[0].visible = true;
            codeMapActionService.showNode(simpleHiddenHierarchy);
            checkTreeVisibility(simpleHiddenHierarchy, true);
        });

        it("toggling visible node should call hide method", ()=>{
            let tmp = codeMapActionService.hideNode;
            codeMapActionService.hideNode = jest.fn();
            codeMapActionService.toggleNodeVisibility(visibleNode);
            expect(codeMapActionService.hideNode).toHaveBeenCalledWith(visibleNode)
            codeMapActionService.hideNode = tmp;
        });

        it("toggling hidden node should call show method", ()=>{
            let tmp = codeMapActionService.showNode;
            codeMapActionService.showNode = jest.fn();
            codeMapActionService.toggleNodeVisibility(hiddenNode);
            expect(codeMapActionService.showNode).toHaveBeenCalledWith(hiddenNode)
            codeMapActionService.showNode = tmp;
        });


    });

});