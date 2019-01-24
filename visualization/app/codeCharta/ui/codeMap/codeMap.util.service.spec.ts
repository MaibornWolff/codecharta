import {CodeMapNode} from "../../core/data/model/CodeMap";
import {CodeMapUtilService} from "./codeMap.util.service";

import {SettingsService} from "../../core/settings/settings.service";
jest.mock("../../core/settings/settings.service");

describe("codeMapUtil", () => {

    let codeMapUtilService: CodeMapUtilService, settingsServiceMock: SettingsService;
    let simpleHierarchy: CodeMapNode;

    beforeEach(() => {

        const SettingsServiceMock = jest.fn<SettingsService>(() => ({
            subscribe: jest.fn(),
            applySettings: jest.fn(),
            settings: {
                map: {
                    root: null
                }
            }
        }));

        settingsServiceMock = new SettingsServiceMock();
        codeMapUtilService = new CodeMapUtilService(settingsServiceMock);

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
                        {
                            name: "ab",
                            path: "/root/a/ab",
                            type: "File",
                            attributes: {},
                        }
                    ]
                }
            ]
        };

        codeMapUtilService.settingsService.settings.map.root = simpleHierarchy;

    });

    it("should get folder-node with name 'ab'", () => {
        const expectedMatchingNode = simpleHierarchy.children[0].children[1];
        const matchingNode = codeMapUtilService.getAnyCodeMapNodeFromPath("/root/a/ab");
        expect(matchingNode).toBe(expectedMatchingNode);
    });

    it("should get leaf-node with name 'aba'", () => {
        const expectedMatchingNode = simpleHierarchy.children[0].children[0].children[0];
        const matchingNode = codeMapUtilService.getAnyCodeMapNodeFromPath("/root/a/ab/aba");
        expect(matchingNode).toBe(expectedMatchingNode);
    });

    it("should get leaf-node with name 'aba' as File", () => {
        const expectedMatchingNode = simpleHierarchy.children[0].children[0].children[0];
        const matchingNode = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab/aba", "File");
        expect(matchingNode).toBe(expectedMatchingNode);
    });

    it("should get leaf-node with name 'ab' as Folder", () => {
        const expectedMatchingNode = simpleHierarchy.children[0].children[0];
        const matchingNode = codeMapUtilService.getCodeMapNodeFromPath("/root/a/ab", "Folder");
        expect(matchingNode).toBe(expectedMatchingNode);
    });
});