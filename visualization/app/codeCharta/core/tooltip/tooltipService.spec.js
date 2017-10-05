require("./tooltip.ts");

/**
 * @test {TooltipService}
 */
describe("app.codeCharta.core.tooltip.tooltipService", function() {

    var tooltipService;

    beforeEach(angular.mock.module("app.codeCharta.core.tooltip"));

    beforeEach(angular.mock.inject((_tooltipService_)=>{
        tooltipService = _tooltipService_;

        tooltipService.tooltips = {
            a: "a description",
            b: "b description",
            c: "c description _a_",
            d: "d description _as_",
            e: "nested descriptions _c_",
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

    /**
     * @test{should return nested answer by keys in keys sorrounded by _}
     */
    it("should return nested answer by keys in keys sorrounded by _", () =>{
        var answer = tooltipService.getTooltipTextByKey("c");
        expect(answer).to.equal("c description a description");
    });

    /**
     * @test{should return nested \"no description\" by unknown keys in keys sorrounded by _}
     */
    it("should return nested \"no description\" by unknown keys in keys sorrounded by _", () =>{
        var answer = tooltipService.getTooltipTextByKey("d");
        expect(answer).to.equal("d description no description");
    });

    /**
     * @test{should return nested into nested descriptions}
     */
    it("should return nested into nested descriptions", () =>{
        var answer = tooltipService.getTooltipTextByKey("e");
        expect(answer).to.equal("nested descriptions c description a description");
    });


});