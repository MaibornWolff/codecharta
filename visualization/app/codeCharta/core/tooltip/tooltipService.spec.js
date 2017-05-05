require("./tooltip.js");
import {Tooltip} from "./model/tooltip.js";

/**
 * @test {TooltipService}
 */
describe("app.codeCharta.core.tooltip.tooltipService", function() {

    var tooltipService;

    beforeEach(angular.mock.module("app.codeCharta.core.tooltip"));

    beforeEach(angular.mock.inject((_tooltipService_)=>{
        tooltipService = _tooltipService_;

        tooltipService.tooltips = {
            a: new Tooltip("a", "a description"),
            b: new Tooltip("b", "b description")
        };

    }));

    /**
     * @test {TooltipService#getTooltipTextByKey}
     */
    it("Should return the correct description of the given metric", () => {

        var answer = tooltipService.getTooltipTextByKey("a");
        expect(answer).to.equal("a description");

    });

    /**
     * @test {TooltipService#getTooltipTextByKey}
     */
    it("Should return no description when the key is not a correct already known key", () => {

        var answer1 = tooltipService.getTooltipTextByKey("");
        var answer2 = tooltipService.getTooltipTextByKey(null);
        var answer3 = tooltipService.getTooltipTextByKey(undefined);
        var answer4 = tooltipService.getTooltipTextByKey(1);
        var answer5 = tooltipService.getTooltipTextByKey({});
        var answer6 = tooltipService.getTooltipTextByKey([]);
        var answer7 = tooltipService.getTooltipTextByKey();
        expect(answer1).to.equal("no description");
        expect(answer2).to.equal("no description");
        expect(answer3).to.equal("no description");
        expect(answer4).to.equal("no description");
        expect(answer5).to.equal("no description");
        expect(answer6).to.equal("no description");
        expect(answer7).to.equal("no description");

    });



});