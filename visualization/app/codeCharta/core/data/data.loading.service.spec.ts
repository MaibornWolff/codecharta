import "./data.module";
import {NGMock} from "../../../../mocks/ng.mockhelper";
import {DataLoadingService} from "./data.loading.service";
import {TEST_FILE_CONTENT} from "./data.mocks";

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


    it("should load a file without edges", ()=> {
        validFileContent.edges = undefined;
        return dataLoadingService.loadMapFromFileContent("file.json", validFileContent, 0);
    });

    it("should load a file without edges if no revision index given", ()=> {
        validFileContent.edges = undefined;
        return dataLoadingService.loadMapFromFileContent("file.json", validFileContent);
    });

    it("should resolve valid file", ()=> {
        return dataLoadingService.loadMapFromFileContent("file.json", validFileContent, 0);
    });

    it("should reject null", (done)=> {
        dataLoadingService.loadMapFromFileContent("file.json", null, 0).then(()=>{}, ()=>{
            done();
        }).catch(()=>{
            done()
        });
    });

    it("should reject string", (done)=> {
        dataLoadingService.loadMapFromFileContent("file.json", "string", 0).then(()=>{}, ()=>{
            done();
        }).catch(()=>{
            done()
        });
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

