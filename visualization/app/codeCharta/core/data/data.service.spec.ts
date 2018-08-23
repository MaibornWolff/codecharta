import "./data.module";
import {NGMock} from "../../../../mocks/ng.mockhelper";
import {DataService, DataServiceSubscriber} from "./data.service";
import {CodeMap} from "./model/CodeMap";
import {TEST_DELTA_MAP_A, TEST_DELTA_MAP_B, TEST_FILE_DATA} from "./data.mocks";
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
    beforeEach(NGMock.mock.inject(function (_dataService_) {
        dataService = _dataService_;
    }));

    beforeEach(function () {
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

    it("should retrieve instance", () => {
        expect(dataService).not.toBe(undefined);
    });

    it("subscribe/notify", () => {

        let subscriber: DataServiceSubscriber = {
            onDataChanged: jest.fn();
        };

        dataService.subscribe(subscriber);

        dataService.data.metrics = ["HELLO"];
        dataService.notify();

        expect(subscriber.onDataChanged).toHaveBeenCalledWith({"metrics": ["HELLO"], "renderMap": null, "revisions": []}, expect.anything());

    });

    it("set metrics should set metrics correctly", ()=>{
        dataService.setMap(data, 0);
        dataService.updateMetrics();
        expect(dataService.data.metrics).toEqual(["RLOC", "Functions", "MCC", "unary"]);
    });

    it("set metrics should set metrics correctly with multiple maps", ()=>{
        dataService.setMap(data, 0);
        let data2 = JSON.parse(JSON.stringify(data));
        data2.root.children[0].attributes["test"] = 0;
        dataService.setMap(data2, 0);
        dataService.updateMetrics();
        expect(dataService.data.metrics).toEqual(["RLOC", "Functions", "MCC", "unary", "test"]);
    });

    it("set metrics should not set metrics when all maps are null", ()=>{
        dataService._data.revisions = [];
        dataService.updateMetrics();
        expect(dataService.data.metrics).toEqual([]);
    });

    it("resetting map should clear everything", () => {
        dataService.setMap(data, 0);
        dataService.setMap(data, 1);
        dataService.resetMaps();
        expect(dataService.data.renderMap).toBe(null);
        expect(dataService.data.metrics).toEqual([]);
    });

    it("resetting map should clear everything", () => {
        dataService.setMap(data, 0);
        dataService.setMap(data, 1);
        dataService.notify = jest.fn();
        dataService.resetMaps();
        expect(dataService.data.renderMap).toBe(null);
        expect(dataService._lastComparisonMap).toBe(null);
        expect(dataService.data.metrics).toEqual([]);
        expect(dataService.data.revisions).toEqual([]);
        expect(dataService.notify).toHaveBeenCalled();
    });

    it("setting a map should set it as render map and add the origin attribute", () => {
        dataService.setMap(data, 0);
        expect(dataService.data.renderMap.root.origin).toBe(dataService.data.renderMap.fileName);
    });

    it("setting a comparison map should do nothing if map at index does not exist", () => {
        dataService.setMap(data, 0);
        dataService.setComparisonMap(1);
        expect(dataService.data.renderMap.fileName).toBe(data.fileName);
    });

    it("setting a map should set it as render map and every node should have attributes", () => {
        dataService.setMap(data, 0);
        let root = d3.hierarchy<CodeMapNode>(dataService.data.renderMap.root);
        root.each((node) => {
            expect(node.data.attributes).toBeDefined();
        });
    });

    it("setting a comparison map should do nothing if map at index does not exist", () => {
        dataService.setMap(data, 0);
        dataService.setComparisonMap(1);
        expect(dataService.data.renderMap.fileName).toBe(data.fileName);
    });

    it("setting a reference map should do nothing if map at index does not exist", () => {
        dataService.setMap(data, 0);
        dataService.setReferenceMap(1);
        expect(dataService.data.renderMap.fileName).toBe(data.fileName);
    });

    it("activating deltas when deltas are not enabled should toggle the delta flag and re-set the current comparison map", () => {
        dataService._lastReferenceIndex = 42;
        dataService._deltasEnabled = false;
        dataService.setComparisonMap = jest.fn();
        dataService.onActivateDeltas();
        expect(dataService._deltasEnabled).toBe(true);
        expect(dataService.setComparisonMap).toHaveBeenCalledWith(42);
    });

    it("activating deltas when deltas are enabled should do nothing", () => {
        dataService._deltasEnabled = true;
        dataService.setComparisonMap = jest.fn();
        dataService.onActivateDeltas();
        expect(dataService._deltasEnabled).toBe(true);
        expect(dataService.setComparisonMap).not.toHaveBeenCalled();
    });


    it("deactivating deltas when deltas are enabled should set the flag and maps correctly", () => {
        dataService._lastReferenceIndex = 42;
        dataService._deltasEnabled = true;
        dataService.setComparisonMap = jest.fn();
        dataService.onDeactivateDeltas();
        expect(dataService._deltasEnabled).toBe(false);
        expect(dataService.setComparisonMap).toHaveBeenCalledWith(42);
    });

    it("deactivating deltas when deltas are not enabled should do nothing", () => {
        dataService._deltasEnabled = false;
        dataService.setComparisonMap = jest.fn();
        dataService.onDeactivateDeltas();
        expect(dataService._deltasEnabled).toBe(false);
        expect(dataService.setComparisonMap).not.toHaveBeenCalled();
    });

    it("process deltas should do nothing if maps are not set or deltas are not enabled", () => {
        dataService._deltasEnabled = false;
        dataService.deltaCalculatorService.provideDeltas = jest.fn();
        dataService.processDeltas();
        expect(dataService.deltaCalculatorService.provideDeltas).not.toHaveBeenCalled();
    });

    it("process deltas should call deltaCalculator if maps and deltas are set", () => {
        dataService._deltasEnabled = true;
        dataService._data.renderMap = "render map";
        dataService._data.metrics = ["special"];
        dataService._lastComparisonMap = "comparison map";
        dataService.deltaCalculatorService.provideDeltas = jest.fn();
        dataService.processDeltas();
        expect(dataService.deltaCalculatorService.provideDeltas).toHaveBeenCalledWith("render map", "comparison map", ["special"]);
    });

    it("only calculate deltas when two maps exist and deltas are enabled", () => {

        dataService.notify = jest.fn();
        dataService.deltaCalculatorService.provideDeltas = jest.fn();

        dataService._deltasEnabled = true;

        dataService.setMap(TEST_DELTA_MAP_A, 0);
        dataService.setMap(TEST_DELTA_MAP_B, 1);
        dataService.setReferenceMap(0);
        dataService.setComparisonMap(1);

        expect(dataService.deltaCalculatorService.provideDeltas).toHaveBeenCalled();

    });

    it("middle package compacting should only be called after delta calculation, never before", () => {

        dataService.notify = jest.fn();
        dataService.deltaCalculatorService.provideDeltas = jest.fn();
        dataService.dataDecoratorService.decorateMapWithCompactMiddlePackages = jest.fn();

        dataService._deltasEnabled = true;

        dataService.setMap(TEST_DELTA_MAP_A, 0);

        let compactingCalledBeforeDeltas = false;
        dataService.dataDecoratorService.decorateMapWithCompactMiddlePackages = jest.fn(()=>{
            compactingCalledBeforeDeltas = dataService.deltaCalculatorService.provideDeltas.mock.calls.length == 0;
        });
        dataService.deltaCalculatorService.provideDeltas.mockClear();
        expect(dataService.deltaCalculatorService.provideDeltas.mock.calls.length).toBe(0);

        dataService.setMap(TEST_DELTA_MAP_B, 1);

        expect(compactingCalledBeforeDeltas).toBeTruthy();

    });

    it("do not calculate deltas when two maps exist and deltas are not enabled", () => {

        dataService.notify = jest.fn();
        dataService.deltaCalculatorService.decorateMapsWithDeltas = jest.fn();

        dataService._deltasEnabled = false;

        dataService.setMap(TEST_DELTA_MAP_A, 0);
        dataService.setMap(TEST_DELTA_MAP_B, 1);
        dataService.setReferenceMap(0);
        dataService.setComparisonMap(1);

        expect(dataService.deltaCalculatorService.decorateMapsWithDeltas).not.toHaveBeenCalled();

    });

    it("should get max metric of all revisions correctly", ()=>{
        dataService.setMap(TEST_DELTA_MAP_A, 0);
        dataService.setMap(TEST_DELTA_MAP_B, 1);
        dataService.setReferenceMap(0);
        dataService.setComparisonMap(1);
        expect(dataService.getMaxMetricInAllRevisions("rloc")).toBe(100);
        expect(dataService.getMaxMetricInAllRevisions("functions")).toBe(1000);
    });

});

