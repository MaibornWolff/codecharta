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
        $rootScope.$broadcast("data-changed", {currentmap: {"name":"some map"}, metrics: ["a","b","c"]});

        expect(settingsService.settings.map.name).to.equal("some map");
        expect(settingsService.settings.areaMetric).to.equal("a");
        expect(settingsService.settings.heightMetric).to.equal("b");
        expect(settingsService.settings.colorMetric).to.equal("c");

        //not enough metrics
        $rootScope.$broadcast("data-changed", {currentmap: {"name":"another map"}, metrics: ["a"]});

        expect(settingsService.settings.map.name).to.equal("some map");
        expect(settingsService.settings.areaMetric).to.equal("a");
        expect(settingsService.settings.heightMetric).to.equal("b");
        expect(settingsService.settings.colorMetric).to.equal("c");

        expect(settingsService.onSettingsChanged.calledOnce);

    }));
    /**
          * @test {SettingsService#getMetricOrDefault}
          */
    it("should return defaultValue when metric is not in array", angular.mock.inject(function(settingsService, $rootScope){
        
        var arr = ["a", "b", "c"];
        var name = "lookingForThis";
        var defaultValue = "default";
        
        var result = settingsService.getMetricOrDefault(arr, name, defaultValue);
        
        expect(result).to.equal(defaultValue);
        
    }));
    
    /**
     * @test {SettingsService#getMetricOrDefault}
     */
    it("should return the searched value when metric is in array", angular.mock.inject(function(settingsService, $rootScope){
                
        var arr = ["a", "b", "lookingForThis"];
        var name = "lookingForThis";
        var defaultValue = "default";
                
        var result = settingsService.getMetricOrDefault(arr, name, defaultValue);
                
        expect(result).to.equal(name);
                
    }));
    /**
     * @test {SettingsService#correctSettings}
     */
    it("should replace metric with default if metric is not available", angular.mock.inject(function(settingsService, dataService, $rootScope){
        dataService.data.metrics = ["a", "f", "g", "h"];
        var settings = {areaMetric:"a", heightMetric:"b", colorMetric:"c"};
        var expected = {areaMetric: "a", heightMetric:"f", colorMetric:"g"};
        var result = settingsService.correctSettings(settings);
        expect(result).to.deep.equal(expected);
    }));
    /**
     * @test {SettingsService#correctSettings}
     */
    it("should return input if metrics are available", angular.mock.inject(function(settingsService, $rootScope){
        var settings = {areaMetric:"a", heightMetric:"b", colorMetric:"c"};
        var result = settingsService.correctSettings(settings);
        expect(result).to.deep.equal(settings);
    }));
});