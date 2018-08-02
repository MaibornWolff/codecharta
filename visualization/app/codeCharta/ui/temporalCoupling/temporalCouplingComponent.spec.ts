import {ScenarioButtonsController} from "./scenarioButtonsComponent";
import {ITimeoutService} from "angular";
import {SettingsService} from "../../core/settings/settings.service";
import {TemporalCouplingController} from "./temporalCouplingComponent";
import {CodeMapDependency} from "../../core/data/model/CodeMap";

describe("TemporalCouplingComponent", () => {

    let temporalCouplingController: TemporalCouplingController;
    let $timeout: ITimeoutService;
    let $scope;
    let settingsService: SettingsService;

    const couple: CodeMapDependency = {
        node: "/root/Anode",
        nodeFilename: "Anode",
        dependantNode: "/root/AnotherNode",
        dependantNodeFilename: "AnotherNode",
        pairingRate: 42,
        averageRevs: 21,
        visible: true,
    };

    function rebuildSUT() {
        temporalCouplingController = new TemporalCouplingController($timeout, $scope, settingsService);
    }

    function mockEverything() {

        const ITimeoutServiceMock = jest.fn<ITimeoutService>(() => ({}));

        $timeout = new ITimeoutServiceMock();

        const $scopeMpck = jest.fn(() => ({}));

        $scope = new $scopeMpck();

        const SettingsService = jest.fn<SettingsService>(() => ({
            settings: {
                map: {
                    dependencies: {
                        temporal_coupling: [
                            {
                                node: "/root/Anode",
                                nodeFilename: "Anode",
                                dependantNode: "/root/AnotherNode",
                                dependantNodeFilename: "AnotherNode",
                                pairingRate: 42,
                                averageRevs: 21,
                                visible: true,
                            },
                            {
                                node: "/root/parent/Anode",
                                nodeFilename: "Anode",
                                dependantNode: "/root/parent/AnotherNode",
                                dependantNodeFilename: "AnotherNode",
                                pairingRate: 42,
                                averageRevs: 21,
                                visible: true,
                            },
                        ]
                    },
                },
                minimumAverageRevs: 15,
            },
            subscribe: jest.fn(),
            applySettings: jest.fn(),
        }));

        settingsService = new SettingsService();

        rebuildSUT();
    }

    beforeEach(()=>{
        mockEverything();
    });


    it("should toggle visibility for clicked couple", () => {
        const couple = {
            node: "/root/Anode",
            nodeFilename: "Anode",
            dependantNode: "/root/AnotherNode",
            dependantNodeFilename: "AnotherNode",
            pairingRate: 42,
            averageRevs: 21,
            visible: true
        };
        settingsService.settings.map.dependencies.temporal_coupling[0] = couple;
        temporalCouplingController.onClickCouple(couple);
        expect(settingsService.settings.map.dependencies.temporal_coupling).toMatchSnapshot();
    });

    it("should reset visibility for all dependencies to false", () => {
        temporalCouplingController.onResetDependencies();
        expect(settingsService.settings.map.dependencies.temporal_coupling).toMatchSnapshot();
    });

    it("should be eligible Couple", () => {
        expect(temporalCouplingController.isEligibleCouple(couple)).toBe(true);
    });

    it("should be eligible Couple", () => {
        couple.node = "/root/package-lock.json";
        couple.nodeFilename = "package-lock.json";
        expect(temporalCouplingController.isEligibleCouple(couple)).toBe(false);
    });

    it("should use filter when updating temporalCOuplingController.temporalCoupling", () => {
        settingsService.settings.map.dependencies.temporal_coupling[0] = {
            node: "/root/parent/children/package.json",
            nodeFilename: "package.json",
            dependantNode: "/root/AnotherNode",
            dependantNodeFilename: "AnotherNode",
            pairingRate: 42,
            averageRevs: 10,
            visible: false
        };
        settingsService.settings.intelligentTemporalCouplingFilter = true;
        temporalCouplingController.updateTemporalCouplingDependencies(settingsService.settings.map);
        expect(temporalCouplingController.temporalCoupling.length).toEqual(1);
    });



});