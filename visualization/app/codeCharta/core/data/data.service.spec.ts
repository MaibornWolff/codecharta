import "./data.module";
import {NGMock} from "../../../ng.mockhelper";
import {DataService} from "./data.service";
import {CodeMap} from "./model/CodeMap";
import {TEST_FILE_DATA} from "./data.mocks";

/**
 * @test {DataService}
 */
describe("app.codeCharta.core.data.dataService", function() {

    let data: CodeMap;
    let dataService: DataService;

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NGMock.mock.module("app.codeCharta.core.data"));

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NGMock.mock.inject(function (_dataService_) {dataService = _dataService_;}));

    beforeEach(function() {
        data = TEST_FILE_DATA;
    });

    /**
     * @test {DataService#constructor}
     */
    it("metrics should be empty when no file is loaded", () => {

        // system under test
        let sut = dataService;

        // assertion
        expect(sut.data.metrics.length).toBe(0);

    });

    it("should find all metrics, even in child nodes", () => {
        let sut = dataService;
        sut.setMap(data, 0);
        expect(sut.data.metrics.length).toBe(4);
    });

    it("should retrieve instance", ()=>{
        expect(dataService).not.toBe(undefined);
    });


});

