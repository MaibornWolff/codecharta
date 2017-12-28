require("./fileChooser.js");

/**
 * @test {FileChooserController}
 */
xdescribe("app.codeCharta.ui.fileChooser.fileChooserController", function() {

    var dataService, dataLoadingService, scenarioService, fileChooserController, $controller, $httpBackend, $rootScope, originalReader;

    beforeEach(angular.mock.module("app.codeCharta.ui.fileChooser"));

    beforeEach(angular.mock.inject((_$controller_, _dataService_, _$httpBackend_, _$rootScope_, _dataLoadingService_, _scenarioService_)=>{
        dataLoadingService = _dataLoadingService_;
        scenarioService = _scenarioService_;
        dataService = _dataService_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;

        //bind filereader
        global.FileReader = FileReader;

    }));

    /**
     * @test {FileChooserController#fileChanged}
     */
    xit("should read file on file changed and call onNewFileLoaded", ()=>{

        var element = {
            files:[
                "some file"
            ]
        };

        fileChooserController = $controller("fileChooserController", {$scope: $rootScope, dataLoadingService: dataLoadingService, scenarioService: scenarioService, dataService: dataService});

        fileChooserController.onNewFileLoaded = sinon.spy();


        fileChooserController.fileChanged(element);

        expect(fileChooserController.onNewFileLoaded.calledOnce);

    });

    it("should close modal, parse valid data and set it after onNewFileLoaded", ()=>{

    });

    it("should close modal and alert on invalid data after onNewFileLoaded", ()=>{

    });

    it("should digest after data is set", ()=>{

    });

    /**
     * @test {FileChooserController#setNewData}
     */
    xit("should print errors when setting filedata fails", ()=>{
        dataService.setFileData = {
            then:(resolve, reject)=>{reject({errors:[{message:"a", dataPath:"b"}]});}
        };
        fileChooserController = $controller("fileChooserController", {$scope: $rootScope, dataLoadingService: dataLoadingService, scenarioService: scenarioService, dataService: dataService});
        fileChooserController.printErrors = sinon.spy();
        fileChooserController.setNewData("some");
        expect(fileChooserController.printErrors.calledOnce);
    });

    /**
     * @test {FileChooserController#printErrors}
     */
    it("printing errors should call console.log", ()=>{
        var o = console.log;
        console.log = sinon.spy();

        fileChooserController = $controller("fileChooserController", {$scope: $rootScope, dataLoadingService: dataLoadingService, scenarioService: scenarioService, dataService: dataService});
        fileChooserController.printErrors({errors:[{message:"a", dataPath:"b"}]});

        expect(console.log.calledOnce);
        console.log = o;

    });

});