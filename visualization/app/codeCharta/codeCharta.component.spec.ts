import "./codeCharta";
import {CodeChartaController} from "./codeCharta.component";
import {IHttpBackendService, IRootScopeService} from "angular";
import {NGMock} from "../../mocks/ng.mockhelper";

describe("CodeChartaController", () => {

    let codeChartaController: CodeChartaController;
    let $httpBackend: IHttpBackendService;
    let $rootScope: IRootScopeService;

    beforeEach(NGMock.mock.module("app.codeCharta"));

    beforeEach(NGMock.mock.inject((_codeChartaController_, _$rootScope_, _$httpBackend_) => {
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        codeChartaController = _codeChartaController_;
    }));

    it("number of loading tasks should change according to add-loading-task and remove-loading-task events",()=>{});
    it("",()=>{});

    //////////////

    /**
     * @test {CodeChartaController#loadFileOrSample}
     */
    xit("should load file from existing url file param",()=>{

        urlService.getUrl = ()=>{ return "file=someFile"};

        $httpBackend
            .when("GET", "someFile")
            .respond(200, "someData");

        dataService.setFileData = sinon.spy();

        codeChartaController = $controller("codeChartaController", {dataService: dataService, urlService: urlService, settingsService:settingsService, scenarioService:scenarioService});

        expect(dataService.setFileData.calledOnce);

    });

    /**
     * @test {CodeChartaController#loadFileOrSample}
     */
    xit("should load sample data from file if no param specified",()=>{

        urlService.getUrl = ()=>{ return "noFileParam"};

        $httpBackend
            .when("GET", "schema.json")
            .respond(200, "someData");

        dataService.setFileData = sinon.spy();
        dataService.setReferenceMap = sinon.spy();
        dataService.setComparisonMap = sinon.spy();
        settingsService.applySettings = sinon.spy();
        codeChartaController = $controller("codeChartaController", {dataService: dataService, urlService: urlService, settingsService:settingsService, scenarioService:scenarioService});
        expect(dataService.setFileData.calledWithExactly("someData"));
        expect(dataService.setComparisonMap.called);
        expect(dataService.setReferenceMap.called);
        expect(settingsService.applySettings.called);

    });

    /**
     * @test {CodeChartaController#loadFileOrSample}
     */
    xit("should update settings from url params if file was loaded from url param",()=>{

        urlService.getUrl = ()=>{ return "file=someFile&someSetting=true"};

        $httpBackend
            .when("GET", "someFile")
            .respond(200, "someData");

        settingsService.onSettingsChanged = sinon.spy();
        dataService.setFileData = sinon.spy();
        dataService.setReferenceMap = sinon.spy();
        dataService.setComparisonMap = sinon.spy();
        settingsService.applySettings = sinon.spy();

        codeChartaController = $controller("codeChartaController", {dataService: dataService, urlService: urlService, settingsService:settingsService, scenarioService:scenarioService});

        expect(dataService.setFileData.calledWithExactly("someData"));
        expect(settingsService.onSettingsChanged.calledOnce);
        expect(dataService.setComparisonMap.called);
        expect(dataService.setReferenceMap.called);
        expect(settingsService.applySettings.called);

    });

    /**
     * @test {CodeChartaController#loadFileOrSample}
     * @test {CodeChartaController#printErrors}
     */
    xit("should alert if no file can be loaded initially",()=>{

        urlService.getUrl = ()=>{ return "file=someFile"};

        $httpBackend
            .when("GET", "someFile")
            .respond(404, null);

        $httpBackend
            .when("GET", "sample.json")
            .respond(404, null);

        var a = window.alert;
        window.alert = sinon.spy();

        codeChartaController = $controller("codeChartaController", {dataService: dataService, urlService: urlService, settingsService:settingsService, scenarioService:scenarioService});

        expect(window.alert.calledWithExactly("failed loading sample data"));

        window.alert = a;

    });

    /**
     * @test {CodeChartaController#loadFileOrSample}
     * @test {CodeChartaController#printErrors}
     */
    xit("should print errors when data is not loaded correctly",()=>{

        urlService.getUrl = ()=>{ return "file=someFile"};

        $httpBackend
            .when("GET", "someFile")
            .respond(404, null);

        $httpBackend
            .when("GET", "sample.json")
            .respond(404, null);

        var o = console.log;
        console.log = sinon.spy();

        codeChartaController = $controller("codeChartaController", {dataService: dataService, urlService: urlService, settingsService:settingsService, scenarioService:scenarioService});

        expect(console.log.calledOnce);

        console.log = o;
    });

});
