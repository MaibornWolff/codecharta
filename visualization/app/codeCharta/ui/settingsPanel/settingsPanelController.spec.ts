import {SettingsPanelController} from "./settingsPanel.ts";
import angular from "angular";
import sinon from "sinon";

/**
 * @test {SettingsPanelController}
 */
describe("app.codeCharta.ui.settingsPanel.settingsPanelController", function() {

    let settingsPanelController, settingsService, dataService, scope;

    beforeEach(()=>{

        //mock module under test
        //noinspection TypeScriptUnresolvedVariable
        angular.mock.module("app.codeCharta.ui.settingsPanel");

        //build a module dependent on the module under test and the specific controller under test
        angular.module("sut", ["app.codeCharta.ui.settingsPanel"])
            .controller("settingsPanelController", SettingsPanelController);

        //mock it
        //noinspection TypeScriptUnresolvedVariable
        angular.mock.module("sut");

    });

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.inject((_settingsService_, _dataService_, _$rootScope_, $controller)=>{
        settingsService = _settingsService_;
        dataService = _dataService_;
        scope = _$rootScope_;
        settingsPanelController = $controller("settingsPanelController", {$scope: scope, settingsService: settingsService, dataService: dataService});
    }));

    //noinspection TypeScriptUnresolvedVariable
    /**
     * @test {SettingsPanelController#constructor}
     */
    xit("should sort array alphabetically on start", angular.mock.inject(($controller)=>{

        settingsService.settings.map = {name:"aMap"};

        dataService.data.metrics[0] = "z";
        dataService.data.metrics[1] = "g";
        dataService.data.metrics[2] = "a";

        settingsPanelController = $controller("settingsPanelController", {$scope: scope, settingsService: settingsService, dataService: dataService});

        expect(settingsPanelController.metrics[0]).toBe("a");
        expect(settingsPanelController.metrics[1]).toBe("g");
        expect(settingsPanelController.metrics[2]).toBe("z");

    }));

    /**
     * @test {SettingsPanelController#sortStringArrayAlphabetically}
     */
    xit("should sort array alphabetically", ()=>{
        const arr = ["b", "g", "a", "z", "y"];
        const result = settingsPanelController.sortStringArrayAlphabetically(arr);
        expect(result).toBe(["a", "b", "g", "y", "z"]);
    });

    /**
     * @test {SettingsPanelController#constructor}
     */
    xit("should have correct values in scope", ()=>{

        settingsService.settings.map = {name:"specialMap"};
        dataService.data.metrics[0] = "specialMetric";

        expect(settingsPanelController.settings.map.name).toBe("specialMap");
        expect(settingsPanelController.metrics[0]).toBe("specialMetric");
        expect(settingsPanelController.settingsService).toBe(settingsService);

    });

    /**
     * @test {SettingsPanelController#constructor}
     */
    xit("should refresh metrics from data-changed event", ()=>{

        settingsService.onDataChanged = () => {};

        scope.$broadcast("data-changed", {referenceMap: {}, metrics: ["a","b","c"]});

        expect(settingsPanelController.metrics[0]).toBe("a");
        expect(settingsPanelController.metrics[1]).toBe("b");
        expect(settingsPanelController.metrics[2]).toBe("c");

    });

    /**
     * @test {SettingsPanelController#notify}
     */
    xit("should notify settingsService when notify() is called", ()=>{

        settingsService.onSettingsChanged = sinon.spy();
        settingsPanelController.notify();
        expect(settingsService.onSettingsChanged.calledOnce);

    });

    /**
     * @test {SettingsPanelController#showUrlParams}
     */
    xit("should prompt the user when showUrlParams() is called", ()=>{

        const tmp = window.prompt;
        window.prompt  = sinon.spy();
        settingsPanelController.showUrlParams();
        //noinspection TypeScriptUnresolvedVariable
        expect(window.prompt.calledOnce);
        window.prompt = tmp;

    });

});