import "./detailPanel";

import {SettingsService, SettingsServiceSubscriber, Settings} from "../../core/settings/settings.service";
import {DetailPanelController} from "./detailPanel.component";
import {DataService} from "../../core/data/data.service";
import {getService, instantiateModule} from "../../../../mocks/ng.mockhelper";
import {IRootScopeService, ITimeoutService, IAngularEvent} from "angular";
import { CodeMapBuildingTransition } from "../codeMap/codeMap.mouseEvent.service";


describe("detailPanelController", function() {

    let services, subscriber, detailPanelController: DetailPanelController;

    beforeEach(function() {
        restartSystem();
        rebuildController();
        withMockedEventMethods();
    });

    function restartSystem() {

        instantiateModule("app.codeCharta.ui.detailPanel");

        services = {
            $rootScope: getService<IRootScopeService>("$rootScope"),
            settingsService: getService<SettingsService>("settingsService"),
            dataService: getService<DataService>("dataService"),
            $timeout: getService<ITimeoutService>("$timeout")
        };

        const SettingsServiceSubscriberMock = jest.fn<SettingsServiceSubscriber>(()=>({
            onSettingsChanged: jest.fn()
        }));

        subscriber = new SettingsServiceSubscriberMock();

    }

    function rebuildController() {
        detailPanelController = new DetailPanelController(
            services.$rootScope,
            services.settingsService,
            services.dataService,
            services.$timeout
        );
    }

    function withMockedEventMethods() {
        services.$rootScope.$on = detailPanelController["$rootScope"].$on = jest.fn();
        services.$rootScope.$broadcast = detailPanelController["$rootScope"].$broadcast = jest.fn();
    }

    afterEach(()=>{
        jest.resetAllMocks();
    });

    describe("should react to method calls", ()=>{

        it("should call onHover when onBuildingHovered called",()=>{
            detailPanelController.onHover = jest.fn();
            detailPanelController.onBuildingHovered("data" as any as CodeMapBuildingTransition, "event" as any as IAngularEvent);

            expect(detailPanelController.onHover).toBeCalledWith("data")
        });

        it("should call onSelect when onBuildingSelected called",()=>{
            detailPanelController.onSelect = jest.fn();
            detailPanelController.onBuildingSelected("data" as any as CodeMapBuildingTransition, "event" as any as IAngularEvent);

            expect(detailPanelController.onSelect).toBeCalledWith("data")
        });
    });

    it("should set common attributes onSettingsChanged",() => {
        const settings = {
            areaMetric: "a",
            colorMetric: "b",
            heightMetric: "c"
        } as Settings;
        detailPanelController.onSettingsChanged(settings);
        expect(detailPanelController.details.common.areaAttributeName).toBe("a");
        expect(detailPanelController.details.common.colorAttributeName).toBe("b");
        expect(detailPanelController.details.common.heightAttributeName).toBe("c");
    });

    it("should setSelectedDetails when valid node is selected",() => {
        const data = {
            to: {
                node: "somenode"
            }
        };
        detailPanelController.setSelectedDetails = jest.fn();
        detailPanelController.onSelect(data);
        expect(detailPanelController.setSelectedDetails).toHaveBeenCalledWith("somenode");
    });

    it("should clearSelectedDetails when invalid node is selected",() => {
        const data = {
            to: {
                notanode: "somenode"
            }
        };
        detailPanelController.clearSelectedDetails = jest.fn();
        detailPanelController.onSelect(data);
        expect(detailPanelController.clearSelectedDetails).toHaveBeenCalled();
    });

    it("should clearSelectedDetails when invalid transition is given",() => {

        detailPanelController.clearSelectedDetails = jest.fn();

        const data = {
            notato: {
                node: "somenode"
            }
        };
        detailPanelController.onSelect(data);
        expect(detailPanelController.clearSelectedDetails).toHaveBeenCalled();
    });

    it("should clearSelectedDetails when no node is selected",() => {
        const data = {};
        detailPanelController.clearSelectedDetails = jest.fn();
        detailPanelController.onSelect(data);
        expect(detailPanelController.clearSelectedDetails).toHaveBeenCalled();
    });

    it("should setHoveredDetails when valid node is hovered",() => {
        const data = {
            to: {
                node: "somenode"
            }
        };
        detailPanelController.setHoveredDetails = jest.fn();
        detailPanelController.onHover(data);
        expect(detailPanelController.setHoveredDetails).toHaveBeenCalledWith("somenode");
    });

    it("should clearHoveredDetails when node is invalid",() => {
        const data = {
            to: {
                notanode: "somenode"
            }
        };
        detailPanelController.clearHoveredDetails = jest.fn();
        detailPanelController.onHover(data);
        expect(detailPanelController.clearHoveredDetails).toHaveBeenCalled();
    });

    it("should clearHoveredDetails when transition is invalid",() => {
        detailPanelController.clearHoveredDetails = jest.fn();

        const data = {
            notato: {
                node: "somenode"
            }
        };
        detailPanelController.onHover(data);
        expect(detailPanelController.clearHoveredDetails).toHaveBeenCalled();
    });

    it("should clearHoveredDetails when no node is hovered",() => {
        detailPanelController.clearHoveredDetails = jest.fn();
        const data = {};
        detailPanelController.onHover(data);
        expect(detailPanelController.clearHoveredDetails).toHaveBeenCalled();
    });

    describe("isHovered and isSelected should evaluate the respective nodes name to determine the result", ()=>{

        it("empty details should result in false",()=>{
            detailPanelController.details = {} as any;
            expect(detailPanelController.isHovered()).toBe(false);
            expect(detailPanelController.isSelected()).toBe(false);
        });

        it("empty nodes should result in false",()=>{
            detailPanelController.details = {
                hovered: null,
                selected: null
            } as any;
            expect(detailPanelController.isHovered()).toBe(false);
            expect(detailPanelController.isSelected()).toBe(false);
        });

        it("named nodes should result in true",()=>{
            detailPanelController.details = {
                hovered: {
                    name: "some name"
                } as any,
                selected: {
                    name: "some name"
                } as any
            } as any;
            expect(detailPanelController.isHovered()).toBe(true);
            expect(detailPanelController.isSelected()).toBe(true);
        });

    });

});