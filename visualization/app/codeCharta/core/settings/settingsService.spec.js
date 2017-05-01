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
     * @test {SettingsService#constructor}
     */
    it("should select RLOC,MCC,MCC as default values if available", angular.mock.inject(function(settingsService, $rootScope){

        $rootScope.$broadcast("data-changed", {currentmap: {"name":"some map"}, metrics: ["a","b","c", "RLOC", "MCC"]});

        expect(settingsService.settings.areaMetric).to.equal("RLOC");
        expect(settingsService.settings.heightMetric).to.equal("MCC");
        expect(settingsService.settings.colorMetric).to.equal("MCC");

    }));

    /**
     * @test {SettingsService#constructor}
     */
    it("should select metric RLOC, 1 and 2 when only RLOC is available", angular.mock.inject(function(settingsService, $rootScope){

        $rootScope.$broadcast("data-changed", {currentmap: {"name":"some map"}, metrics: ["a","b","c", "RLOC", "!MCC"]});

        expect(settingsService.settings.areaMetric).to.equal("RLOC");
        expect(settingsService.settings.heightMetric).to.equal("b");
        expect(settingsService.settings.colorMetric).to.equal("c");

    }));

    /**
     * @test {SettingsService#constructor}
     */
    it("should select first three metrics when RLOC and MCC are not available", angular.mock.inject(function(settingsService, $rootScope){

        $rootScope.$broadcast("data-changed", {currentmap: {"name":"some map"}, metrics: ["a","b","c", "!RLOC", "!MCC"]});

        expect(settingsService.settings.areaMetric).to.equal("a");
        expect(settingsService.settings.heightMetric).to.equal("b");
        expect(settingsService.settings.colorMetric).to.equal("c");

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
    
});