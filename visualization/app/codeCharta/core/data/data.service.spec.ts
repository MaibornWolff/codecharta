import "./data.module";
import {NGMock} from "../../../ng.mockhelper";
import {DataService} from "./data.service";
import {CodeMap} from "./model/CodeMap";
import {TEST_FILE_DATA} from "./data.mocks";
import {CodeMapNode} from "../../../../../gh-pages/visualization/app/app/codeCharta/core/data/model/CodeMap";
import * as d3 from "d3";

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

    it("resetting map should clear everything", ()=>{
        dataService.setMap(data, 0);
        dataService.setMap(data, 1);
        dataService.resetMaps();
        expect(dataService.data.renderMap).toBe(null);
        expect(dataService.data.metrics).toEqual([]);
    });

    it("setting a map should set it as render map and add the origin attribute", ()=>{
        dataService.setMap(data, 0);
        expect(dataService.data.renderMap.root.origin).toBe(dataService.data.renderMap.fileName);
    });

    it("setting a map should set it as render map and every node should have attributes", ()=>{
        dataService.setMap(data, 0);
        let root = d3.hierarchy<CodeMapNode>(dataService.data.renderMap.root);
        root.each((node)=>{
            expect(node.data.attributes).toBeDefined();
        });
    });

    it("setting a comparison map should do nothing if map at index does not exist", ()=>{
        dataService.setMap(data, 0);
        dataService.setComparisonMap(1);
        expect(dataService.data.renderMap.fileName).toBe(data.fileName);
    });

    it("setting a reference map should do nothing if map at index does not exist", ()=>{
        dataService.setMap(data, 0);
        dataService.setReferenceMap(1);
        expect(dataService.data.renderMap.fileName).toBe(data.fileName);
    });

});

