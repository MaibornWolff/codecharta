import {SettingsService} from "../../core/settings/settings.service";
import {DetailPanelController} from "./detailPanel.component";
import {DataService} from "../../core/data/data.service";


describe("detailPanelController", function() {

    let detailPanelController;
    let $timeout;
    let $scope;
    let settingsServiceMock: SettingsService;
    let dataServiceMock: DataService;

    function rebuildSUT() {
        detailPanelController = new DetailPanelController($scope, settingsServiceMock, dataServiceMock, $timeout);
    }

    function mockEverything() {

        $timeout = jest.fn();

        $scope = {
            $on: jest.fn(),
            $broadcast: jest.fn()
        };

        const SettingsServiceMock = jest.fn<SettingsService>(() => ({
            subscribe: jest.fn(),
            applySettings: jest.fn(),
            settings: jest.fn()
        }));

        settingsServiceMock = new SettingsServiceMock();

        const DataServiceMock = jest.fn<DataService>(() => ({
            subscribe: jest.fn()
        }));

        dataServiceMock = new DataServiceMock();

        rebuildSUT();

    }

    beforeEach(function() {
        mockEverything();
    });



    describe("should react to events on its scope", ()=>{

        it("building hovered",(done)=>{
            detailPanelController.onHover = (payload)=>{
                expect(payload).toBe("payload");
                done();
            };
            $scope.$broadcast("building-hovered", "payload");
        });

        it("building selected",(done)=>{
            detailPanelController.onSelect = (payload)=>{
                expect(payload).toBe("payload");
                done();
            };
            $scope.$broadcast("building-selected", "payload");
        });

        it("settings changed",(done)=>{
            detailPanelController.onSettingsChanged = (payload)=>{
                expect(payload).toBe("payload");
                done();
            };
            $scope.$broadcast("settings-changed", "payload");
        });

    });

    it("should set common attributes onSettingsChanged",() => {
        var settings = {
            areaMetric: "a",
            colorMetric: "b",
            heightMetric: "c"
        };
        detailPanelController.onSettingsChanged(settings);
        expect(detailPanelController.details.common.areaAttributeName).toBe("a");
        expect(detailPanelController.details.common.colorAttributeName).toBe("b");
        expect(detailPanelController.details.common.heightAttributeName).toBe("c");
    });

    it("should setSelectedDetails when valid node is selected",() => {
        var data = {
            to: {
                node: "somenode"
            }
        };
        detailPanelController.setSelectedDetails = sinon.spy();
        detailPanelController.onSelect(data);
        expect(detailPanelController.setSelectedDetails.calledWithExactly("somenode"));
    });

    it("should clearSelectedDetails when invalid or no node is selected",() => {

        var data = {
            to: {
                notanode: "somenode"
            }
        };
        detailPanelController.clearSelectedDetails = sinon.spy();
        detailPanelController.onSelect(data);
        expect(detailPanelController.clearSelectedDetails.calledWithExactly());

        data = {
            notato: {
                node: "somenode"
            }
        };
        detailPanelController.onSelect(data);
        expect(detailPanelController.clearSelectedDetails.calledWithExactly());

        data = {};
        detailPanelController.onSelect(data);
        expect(detailPanelController.clearSelectedDetails.calledWithExactly());

    });

    it("should setHoveredDetails when valid node is hovered",() => {
        var data = {
            to: {
                node: "somenode"
            }
        };
        detailPanelController.setHoveredDetails = sinon.spy();
        detailPanelController.onHover(data);
        expect(detailPanelController.setHoveredDetails.calledWithExactly("somenode"));
    });

    it("should clearHoveredDetails when invalid or no node is hovered",() => {
        var data = {
            to: {
                notanode: "somenode"
            }
        };
        detailPanelController.clearHoveredDetails = sinon.spy();
        detailPanelController.onHover(data);
        expect(detailPanelController.clearHoveredDetails.calledWithExactly());

        data = {
            notato: {
                node: "somenode"
            }
        };
        detailPanelController.onHover(data);
        expect(detailPanelController.clearHoveredDetails.calledWithExactly());

        data = {};
        detailPanelController.onHover(data);
        expect(detailPanelController.clearHoveredDetails.calledWithExactly());
    });

    describe("isHovered and isSelected should evaluate the respective nodes name to determine the result", ()=>{

        it("empty details should result in false",()=>{
            detailPanelController.details = {};
            expect(detailPanelController.isHovered()).toBe(false);
            expect(detailPanelController.isSelected()).toBe(false);
        });

        it("empty nodes should result in false",()=>{
            detailPanelController.details = {
                hovered: null,
                selected: null
            };
            expect(detailPanelController.isHovered()).toBe(false);
            expect(detailPanelController.isSelected()).toBe(false);
        });

        it("named nodes should result in true",()=>{
            detailPanelController.details = {
                hovered: {
                    name: "some name"
                },
                selected: {
                    name: "some name"
                }
            };
            expect(detailPanelController.isHovered()).toBe(true);
            expect(detailPanelController.isSelected()).toBe(true);
        });

    });

});