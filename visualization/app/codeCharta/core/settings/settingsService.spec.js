require("./settings.js");

/**
 * @test {SettingsService}
 */
describe("app.codeCharta.core.settings.settingsService", function() {

    beforeEach(angular.mock.module("app.codeCharta.core.settings"));
    
    /**
     * @test {SettingsService#constructor}
     */
    it("should retrieve the angular service instance with enabled delta cubes and no details selected", angular.mock.inject(function(settingsService){
        expect(settingsService).to.not.equal(undefined);
        expect(settingsService.settings.deltas).to.equal(true);
    }));

    /**
     * @test {SettingsService#onSettingsChanged}
     * @test {SettingsService#constructor}
     */
    it("should react to data-changed events", angular.mock.inject(function(settingsService, $rootScope){

        settingsService.onSettingsChanged = sinon.spy();

        //enough metrics
        $rootScope.$broadcast("data-changed", {referenceMap: {"name":"some map"}, metrics: ["a","b","c"]});

        expect(settingsService.settings.map.name).to.equal("some map");
        expect(settingsService.settings.areaMetric).to.equal("a");
        expect(settingsService.settings.heightMetric).to.equal("b");
        expect(settingsService.settings.colorMetric).to.equal("c");

        //not enough metrics
        $rootScope.$broadcast("data-changed", {referenceMap: {"name":"another map"}, metrics: ["a"]});

        expect(settingsService.settings.map.name).to.equal("another map");
        expect(settingsService.settings.areaMetric).to.equal("a");
        expect(settingsService.settings.heightMetric).to.equal("a");
        expect(settingsService.settings.colorMetric).to.equal("a");

        expect(settingsService.onSettingsChanged.calledTwice);

    }));

    /**
     * @test {SettingsService#onSettingsChanged}
     * @test {SettingsService#constructor}
     */
    it("should react to data-changed events and set metrics correctly", angular.mock.inject(function(settingsService, $rootScope){

        settingsService.onSettingsChanged = sinon.spy();

        $rootScope.$broadcast("data-changed", {currentmap: {"name":"yet another map"}, metrics: ["a", "b"]});

        expect(settingsService.settings.map.name).to.equal("yet another map");
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
        expect(result).to.deep.equal(expected);
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