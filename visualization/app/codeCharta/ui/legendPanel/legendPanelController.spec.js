require("./legendPanel.ts");

import {LegendPanelController} from "./legendPanelComponent.ts";

describe("app.codeCharta.ui.legendPanel.legendPanelController", function() {

    var legendPanelController, dataService, scope, codeMapMaterialFactory, timeout, settingsService;

    beforeEach(()=>{

        //mock module under test
        angular.mock.module("app.codeCharta.ui.legendPanel");

        //build a module dependent on the module under test and the specific controller under test
        angular.module("sut", ["app.codeCharta.ui.legendPanel"])
            .controller("legendPanelController", LegendPanelController);

        //mock it
        angular.mock.module("sut");

    });


    beforeEach(angular.mock.inject((_$timeout_, _settingsService_, _dataService_, _$rootScope_, $controller)=>{
        dataService = _dataService_;
        scope = _$rootScope_;
        settingsService = _settingsService_;
        timeout = _$timeout_;
        legendPanelController = $controller("legendPanelController", {$scope: scope, dataService: dataService, settingsService:settingsService, $timeout: timeout, $element: "<div></div>"});
    }));

    it("generate pixel in base64",()=>{
        expect(legendPanelController.generatePixel("some color value")).to.equal("data:image/gif;base64,R0lGODlhAQABAPAAsome color value/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==");
    });

    it("html -> base64",()=>{
        expect(legendPanelController.getImageDataUri("000000")).to.equal("data:image/gif;base64,R0lGODlhAQABAPAAAAAAAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==");
    });

    it("encode hex to rgb",()=>{
        expect(legendPanelController.encodeHex("#000000")).to.equal("AAAAAP//");
        expect(legendPanelController.encodeHex("#ff0000")).to.equal("AP8AAP//");
        expect(legendPanelController.encodeHex("#0000ff")).to.equal("AAAA////");
    });

    it("encode rgb to base64 color value",()=>{
        expect(legendPanelController.encodeRGB(0,0,0)).to.equal("AAAAAP//");
        expect(legendPanelController.encodeRGB(255,255,255)).to.equal("AP//////");
        expect(legendPanelController.encodeRGB(123,3,111)).to.equal("AHsDb///");
    });

    it("encode triplet to base64 color value",()=>{
        expect(legendPanelController.encodeTriplet(0,0,0)).to.equal("AAAA");
        expect(legendPanelController.encodeTriplet(255,255,255)).to.equal("////");
        expect(legendPanelController.encodeTriplet(123,3,111)).to.equal("ewNv");
    });

});