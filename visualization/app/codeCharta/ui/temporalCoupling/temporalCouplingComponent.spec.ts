import {ITimeoutService} from "angular";
import {SettingsService} from "../../core/settings/settings.service";
import {TemporalCouplingController} from "./temporalCouplingComponent";
import {Edge} from "../../core/data/model/CodeMap";

describe("TemporalCouplingComponent", () => {

    let temporalCouplingController: TemporalCouplingController;
    let $timeout: ITimeoutService;
    let $scope;
    let settingsService: SettingsService;

    const edge: Edge = {
        fromNodeName: "/root/Anode",
        toNodeName: "/root/AnotherNode",
        attributes: {
            pairingRate: 42,
            averageRevs: 21
        },
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
                    edges: [
                        {
                            fromNodeName: "/root/Anode",
                            toNodeName: "/root/AnotherNode",
                            attributes: {
                                pairingRate: 42,
                                averageRevs: 21,
                            },
                            visible: true,
                        },
                        {
                            fromNodeName: "/root/parent/Anode",
                            toNodeName: "/root/parent/AnotherNode",
                            attributes: {
                                pairingRate: 42,
                                averageRevs: 21,
                            },
                            visible: true,
                        },
                    ],
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


    xit("should toggle visibility for clicked edge", () => {
        settingsService.settings.map.edges[0] = edge;
        temporalCouplingController.onClickCouple(edge);
        expect(settingsService.settings.map.edges).toMatchSnapshot();
    });


    xit("should reset visibility for all dependencies to false", () => {
        temporalCouplingController.onResetEdges();
        expect(settingsService.settings.map.edges).toMatchSnapshot();
    });
});