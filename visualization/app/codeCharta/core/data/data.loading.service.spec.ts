import "./data.module.ts";
import {NGMock} from "../../../ng.mockhelper.ts";
import {DataLoadingService} from "./data.loading.service.ts";
import {TEST_FILE_CONTENT} from "./data.mocks.ts";

/**
 * @test {DataLoadingService}
 */
describe("app.codeCharta.core.data.dataLoadingService", function () {

    let dataLoadingService: DataLoadingService,
        validFileContent;

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NGMock.mock.module("app.codeCharta.core.data"));
    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NGMock.mock.inject(function (_dataLoadingService_) {
        dataLoadingService = _dataLoadingService_;
        validFileContent = TEST_FILE_CONTENT;
    }));

    it("should resolve valid file", ()=> {
        return dataLoadingService.loadMapFromFileContent("file.json", validFileContent, 0);
    });

    it("should reject or catch invalid file", (done)=> {
        let invalidFileContent = validFileContent;
        delete invalidFileContent.projectName;
        dataLoadingService.loadMapFromFileContent("file.json", invalidFileContent, 0).then(()=>{}, ()=>{
            done();
        }).catch(()=>{
            done()
        });
    });

});

