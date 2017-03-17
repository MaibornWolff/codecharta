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
    
});