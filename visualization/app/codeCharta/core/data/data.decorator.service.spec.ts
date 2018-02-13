import "./data.module";
import {NGMock} from "../../../ng.mockhelper";
import DoneCallback = jest.DoneCallback;
import {CodeMap} from "./model/CodeMap";
import {TEST_FILE_DATA, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B} from "./data.mocks";
import {DeltaCalculatorService} from "./data.deltaCalculator.service";
import {DataDecoratorService} from "./data.decorator.service";
import * as d3 from "d3";

/**
 * @test {DataService}
 */
describe("app.codeCharta.core.data.dataService", function() {

    let a: CodeMap;
    let b: CodeMap;
    let dataDecoratorService: DataDecoratorService;

    beforeEach(NGMock.mock.module("app.codeCharta.core.data"));

    beforeEach(NGMock.mock.inject(function (_dataDecoratorService_) {dataDecoratorService = _dataDecoratorService_;}));

    beforeEach(function() {
        a = JSON.parse(JSON.stringify(TEST_DELTA_MAP_A));
        b = JSON.parse(JSON.stringify(TEST_DELTA_MAP_B));
    });

    it("decorator should do nothing if there is no map and root", ()=>{
        a = undefined;
        b.root = undefined;
        dataDecoratorService.decorateMapWithOriginAttribute(a);
        dataDecoratorService.decorateMapWithOriginAttribute(b);
        dataDecoratorService.decorateMapWithUnaryMetric(a);
        dataDecoratorService.decorateMapWithUnaryMetric(b);
        expect(a).not.toBeDefined();
        expect(b.root).not.toBeDefined();
    });

    it("unary decorator should add unaries", ()=>{
        a.root.children[0].attributes = {};
        dataDecoratorService.decorateMapWithUnaryMetric(a);
        expect(a.root.children[0].attributes["unary"]).toBe(1);
    });


    it("origin decorator should add origins", ()=>{
        a.root.children[0].origin = "";
        dataDecoratorService.decorateMapWithOriginAttribute(a);
        expect(a.root.children[0].origin).toBe(a.fileName);
    });

});

