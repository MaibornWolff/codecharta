require("./settingsPanel.js");

/**
 * @test {SettingsPanelController}
 */
describe("app.codeCharta.ui.settingsPanel.settingsPanelController", function() {

    var settingsPanelController, settingsService, dataService, codeMapService, scope;

    beforeEach(angular.mock.module("app.codeCharta.ui.settingsPanel"));

    beforeEach(angular.mock.inject((_settingsService_, _dataService_, _codeMapService_, _$rootScope_, $controller)=>{
        settingsService = _settingsService_;
        dataService = _dataService_;
        codeMapService = _codeMapService_;
        scope = _$rootScope_;
        settingsPanelController = $controller("settingsPanelController", {$scope: scope, settingsService: settingsService, dataService: dataService, codeMapService: codeMapService});
    }));

    /**
     * @test {SettingsPanelController#constructor}
     */
    it("should sort array alphabetically on start", angular.mock.inject(($controller)=>{

        settingsService.settings.map = {name:"aMap"};

        dataService.data.metrics[0] = "z";
        dataService.data.metrics[1] = "g";
        dataService.data.metrics[2] = "a";

        settingsPanelController = $controller("settingsPanelController", {$scope: scope, settingsService: settingsService, dataService: dataService, codeMapService: codeMapService});

        expect(settingsPanelController.metrics[0]).to.equal("a");
        expect(settingsPanelController.metrics[1]).to.equal("g");
        expect(settingsPanelController.metrics[2]).to.equal("z");

    }));

    /**
     * @test {SettingsPanelController#sortStringArrayAlphabetically}
     */
    it("should sort array alphabetically", ()=>{
        var arr = ["b", "g", "a", "z", "y"];
        var result = settingsPanelController.sortStringArrayAlphabetically(arr);
        expect(result).to.eql(["a", "b", "g", "y", "z"]);
    });

    /**
     * @test {SettingsPanelController#constructor}
     */
    it("should have correct values in scope", ()=>{

        settingsService.settings.map = {name:"specialMap"};
        dataService.data.metrics[0] = "specialMetric";

        expect(settingsPanelController.settings.map.name).to.equal("specialMap");
        expect(settingsPanelController.metrics[0]).to.equal("specialMetric");
        expect(settingsPanelController.settingsService).to.equal(settingsService);
        expect(settingsPanelController.codeMapService).to.equal(codeMapService);
        expect(settingsPanelController.scaling.x).to.equal(1);
        expect(settingsPanelController.scaling.y).to.equal(1);
        expect(settingsPanelController.scaling.z).to.equal(1);

    });

    /**
     * @test {SettingsPanelController#constructor}
     */
    it("should refresh metrics from data-changed event", ()=>{

        settingsService.onDataChanged = () => {};

        scope.$broadcast("data-changed", {currentmap: {}, metrics: ["a","b","c"]});

        expect(settingsPanelController.metrics[0]).to.equal("a");
        expect(settingsPanelController.metrics[1]).to.equal("b");
        expect(settingsPanelController.metrics[2]).to.equal("c");

    });

    /**
     * @test {SettingsPanelController#notify}
     */
    it("should notify settingsService when notify() is called", ()=>{

        settingsService.onSettingsChanged = sinon.spy();
        settingsPanelController.notify();
        expect(settingsService.onSettingsChanged.calledOnce);

    });

    /**
     * @test {SettingsPanelController#scalingChanged}
     */
    it("should call codeMapService#scaleTo when scalingChanged is called", ()=>{

        codeMapService.scaleTo = sinon.spy();
        settingsPanelController.scalingChanged();
        expect(codeMapService.scaleTo.calledOnce);

    });

});