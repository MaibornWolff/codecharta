import {FileChooserController} from "./fileChooserController";
import {DataLoadingService} from "../../core/data/data.loading.service";
import {ScenarioService} from "../../core/scenario/scenario.service";
import {DialogService} from "../dialog/dialog.service";
import {DataService} from "../../core/data/data.service";

jest.mock("../../core/scenario/scenario.service");
jest.mock("../../core/data/data.loading.service");
jest.mock("../dialog/dialog.service");
jest.mock("../../core/data/data.service");

describe("file chooser controller", ()=>{

    let fcc: FileChooserController;
    let $scope;
    let $rootScope;
    let dataLoadingService;
    let scenarioService;
    let dialogService;
    let dataService;
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
        dataLoadingService = new DataLoadingService();
        scenarioService = new ScenarioService();
        dialogService = new DialogService();
        dataService = new DataService();

        blob = new Blob([JSON.stringify({hello: "world"}, null, 2)], {type : "application/json"});

        fcc = new FileChooserController(
            $scope,
            dataLoadingService,
            scenarioService,
            dataService,
            $rootScope,
            dialogService
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
            await fcc.setNewData("aName", {}, 0);
            expect(scenarioService.applyScenarioOnce).toHaveBeenCalled();
        });

    });

    it("should delegate errors to dialog service",()=>{
        fcc.printErrors("a result");
        expect(dialogService.showErrorDialog).toBeCalled();
    });

});