import {stubDate} from "../../../mocks/dateMock.helper";
import {FileDownloader} from "./fileDownloader";
import {CCFile} from "../codeCharta.model";

describe("app.codeCharta.core.fileDownloader", function() {

    const file: CCFile = {
        fileMeta: {
            projectName: "myProjectName",
            fileName: "myFilename",
            apiVersion: "1.1.1",
        },
        map: {
            name: "root",
            type: "Folder",
            path: "/root",
            visible: true,
            attributes: {},
            children: [
                {
                    name: "a",
                    type: "Folder",
                    path: "/root/a",
                    visible: false,
                    attributes: {},
                    children: [
                        {
                            name: "aa",
                            type: "File",
                            path: "/root/a/aa",
                            visible: true,
                            attributes: {},
                        }
                    ]
                },
                {
                    name: "b",
                    type: "File",
                    path: "/root/b",
                    visible: false,
                    attributes: {},
                }
            ]
        },
        settings: {
            fileSettings: {
                edges: "myEdges",
                attributeTypes: "myAttributeTypes",
            }
        }
    }

    stubDate(new Date('2018-12-14T09:39:59'));

    it("should add json extension to given string", function() {
        expect(FileDownloader.addJsonFileEndingIfNecessary("fileSettings")).toBe("fileSettings.json");
    });

    it("should keep json extension with given string", function() {
        expect(FileDownloader.addJsonFileEndingIfNecessary("fileSettings.json")).toBe("fileSettings.json");
    });

    it("should add date string before json extension", function() {
        const filenameWithDate = FileDownloader.addDateToFileName("fileSettings.json");
        const regexp = new RegExp('^fileSettings\.\\d{2}_\\d{2}_\\d{4}\.json$');
        expect(regexp.test(filenameWithDate)).toBeTruthy();
    });

    it("should remove visible attribute from settings.map", function() {
        expect(FileDownloader.removeJsonHashkeysAndVisibleAttribute(file.map)).toMatchSnapshot();
    });

    it("should return correct project json content", function() {
        FileDownloader.downloadData = jest.fn(function() {return true;});
        expect(FileDownloader.getProjectDataAsCCJsonFormat(file)).toMatchSnapshot();
    });

});