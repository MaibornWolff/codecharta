import {stubDate} from "../../../mocks/dateMock.helper";
import {FileDownloader} from "./fileDownloader";
import {CCFile} from "../codeCharta.model";
import {TEST_FILE_DATA, TEST_FILE_DATA_DOWNLOADED} from "./dataMocks"

describe("fileDownloader", () => {
    let file : CCFile;

    beforeEach(() => {
        file = TEST_FILE_DATA

        FileDownloader["downloadData"] = jest.fn()
    })

    describe("downloadCurrentMap", () => {
        it("should", () => {
            stubDate(new Date('2018-12-14T09:39:59'));

            FileDownloader.downloadCurrentMap(file)

            expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
            expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(TEST_FILE_DATA_DOWNLOADED, TEST_FILE_DATA_DOWNLOADED.fileName)
        })
    })

    /*it("should add json extension to given string", function() {
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
    });*/

});