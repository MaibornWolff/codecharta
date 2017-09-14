require("./settings.js");

import {CodeMap} from "../../core/data/model/codeMap";

/**
 * @test {SettingsService}
 */
describe("app.codeCharta.core.settings.settingsService", function() {

    var validData;

    beforeEach(()=>{
        validData = new CodeMap("file", "project", {
            "name": "root",
            "attributes": {},
            "children": [
                {
                    "name": "big leaf",
                    "attributes": {"rloc": 100, "functions": 10, "mcc": 1},
                    "link": "http://www.google.de"
                },
                {
                    "name": "Parent Leaf",
                    "attributes": {},
                    "children": [
                        {
                            "name": "small leaf",
                            "attributes": {"rloc": 30, "functions": 100, "mcc": 100},
                            "children": []
                        },
                        {
                            "name": "other small leaf",
                            "attributes": {"rloc": 70, "functions": 1000, "mcc": 10},
                            "children": []
                        }
                    ]
                }
            ]
        });
    });

    beforeEach(angular.mock.module("app.codeCharta.core.settings"));
    
    /**
     * @test {SettingsService#constructor}
     */
    it("should retrieve the angular service instance with enabled delta cubes and no details selected", angular.mock.inject(function(settingsService){
        expect(settingsService).to.not.equal(undefined);
        expect(settingsService.settings.deltas).to.equal(true);
    }));

    /**
     * @test {SettingsService#getQueryParamString}
     */
    it("should retrieve the correct query param strings", angular.mock.inject(function(settingsService){
        settingsService.settings.areaMetric = "areaStuff";
        settingsService.settings.camera.x = "2";
        expect(settingsService.getQueryParamString()).to.include("areaMetric=areaStuff");
        expect(settingsService.getQueryParamString()).to.include("camera.x=2");
        expect(settingsService.getQueryParamString()).to.include("neutralColorRange.from=10");
    }));

    /**
     * @test {SettingsService#updateSettingsFromUrl}
     */
    it("should update settings from url", angular.mock.inject(function(settingsService, $location){
        $location.url("http://something.de?scaling.x=42&areaMetric=myMetric&scaling.y=0.32");
        settingsService.updateSettingsFromUrl();
        expect(settingsService.settings.scaling.x).to.equal(42);
        expect(settingsService.settings.scaling.y).to.equal(0.32);
        expect(settingsService.settings.areaMetric).to.equal("myMetric");
    }));

    /**
     * @test {SettingsService#updateSettingsFromUrl}
     */
    it("should not update settings.map from url", angular.mock.inject(function(settingsService, $location){
        $location.url("http://something.de?map=aHugeMap");
        settingsService.settings.map="correctMap";
        settingsService.updateSettingsFromUrl();
        expect(settingsService.settings.map).to.equal("correctMap");
    }));

    /**
     * @test {SettingsService#onSettingsChanged}
     * @test {SettingsService#constructor}
     */
    it("should react to data-changed events", angular.mock.inject(function(settingsService, $rootScope){

        settingsService.onSettingsChanged = sinon.spy();

        //enough metrics
        $rootScope.$broadcast("data-changed", {referenceMap: validData, metrics: ["a","b","c"]});

        expect(settingsService.settings.map.fileName).to.equal("file");
        expect(settingsService.settings.areaMetric).to.equal("a");
        expect(settingsService.settings.heightMetric).to.equal("b");
        expect(settingsService.settings.colorMetric).to.equal("c");

        //not enough metrics
        validData.fileName = "file2";
        $rootScope.$broadcast("data-changed", {referenceMap: validData, metrics: ["a"]});

        expect(settingsService.settings.map.fileName).to.equal("file2");
        expect(settingsService.settings.areaMetric).to.equal("a");
        expect(settingsService.settings.heightMetric).to.equal("a");
        expect(settingsService.settings.colorMetric).to.equal("a");

        expect(settingsService.onSettingsChanged.calledTwice);

    }));

    /**
     * @test {SettingsService#onCameraChanged}
     * @test {SettingsService#constructor}
     */
    it("should react to camera-changed events", angular.mock.inject(function(settingsService, $rootScope){

        settingsService.onCameraChanged = sinon.spy();

        $rootScope.$broadcast("camera-changed", {});

        expect(settingsService.onCameraChanged.calledOnce);

    }));

    /**
     * @test {SettingsService#onCameraChanged}
     */
    it("onCameraChanged should update settings object but not call onSettingsChanged to ensure performance", angular.mock.inject(function(settingsService){
        settingsService.onSettingsChanged = sinon.spy();
        settingsService.onCameraChanged({position: {x:0, y:0, z: 42}});
        expect(!settingsService.onSettingsChanged.called);
        expect(settingsService.settings.camera.z).to.equal(42);
    }));


    /**
     * @test {SettingsService#onSettingsChanged}
     * @test {SettingsService#constructor}
     */
    it("should react to data-changed events and set metrics correctly", angular.mock.inject(function(settingsService, $rootScope){

        settingsService.onSettingsChanged = sinon.spy();

        $rootScope.$broadcast("data-changed", {referenceMap: validData, metrics: ["a", "b"]});

        expect(settingsService.settings.map.fileName).to.equal("file");
        expect(settingsService.settings.areaMetric).to.equal("a");
        expect(settingsService.settings.heightMetric).to.equal("b");
        expect(settingsService.settings.colorMetric).to.equal("b");

        expect(settingsService.onSettingsChanged.calledOnce);

    }));

    /**
     * @test {SettingsService#getMetricByIdOrLast}
     */
    it("should return last value when id is bigger than or equal to metrics length", angular.mock.inject(function(settingsService, $rootScope){

        var arr = ["a", "b", "c"];
        var result = settingsService.getMetricByIdOrLast(32, arr);
        expect(result).to.equal("c");

        result = settingsService.getMetricByIdOrLast(3, arr);
        expect(result).to.equal("c");

    }));

    /**
     * @test {SettingsService#getMetricByIdOrLast}
     */
    it("should return correct value when id is smaller than metrics length", angular.mock.inject(function(settingsService, $rootScope){

        var arr = ["a", "b", "c"];
        var result = settingsService.getMetricByIdOrLast(1, arr);
        expect(result).to.equal("b");

    }));

    /**
      * @test {SettingsService#getMetricOrDefault}
      */
    it("should return defaultValue when metric is not in array", angular.mock.inject(function(settingsService){
        
        const arr = ["a", "b", "c"];
        const name = "lookingForThis";
        const defaultValue = "default";
        
        const result = settingsService.getMetricOrDefault(arr, name, defaultValue);

        expect(result).to.equal(defaultValue);
        
    }));
    
    /**
     * @test {SettingsService#getMetricOrDefault}
     */
    it("should return the searched value when metric is in array", angular.mock.inject(function(settingsService){
                
        const arr = ["a", "b", "lookingForThis"];
        const name = "lookingForThis";
        const defaultValue = "default";
                
        const result = settingsService.getMetricOrDefault(arr, name, defaultValue);
                
        expect(result).to.equal(name);
                
    }));
    /**
     * @test {SettingsService#correctSettings}
     */
    it("should replace metric with default if metric is not available", angular.mock.inject(function(settingsService, dataService){
        dataService.data.metrics = ["a", "f", "g", "h"];
        const settings = {areaMetric:"a", heightMetric:"b", colorMetric:"c"};
        const expected = {areaMetric: "a", heightMetric:"f", colorMetric:"g"};
        const result = settingsService.correctSettings(settings);
        expect(result.areaMetric).to.equal(expected.areaMetric);
        expect(result.heightMetric).to.equal(expected.heightMetric);
        expect(result.colorMetric).to.equal(expected.colorMetric);
    }));
    /**
     * @test {SettingsService#correctSettings}
     */
    it("should return input if metrics are available", angular.mock.inject(function(settingsService){
        const settings = {areaMetric:"a", heightMetric:"b", colorMetric:"c"};
        const result = settingsService.correctSettings(settings);
        expect(result).to.deep.equal(settings);
    }));
});