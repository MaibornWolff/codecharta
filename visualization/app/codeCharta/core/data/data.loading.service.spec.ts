import "./data.module.ts";
import angular from "angular";
import {DataLoadingService} from "./data.loading.service.ts";
import {TEST_FILE_CONTENT} from "./data.mocks.ts";

/**
 * @test {DataLoadingService}
 */
describe("app.codeCharta.core.data.dataLoadingService", function () {

    let dataLoadingService: DataLoadingService,
        validFileContent;

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.module("app.codeCharta.core.data"));
    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.inject(function (_dataLoadingService_) {
        dataLoadingService = _dataLoadingService_;
        validFileContent = TEST_FILE_CONTENT;
    }));

    it("should resolve valid file", (done)=> {
        dataLoadingService.loadMapFromFileContent("file.json", validFileContent, 0).then(done, done.fail);
    });

    it("should reject invalid file", (done)=> {
        let invalidFileContent = validFileContent;
        delete invalidFileContent.projectName;
        dataLoadingService.loadMapFromFileContent("file.json", invalidFileContent, 0).then(()=>{done.fail()}, done);
    });

});

