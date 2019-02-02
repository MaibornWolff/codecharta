import {SettingsService} from "../../core/settings/settings.service";
import {BlacklistPanelController} from "./blacklistPanel.component";
import {CodeMapActionsService} from "../codeMap/codeMap.actions.service";
import {CodeMapNode, BlacklistType} from "../../core/data/model/CodeMap";

describe("blacklistController", () => {

    let blacklistPanelController: BlacklistPanelController;
    let settingsServiceMock: SettingsService;
    let codeMapActionsServiceMock: CodeMapActionsService;
    let simpleHierarchy: CodeMapNode;
    let blacklistItem;

    function rebuildSUT() {
        blacklistPanelController = new BlacklistPanelController(settingsServiceMock, codeMapActionsServiceMock);
    }

    function mockEverything() {

        const SettingsServiceMock = jest.fn<SettingsService>(() => ({
            subscribe: jest.fn(),
            applySettings: jest.fn(),
            onSettingsChanged: jest.fn(),
            settings: {
                map: {
                    nodes: []
                },
                blacklist: []
            }
        }));

        settingsServiceMock = new SettingsServiceMock();

        const CodeMapActionsServiceMock = jest.fn<CodeMapActionsService>(() => ({
            removeBlacklistEntry: jest.fn()
        }));

        codeMapActionsServiceMock = new CodeMapActionsServiceMock();

        rebuildSUT();

        simpleHierarchy = {
            name: "root",
            type: "Folder",
            path: "/root",
            attributes: {},
            children: [
                {
                    name: "a",
                    type: "Folder",
                    path: "/root/a",
                    attributes: {},
                    children: [
                        {
                            name: "aa",
                            type: "File",
                            path: "/root/a/aa",
                            attributes: {},
                        },
                        {
                            name: "ab",
                            type: "Folder",
                            path: "/root/a/ab",
                            attributes: {},
                            children: [
                                {
                                    name: "aba",
                                    path: "/root/a/ab/aba",
                                    type: "File",
                                    attributes: {},
                                }
                            ]
                        },
                    ]
                },
                {
                    name: "b",
                    type: "File",
                    path: "/root/b",
                    attributes: {},
                }
            ]
        };

        blacklistItem = {path: "/root", type: BlacklistType.exclude};
        settingsServiceMock.settings.map.nodes = simpleHierarchy;
    }

    function getFilteredBlacklistBy(blacklistItem) {
        if (settingsServiceMock.settings.blacklist) {
            return settingsServiceMock.settings.blacklist.filter((item) => {
                return item.path == blacklistItem.path && item.type == blacklistItem.type
            });
        } else {
            return [];
        }
    }

    beforeEach(()=>{
        mockEverything();
    });

    it("add and call includingNode function when removing blacklist entry", () => {
        settingsServiceMock.settings.blacklist.push(blacklistItem);
        expect(getFilteredBlacklistBy({path: "/root", type: BlacklistType.exclude})).toHaveLength(1);

        blacklistPanelController.removeBlacklistEntry(blacklistItem);
        expect(codeMapActionsServiceMock.removeBlacklistEntry).toHaveBeenCalledWith({path: "/root", type: "exclude"});
    });

    it("update local blacklist with settingsService onSettingsChanged", () => {
        settingsServiceMock.settings.blacklist = [blacklistItem];
        blacklistPanelController.onSettingsChanged(settingsServiceMock.settings, null);
        expect(blacklistPanelController.blacklist).toEqual(settingsServiceMock.settings.blacklist);
    });
});