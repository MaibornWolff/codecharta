import {revisionChooserComponent, RevisionChooserController} from "./revisionChooserComponent";
import {DataService} from "../../core/data/data.service";
import {SettingsService} from "../../core/settings/settings.service";

describe("RevisionChooserController", () => {

    let dataServiceMock: DataService;
    let settingsServiceMock: SettingsService;
    let revisionChooserController: RevisionChooserController;

    function rebuildSUT() {
        revisionChooserController = new RevisionChooserController(dataServiceMock, settingsServiceMock);
    }

    function mockEverything() {

        const DataServiceMock = jest.fn<DataService>(() => ({
            setComparisonMap: jest.fn(),
            setReferenceMap: jest.fn(),
            subscribe: jest.fn(),
            getLastComparisonMap: jest.fn(),
            getLastReferenceMap: jest.fn(),
            $rootScope: {
                $on: jest.fn()
            },
            data: {
                revisions: []
            },
            notify: ()=>{
                revisionChooserController.onDataChanged(dataServiceMock.data);
            }
        }));

        dataServiceMock = new DataServiceMock();

        const SettingsServiceMock = jest.fn<SettingsService>(() => ({

        }));

        settingsServiceMock = new SettingsServiceMock();

        rebuildSUT();

    }

    beforeEach(()=>{
        mockEverything();
    });

    it("should subscribe to dataService on construction", () => {
        expect(dataServiceMock.subscribe).toHaveBeenCalledWith(revisionChooserController);
    });

    it("should get revisions from data service on startup", () => {
        dataServiceMock.data.revisions = ["Some Revision"];
        rebuildSUT();
        expect(revisionChooserController.revisions).toBe(dataServiceMock.data.revisions);
    });

    it("toggle() should toggle visible property", () => {
        expect(!revisionChooserController.visible);
        revisionChooserController.toggle();
        expect(revisionChooserController.visible);
        revisionChooserController.toggle();
        expect(!revisionChooserController.visible);
    });

    it("onDataChanged should refresh revisions", () => {
        const revs = ["some", "revisions"];
        revisionChooserController.onDataChanged({revisions: revs});
        expect(revisionChooserController.revisions).toBe(revs);
    });

    it("onDataChanged should be called when dataService.notify is called", () => {
        revisionChooserController.onDataChanged = jest.fn();
        dataServiceMock.notify();
        expect(revisionChooserController.onDataChanged).toHaveBeenCalled();
    });

});