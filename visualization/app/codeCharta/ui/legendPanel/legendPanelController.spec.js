require("./legendPanel.js");

describe("app.codeCharta.ui.legendPanel.legendPanelController", function() {

    var legendPanelController, dataService, scope, codeMapMaterialFactory, timeout, settingsService;

    beforeEach(angular.mock.module("app.codeCharta.ui.legendPanel"));

    beforeEach(()=>{

        angular.mock.module("app.codeCharta.codeMap");

        angular.module("app.codeCharta.codeMap").factory("codeMapMaterialFactory", () => {
            return {
                positive: () => {return new THREE.MeshLambertMaterial({color: 0x000000});},
                neutral: () => {return new THREE.MeshLambertMaterial({color: 0x111111});},
                negative: () => {return new THREE.MeshLambertMaterial({color: 0x222222});},
                odd: () => {return new THREE.MeshLambertMaterial({color: 0x333333});},
                even: () => {return new THREE.MeshLambertMaterial({color: 0x444444});},
                selected: () => {return new THREE.MeshLambertMaterial({color: 0x555555});},
                default: () => {return new THREE.MeshLambertMaterial({color: 0x777777});},
                positiveDelta: () => {return new THREE.MeshLambertMaterial({color: 0x888888});},
                negativeDelta: () => {return new THREE.MeshLambertMaterial({color: 0x999999});}
            }
        });

    });

    beforeEach(angular.mock.inject((_codeMapMaterialFactory_,_$timeout_, _settingsService_, _dataService_, _$rootScope_, $controller)=>{
        dataService = _dataService_;
        scope = _$rootScope_;
        codeMapMaterialFactory = _codeMapMaterialFactory_;
        settingsService = _settingsService_;
        timeout = _$timeout_;
        legendPanelController = $controller("legendPanelController", {$scope: scope, dataService: dataService, codeMapMaterialFactory: codeMapMaterialFactory, settingsService:settingsService, $timeout: timeout});
    }));

    it("should have correct values in scope", ()=>{
        expect(legendPanelController.mats).to.equal(codeMapMaterialFactory);
    });

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