import {FileChooserController} from "./fileChooserController";
import {DataLoadingService} from "../../core/data/data.loading.service";
import {ScenarioService} from "../../core/scenario/scenario.service";
import {DialogService} from "../dialog/dialog.service";
import {DataService} from "../../core/data/data.service";
import {SettingsService} from "../../core/settings/settings.service";
import {ThreeOrbitControlsService} from "../codeMap/threeViewer/threeOrbitControlsService";

jest.mock("../../core/data/data.loading.service");
jest.mock("../../core/settings/settings.service");
jest.mock("../dialog/dialog.service");
jest.mock("../../core/data/data.service");
jest.mock("../codeMap/threeViewer/threeOrbitControlsService");

describe("file chooser controller", ()=>{

    let fcc: FileChooserController;
    let $scope;
    let $rootScope;
    let dataLoadingService;
    let scenarioService;
    let dialogService;
    let dataService;
    let settingsService;
    let threeOrbitControlsService;
    let blob;

    beforeEach(()=>{
        $scope = $rootScope = {
            $broadcast: jest.fn(),
            $apply: (fn) => {fn();},
            $$phase: false,
            $digest: jest.fn(),
            $root: {
                $$phase: false
            },
        };
        threeOrbitControlsService = new ThreeOrbitControlsService();
        dataLoadingService = new DataLoadingService();
        settingsService = new SettingsService();
        dataService = new DataService();
        scenarioService = new ScenarioService(settingsService, dataService, threeOrbitControlsService);
        scenarioService.getDefaultScenario = jest.fn();
        scenarioService.applyScenario = jest.fn();
        dialogService = new DialogService();

        blob = new Blob([JSON.stringify({hello: "world"}, null, 2)], {type : "application/json"});

        fcc = new FileChooserController(
            $scope,
            dataLoadingService,
            scenarioService,
            dataService,
            $rootScope,
            dialogService,
            settingsService
        );
    });

    describe("#fileChanged",()=>{

        //TODO FileRader mocks + tests

        it("should reset maps",()=>{
            fcc.fileChanged({files: []});
            expect(dataService.resetMaps).toBeCalled();
        });

        it("should broadcast a loading task",()=>{
            fcc.fileChanged({files: []});
            expect($rootScope.$broadcast).toBeCalledWith("add-loading-task");
        });

    });

    describe("#onNewFileLoaded",()=>{

        it("should call apply settings only once",async ()=>{
            const element = {value: [blob, blob]};
            dataLoadingService.loadMapFromFileContent = jest.fn(()=>Promise.resolve());
            await fcc.onNewFileLoaded('{ "name":"John", "age":30, "city":"New York"}', 0, "someFile.json", element);
            await fcc.onNewFileLoaded('{ "name":"John", "age":30, "city":"New York"}', 1, "someOtherFile.json", element);
            await fcc.onNewFileLoaded('{ "name":"John", "age":30, "city":"New York"}', 0, "someFile.json", element);
            expect(scenarioService.applyScenario).toHaveBeenCalledTimes(1);
        });

        it("should set set the elements value to ''",()=>{
            const element = {value: [blob, blob]};
            fcc.setNewData = jest.fn();
            fcc.onNewFileLoaded(null, null, null, element);
            expect(element.value).toBe("");
        });


        it("should set new data and remove loading task when everything works fine",()=>{
            const element = {value: [blob, blob]};
            fcc.setNewData = jest.fn();
            fcc.onNewFileLoaded('{ "name":"John", "age":30, "city":"New York"}', 0, "someFile.json", element);
            expect($rootScope.$broadcast).toBeCalledWith("remove-loading-task");
            expect(fcc.setNewData).toBeCalledWith("someFile.json", {"age": 30, "city": "New York", "name": "John"}, 0);
            expect(dialogService.showErrorDialog).not.toBeCalled();
        });

        it("should not set new data on parsing error",()=>{
            const element = {value: [blob, blob]};
            fcc.setNewData = jest.fn();
            fcc.onNewFileLoaded("", 0, "someFile.json", element);
            expect(fcc.setNewData).not.toBeCalled();
            expect(dialogService.showErrorDialog).toBeCalled();
            expect($rootScope.$broadcast).toBeCalledWith("remove-loading-task");
        });

    });

    describe("#setNewData",()=>{

        it("should trigger a digestion cycle if necessary when given valid data",async ()=>{
            dataLoadingService.loadMapFromFileContent = jest.fn(()=> Promise.resolve());
            await fcc.setNewData("aName", {}, 0);
            expect($scope.$digest).toHaveBeenCalled();
        });

        it("should print errors when given invalid data",async ()=>{
            dataLoadingService.loadMapFromFileContent = jest.fn(()=> Promise.reject());
            await fcc.setNewData("aName", {}, 0);
            expect(dialogService.showErrorDialog).toHaveBeenCalled();
        });

        it("should apply the scenario once, set comparison and reference map when given valid data",async ()=>{
            dataLoadingService.loadMapFromFileContent = jest.fn(()=> Promise.resolve());
            scenarioService.applyScenarioOnce = jest.fn();
            await fcc.setNewData("aName", {}, 0);
            expect(scenarioService.applyScenarioOnce).toHaveBeenCalled();
        });

    });

    it("should delegate errors to dialog service",()=>{
        fcc.printErrors("a result");
        expect(dialogService.showErrorDialog).toBeCalled();
    });

});