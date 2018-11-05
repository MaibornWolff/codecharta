import {CodeMapActionsService} from "./codeMap.actions.service";
import {CodeMapNode, Exclude, ExcludeType} from "../../core/data/model/CodeMap";

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

    function checkBlacklistItems(type: ExcludeType, node: CodeMapNode, shouldExist: boolean) {
        const amountOfFoundItems = codeMapActionService.settingsService.settings.blacklist.filter(b =>
            b.type == type && b.path == node.path).length == 1;
        expect(amountOfFoundItems).toBe(shouldExist);
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

    describe("node visibility", ()=>{

        beforeEach(()=>{
            codeMapActionService.settingsService.settings = {
                map: {
                    root: simpleHiddenHierarchy
                },
                blacklist: blacklistItems
            };
        });

        it("showing all nodes should remove all nodes of type blacklistHide and blacklistIsolate", ()=>{
            codeMapActionService.isolateNode(simpleHiddenHierarchy);
            codeMapActionService.hideNode(simpleHiddenHierarchy.children[0].children[0]);
            codeMapActionService.hideNode(simpleHiddenHierarchy.children[0]);
            checkBlacklistItems(ExcludeType.isolate, simpleHiddenHierarchy, true);
            checkBlacklistItems(ExcludeType.hide, simpleHiddenHierarchy.children[0].children[0], true);
            checkBlacklistItems(ExcludeType.hide, simpleHiddenHierarchy.children[0], true);
            codeMapActionService.showAllNodes();
            checkBlacklistItems(ExcludeType.isolate, simpleHiddenHierarchy, false);
            checkBlacklistItems(ExcludeType.hide, simpleHiddenHierarchy.children[0].children[0], false);
            checkBlacklistItems(ExcludeType.hide, simpleHiddenHierarchy.children[0], false);
        });

        it("isolating node should remove this node if it was hidden and add it as blacklistIsolate item", ()=>{
            codeMapActionService.hideNode(simpleHiddenHierarchy.children[1]);
            checkBlacklistItems(ExcludeType.hide, simpleHiddenHierarchy.children[1], true);
            codeMapActionService.isolateNode(simpleHiddenHierarchy.children[1]);
            checkBlacklistItems(ExcludeType.isolate, simpleHiddenHierarchy.children[1], true);
            checkBlacklistItems(ExcludeType.hide, simpleHiddenHierarchy.children[1], false);
        });

        it("isolating node should keep other hidden nodes and add itself as blacklistIsolate item", ()=>{
            codeMapActionService.hideNode(simpleHiddenHierarchy.children[0]);
            checkBlacklistItems(ExcludeType.hide, simpleHiddenHierarchy.children[0], true);
            codeMapActionService.isolateNode(simpleHiddenHierarchy.children[1]);
            checkBlacklistItems(ExcludeType.isolate, simpleHiddenHierarchy.children[1], true);
            checkBlacklistItems(ExcludeType.hide, simpleHiddenHierarchy.children[0], true);
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

        it("including node should remove blacklistExcluded item", ()=>{
            codeMapActionService.excludeNode(simpleHiddenHierarchy);
            checkBlacklistItems(ExcludeType.exclude, simpleHiddenHierarchy, true);
            codeMapActionService.includeNode({path: "/root", type: ExcludeType.exclude});
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
});