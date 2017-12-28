require("./scenarioButtonsComponent");

/**
 * @test
 */
xdescribe("app.codeCharta.ui.scenarioButtons.scenarioButtonsController", function() {

    var scenarioButtonsController,scenarioService, tooltipService, $rootScope,$scope,$controller ;

    beforeEach(angular.mock.module("app.codeCharta"));

    beforeEach(angular.mock.inject((_scenarioService_, _tooltipService_, _$rootScope_,_$controller_)=>{
        tooltipService = _tooltipService_;
        scenarioService = _scenarioService_;
        $rootScope = _$rootScope_;
        $scope = _$rootScope_;
        $controller = _$controller_;
    }));

    /**
     * @test{should notify tooltip when getScenarioTooltipTextByKey is called}
     */
    it("should notify tooltip when getScenarioTooltipTextByKey is called", ()=>{
        scenarioButtonsController = $controller("scenarioButtonsController", {scenarioService:scenarioService, tooltipService:tooltipService, $rootScope:$rootScope, $scope:$scope});
        tooltipService.getTooltipTextByKey = sinon.spy();
        scenarioButtonsController.getScenarioTooltipTextByKey();
        expect(tooltipService.getTooltipTextByKey.calledOnce );

    });
});