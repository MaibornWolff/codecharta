import "./download.module";
import {getService, instantiateModule} from "../../../../mocks/ng.mockhelper";
import {SettingsService} from "../settings/settings.service";
import {DownloadService} from "./download.service";
import { stubDate } from '../../../../mocks/dateMock.helper';

describe("app.codeCharta.core.download", function() {

    let services, downloadService: DownloadService;

    beforeEach(() => {
        restartSystem();
        withSettingsServiceMock();
        rebuildController();
    });

    function restartSystem() {
        instantiateModule("app.codeCharta.core.download");

        services = {
            settingsService: getService<SettingsService>("settingsService"),
        };
    }

    function rebuildController() {
        downloadService = new DownloadService(
            services.settingsService
        );
    }

    function withSettingsServiceMock() {
        services.settingsService = {
            settings: {
                map: {
                    edges: "myEdges",
                    attributeTypes: "myAttributeTypes",
                    projectName: "myProjectName",
                    apiVersion: "1.1.1",
                    fileName: "myFilename",
                    nodes: {
                        name: "root",
                        type: "Folder",
                        path: "/root",
                        visible: "true",
                        attributes: {},
                        children: [
                            {
                                name: "a",
                                type: "Folder",
                                path: "/root/a",
                                visible: "false",
                                attributes: {},
                                children: [
                                    {
                                        name: "aa",
                                        type: "File",
                                        path: "/root/a/aa",
                                        visible: "true",
                                        attributes: {},
                                    }
                                ]
                            },
                            {
                                name: "b",
                                type: "File",
                                path: "/root/b",
                                visible: "false",
                                attributes: {},
                            }
                        ]
                    }
                },
            },
            blacklist: "myBlacklistItems",
        };
    }

    afterEach(()=>{
        jest.resetAllMocks();
    });

    describe("", ()=> {

        stubDate(new Date('2018-12-14T09:39:59'));

        it("should add json extension to given string", function() {
            expect(downloadService.addJsonFileEndingIfNecessary("abc")).toBe("abc.json");
        });

        it("should keep json extension with given string", function() {
            expect(downloadService.addJsonFileEndingIfNecessary("abc.json")).toBe("abc.json");
        });


        it("should add date string before json extension", function() {
            const filenameWithDate = downloadService.addDateToFileName("abc.json");
            const regexp = new RegExp('^abc\.\\d{2}_\\d{2}_\\d{4}\.json$');
            expect(regexp.test(filenameWithDate)).toBeTruthy();
        });

        it("should remove visible attribute from settings.map", function() {
            withSettingsServiceMock();
            const rootNode = services.settingsService.settings.map.nodes;
            expect(downloadService.removeJsonHashkeysAndVisibleAttribute(rootNode)).toMatchSnapshot();
        });

        it("should return correct project json content", function() {
            downloadService.downloadData = jest.fn(function() {return true;});
            expect(downloadService.getProjectDataAsCCJsonFormat()).toMatchSnapshot();
        });

    });
});