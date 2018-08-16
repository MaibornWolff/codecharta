import {ITimeoutService} from "angular";
import {SettingsService} from "../../core/settings/settings.service";
import {EdgesController} from "./edgesComponent";
import {Edge} from "../../core/data/model/CodeMap";

describe("EdgesComponent", () => {

    let edgesController: EdgesController;
    let $timeout: ITimeoutService;
    let $scope;
    let settingsService: SettingsService;

    const edge: Edge = {
        fromNodeName: "/root/Anode",
        toNodeName: "/root/AnotherNode",
        attributes: {
            pairingRate: 42,
            avgCommits: 21
        },
        visible: true,
    };

    function rebuildSUT() {
        edgesController = new EdgesController($timeout, $scope, settingsService);
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
                                avgCommits: 21,
                            },
                            visible: true,
                        },
                        {
                            fromNodeName: "/root/parent/Anode",
                            toNodeName: "/root/parent/AnotherNode",
                            attributes: {
                                pairingRate: 42,
                                avgCommits: 21,
                            },
                            visible: true,
                        },
                    ],
                },
                minimumAvgCommits: 15,
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
        edgesController.onClickCouple(edge);
        expect(settingsService.settings.map.edges).toMatchSnapshot();
    });


    xit("should reset visibility for all dependencies to false", () => {
        edgesController.onResetEdges();
        expect(settingsService.settings.map.edges).toMatchSnapshot();
    });
});