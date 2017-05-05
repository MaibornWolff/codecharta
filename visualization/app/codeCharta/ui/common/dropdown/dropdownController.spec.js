require("./dropdown.js");
/**
 * @test {DropdownController}
 */
describe("app.codeCharta.ui.common.dropdown.dropdownController", function() {

    var dropdownController, tooltipService, scope, sandbox;

    beforeEach(angular.mock.module("app.codeCharta.ui.common.dropdown"));

    beforeEach(angular.mock.inject((_$rootScope_, $controller, _tooltipService_)=>{
        scope = _$rootScope_;
        tooltipService = _tooltipService_;
        dropdownController = $controller("dropdownController", {tooltipService: tooltipService});
    }));

    beforeEach(()=>{
        sandbox = sinon.sandbox.create();
    });

    afterEach(()=>{
        sandbox.restore();
    });


    /**
     * @test {DropdownController#getTooltipTextByKey}
     */
    it("expect tooltipService#getTooltipTextByKey called with the given key",()=>{
        tooltipService.getTooltipTextByKey = sinon.spy();
        dropdownController.getTooltipTextByKey("Some Key");
        sinon.assert.calledWith(tooltipService.getTooltipTextByKey, sinon.match("Some Key"));
    });


});