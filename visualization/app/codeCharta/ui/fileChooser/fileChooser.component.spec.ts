import "./fileChooser.module"
import "../../codeCharta"
import {SettingsService} from "../../state/settings.service";
import {getService, instantiateModule} from "../../../../mocks/ng.mockhelper";
import { IRootScopeService, IScope } from "angular"
import {CodeChartaService} from "../../codeCharta.service";
import {FileStateService} from "../../state/fileState.service";
import {DialogService} from "../dialog/dialog.service";
import { FileChooserController } from "./fileChooser.component"

describe("file chooser controller", ()=>{

    let services, fileChooserController: FileChooserController;

    beforeEach(() => {
        restartSystem();
        rebuildController();
    });

    function restartSystem() {

        instantiateModule("app.codeCharta.ui.fileChooser");

        // TODO: why is $scope same as $rootScope here? See VCS history for older file versions
        services = {
            $scope: getService<IScope>("$scope"),
            $rootScope: getService<IRootScopeService>("$rootScope"),
            dialogService: getService<DialogService>("dialogService"),
            settingsService: getService<SettingsService>("settingsService"),
            codeChartaService: getService<CodeChartaService>("codeChartaService"),
            fileStateService: getService<FileStateService>("fileStateService")
        };

    }

    function rebuildController() {
        fileChooserController = new FileChooserController(
            services.$scope,
            services.$rootScope,
            services.dialogService,
            services.settingsService,
            services.codeChartaService,
            services.fileStateService
        );
    }

    describe("onImportNewFiles",()=>{

        //TODO FileRader mocks + tests

        it("should reset maps",()=>{
            fileChooserController.onImportNewFiles({files: []});
            expect(services.dataService.resetMaps).toBeCalled();
        });

        it("should broadcast a loading task",()=>{
            fileChooserController.onImportNewFiles({files: []});
            expect(services.$rootScope.$broadcast).toBeCalledWith("add-loading-task");
        });

    });

    describe("onNewFileLoaded",()=>{

        it("should call apply settings only once", async ()=>{
            services.dataLoadingService.loadMapFromFileContent = jest.fn(()=>Promise.resolve());
            await fileChooserController.onNewFileLoaded("someFile.json", '{ "name":"John", "age":30, "city":"New York"}');
            await fileChooserController.onNewFileLoaded("someOtherFile.json", '{ "name":"John", "age":30, "city":"New York"}');
            await fileChooserController.onNewFileLoaded("someFile.json", '{ "name":"John", "age":30, "city":"New York"}');
            expect(services.scenarioService.applyScenario).toHaveBeenCalledTimes(1);
        });

        it("should set set the elements value to ''",()=>{
            fileChooserController.setNewData = jest.fn();
            fileChooserController.onNewFileLoaded(null, null);
        });


        it("should set new data and remove loading task when everything works fine",()=>{
            fileChooserController.setNewData = jest.fn();
            fileChooserController.onNewFileLoaded("someFile.json", '{ "name":"John", "age":30, "city":"New York"}');
            expect(services.$rootScope.$broadcast).toBeCalledWith("remove-loading-task");
            expect(fileChooserController.setNewData).toBeCalledWith({fileName: "someFile.json", content: {"age": 30, "city": "New York", "name": "John"}});
            expect(services.dialogService.showErrorDialog).not.toBeCalled();
        });

        it("should not set new data on parsing error",()=>{
            fileChooserController.setNewData = jest.fn();
            fileChooserController.onNewFileLoaded("", "someFile.json");
            expect(fileChooserController.setNewData).not.toBeCalled();
            expect(services.dialogService.showErrorDialog).toBeCalled();
            expect(services.$rootScope.$broadcast).toBeCalledWith("remove-loading-task");
        });
    });

    describe("setNewData",()=>{

        it("should trigger a digestion cycle if necessary when given valid data",async ()=>{
            services.codeChartaService.loadFiles = jest.fn(()=> Promise.resolve());
            await fileChooserController.setNewData({fileName: "aName", content: {}});
            expect(services.$scope.$digest).toHaveBeenCalled();
        });

        it("should print errors when given invalid data",async ()=>{
            services.codeChartaService.loadFiles = jest.fn(()=> Promise.reject());
            await fileChooserController.setNewData({fileName: "aName", content: {}});
            expect(services.dialogService.showErrorDialog).toHaveBeenCalled();
        });
    });
});