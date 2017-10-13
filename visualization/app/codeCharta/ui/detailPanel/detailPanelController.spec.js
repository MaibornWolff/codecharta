require("./detailPanel.ts");
import {DetailPanelController} from "./detailPanelComponent.ts";

/**
 * @test {DetailPanelController}
 */
describe("app.codeCharta.ui.detailPanel.detailPanelController", function() {

    var detailPanelController, scope, timeout, settingsService;

    beforeEach(()=>{

        //mock module under test
        angular.mock.module("app.codeCharta.ui.detailPanel");

        //build a module dependent on the module under test and the specific controller under test
        angular.module("sut", ["app.codeCharta.ui.detailPanel"])
            .controller("detailPanelController", DetailPanelController);

        //mock it
        angular.mock.module("sut");

    });

    beforeEach(angular.mock.inject((_$timeout_, _settingsService_, _$rootScope_, $controller)=>{
        scope = _$rootScope_;
        settingsService = _settingsService_;
        timeout = _$timeout_;
        detailPanelController = $controller("detailPanelController", {$scope: scope, $rootScope: scope, settingsService:settingsService, $timeout: timeout});
    }));

    /**
     * @test {DetailPanelController}
     */
    describe("should react to events on its scope", ()=>{

        /**
         * @test {DetailPanelController#onHover}
         */
        it("building hovered",(done)=>{
            detailPanelController.onHover = (payload)=>{
                expect(payload).to.equal("payload");
                done();
            };
            scope.$broadcast("building-hovered", "payload");
        });

        /**
         * @test {DetailPanelController#onSelect}
         */
        it("building selected",(done)=>{
            detailPanelController.onSelect = (payload)=>{
                expect(payload).to.equal("payload");
                done();
            };
            scope.$broadcast("building-selected", "payload");
        });

        /**
         * @test {DetailPanelController#onSettingsChanged}
         */
        it("settings changed",(done)=>{
            detailPanelController.onSettingsChanged = (payload)=>{
                expect(payload).to.equal("payload");
                done();
            };
            scope.$broadcast("settings-changed", "payload");
        });

    });

    /**
     * @test {DetailPanelController#onSettingsChanged}
     */
    it("should set common attributes when settings change",() => {
        var settings = {
            "areaMetric":"a",
            "colorMetric":"b",
            "heightMetric":"c"
        };
        detailPanelController.onSettingsChanged(settings);
        expect(detailPanelController.details.common.areaAttributeName).to.equal("a");
        expect(detailPanelController.details.common.colorAttributeName).to.equal("b");
        expect(detailPanelController.details.common.heightAttributeName).to.equal("c");
    });

    /**
     * @test {DetailPanelController#onSelect}
     */
    it("should setSelectedDetails when valid node is selected",() => {
        var data = {
            "to": {
                "node": "somenode"
            }
        };
        detailPanelController.setSelectedDetails = sinon.spy();
        detailPanelController.onSelect(data);
        expect(detailPanelController.setSelectedDetails.calledWithExactly("somenode"));
    });

    /**
     * @test {DetailPanelController#onSelect}
     */
    it("should clearSelectedDetails when invalid or no node is selected",() => {

        var data = {
            "to": {
                "notanode": "somenode"
            }
        };
        detailPanelController.clearSelectedDetails = sinon.spy();
        detailPanelController.onSelect(data);
        expect(detailPanelController.clearSelectedDetails.calledWithExactly());

        data = {
            "notato": {
                "node": "somenode"
            }
        };
        detailPanelController.onSelect(data);
        expect(detailPanelController.clearSelectedDetails.calledWithExactly());

        data = {};
        detailPanelController.onSelect(data);
        expect(detailPanelController.clearSelectedDetails.calledWithExactly());

    });

    /**
     * @test {DetailPanelController#onHover}
     */
    it("should setHoveredDetails when valid node is hovered",() => {
        var data = {
            "to": {
                "node": "somenode"
            }
        };
        detailPanelController.setHoveredDetails = sinon.spy();
        detailPanelController.onHover(data);
        expect(detailPanelController.setHoveredDetails.calledWithExactly("somenode"));
    });

    /**
     * @test {DetailPanelController#onHover}
     */
    it("should clearHoveredDetails when invalid or no node is hovered",() => {
        var data = {
            "to": {
                "notanode": "somenode"
            }
        };
        detailPanelController.clearHoveredDetails = sinon.spy();
        detailPanelController.onHover(data);
        expect(detailPanelController.clearHoveredDetails.calledWithExactly());

        data = {
            "notato": {
                "node": "somenode"
            }
        };
        detailPanelController.onHover(data);
        expect(detailPanelController.clearHoveredDetails.calledWithExactly());

        data = {};
        detailPanelController.onHover(data);
        expect(detailPanelController.clearHoveredDetails.calledWithExactly());
    });

    /**
     * @test {DetailPanelController}
     */
    describe("isHovered and isSelected should evaluate the respective nodes name to determine the result", ()=>{

        /**
         * @test {DetailPanelController#isHovered}
         * @test {DetailPanelController#isSelected}
         */
        it("empty details should result in false",()=>{
            detailPanelController.details = {};
            expect(detailPanelController.isHovered()).to.be.false;
            expect(detailPanelController.isSelected()).to.be.false;
        });

        /**
         * @test {DetailPanelController#isHovered}
         * @test {DetailPanelController#isSelected}
         */
        it("empty nodes should result in false",()=>{
            detailPanelController.details = {
                hovered: null,
                selected: null
            };
            expect(detailPanelController.isHovered()).to.be.false;
            expect(detailPanelController.isSelected()).to.be.false;
        });

        /**
         * @test {DetailPanelController#isHovered}
         * @test {DetailPanelController#isSelected}
         */
        it("named nodes should result in true",()=>{
            detailPanelController.details = {
                hovered: {
                    name: "some name"
                },
                selected: {
                    name: "some name"
                }
            };
            expect(detailPanelController.isHovered()).to.be.true;
            expect(detailPanelController.isSelected()).to.be.true;
        });

    });

});