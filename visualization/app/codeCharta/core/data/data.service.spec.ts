import "./data.module.ts";
import angular from "angular";
import {DataService} from "./data.service.ts";
import {CodeMap} from "./model/CodeMap";
import {TEST_FILE_DATA} from "./data.mocks.ts";

/**
 * @test {DataService}
 */
describe("app.codeCharta.core.data.dataService", function() {

    let data: CodeMap;
    let dataService: DataService;

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.module("app.codeCharta.core.data"));

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.inject(function (_dataService_) {dataService = _dataService_;}));

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
        expect(sut.data.metrics.length).toBe(3);
    });

    it("should retrieve instance", ()=>{
        expect(dataService).not.toBe(undefined);
    });


});

