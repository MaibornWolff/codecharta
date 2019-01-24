import {SettingsService} from "../../core/settings/settings.service";
import {BlacklistPanelController} from "./blacklistPanel.component";
import {CodeMapActionsService} from "../codeMap/codeMap.actions.service";
import {CodeMapNode, BlacklistType} from "../../core/data/model/CodeMap";

describe("blacklistController", () => {

    let blacklistPanelController: BlacklistPanelController;
    let settingsServiceMock: SettingsService;
    let codeMapActionsServiceMock: CodeMapActionsService;
    let simpleHierarchy: CodeMapNode;
    let viewModel;

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
                    root: []
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

        viewModel = {
            itemPath: "/root",
            itemType: BlacklistType.exclude,
            error: ""
        };

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
        blacklistPanelController.viewModel = viewModel;
        settingsServiceMock.settings.map.root = simpleHierarchy;
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

    it("add single blacklist entry", () => {
        blacklistPanelController.addBlacklistEntry();
        expect(getFilteredBlacklistBy({path: "/root", type: BlacklistType.exclude})).toHaveLength(1);
    });

    it("add only unique blacklist Entries", () => {
        blacklistPanelController.addBlacklistEntry();
        blacklistPanelController.addBlacklistEntry();

        expect(getFilteredBlacklistBy({path: "/root", type: BlacklistType.exclude})).toHaveLength(1);
        expect(blacklistPanelController.viewModel.error).toBe("Pattern already blacklisted");
    });

    it("not add invalid node to blacklist", () => {
        blacklistPanelController.viewModel.itemPath = "/notanode";
        blacklistPanelController.addBlacklistEntry();

        expect(settingsServiceMock.settings.blacklist).toHaveLength(0);
        expect(blacklistPanelController.viewModel.error).toBe("Pattern not found");
    });

    it("not add invalid node with empty path", () => {
        blacklistPanelController.viewModel.itemPath = "";
        blacklistPanelController.addBlacklistEntry();

        expect(settingsServiceMock.settings.blacklist).toHaveLength(0);
        expect(blacklistPanelController.viewModel.error).toBe("Invalid empty pattern");
    });

    it("add and call includingNode function when removing blacklist entry", () => {
        blacklistPanelController.addBlacklistEntry();
        expect(getFilteredBlacklistBy({path: "/root", type: BlacklistType.exclude})).toHaveLength(1);

        blacklistPanelController.removeBlacklistEntry(viewModel);
        expect(codeMapActionsServiceMock.removeBlacklistEntry).toHaveBeenCalledWith({"error": "", "itemPath": "/root", "itemType": "exclude"});
    });

    it("update local blacklist with settingsService onSettingsChanged", () => {
        settingsServiceMock.settings.blacklist = [{path: viewModel.itemPath, type: viewModel.itemType}];
        blacklistPanelController.onSettingsChanged(settingsServiceMock.settings, null);
        expect(blacklistPanelController.blacklist).toEqual(settingsServiceMock.settings.blacklist);
    });
});