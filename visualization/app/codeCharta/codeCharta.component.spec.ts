import {codeChartaComponent, CodeChartaController} from "./codeCharta.component";
import {DataService} from "../../core/data/data.service";
import {SettingsService} from "../../core/settings/settings.service";
import {IRootScopeService} from "angular";
import {DataLoadingService} from "./core/data/data.loading.service";
import {UrlService} from "./core/url/url.service";
import {ScenarioService} from "./core/scenario/scenario.service";
import $ from "jquery";

describe("CodeChartaController", () => {

    let dataServiceMock: DataService;
    let dataLoadingServiceMock: DataLoadingService;
    let settingsServiceMock: SettingsService;
    let urlServiceMock: UrlService;
    let scenarioServiceMock: ScenarioService;
    let rootScopeMock: IRootScopeService;
    let codeChartaController: CodeChartaController;

    function rebuildSUT() {
        codeChartaController = new CodeChartaController(
            dataLoadingServiceMock,
            urlServiceMock,
            settingsServiceMock,
            scenarioServiceMock,
            dataServiceMock,
            rootScopeMock
        );
    }

    function mockEverything() {

        const RootScopeMock = jest.fn<IRootScopeService>(() => ({
            $on: jest.fn()
        }));

        rootScopeMock = new RootScopeMock();

        const DataServiceMock = jest.fn<DataService>(() => ({
            setComparisonMap: jest.fn(),
            setReferenceMap: jest.fn(),
            subscribe: jest.fn(),
            getComparisonMap: jest.fn(),
            getReferenceMap: jest.fn(),
            $rootScope: rootScopeMock,
            data: {
                revisions: []
            },
            notify: jest.fn()
        }));

        dataServiceMock = new DataServiceMock();

        const ScenarioServiceMock = jest.fn<ScenarioService>(() => ({

        }));

        scenarioServiceMock = new ScenarioServiceMock();

        const UrlServiceMock = jest.fn<UrlService>(() => ({
            getFileDataFromQueryParam: jest.fn()
        }));

        urlServiceMock = new UrlServiceMock();

        const DataLoadingServiceMock = jest.fn<DataLoadingService>(() => ({

        }));

        dataLoadingServiceMock = new DataLoadingServiceMock();

        const SettingsServiceMock = jest.fn<SettingsService>(() => ({

        }));

        settingsServiceMock = new SettingsServiceMock();

        rebuildSUT();

    }

    beforeEach(()=>{
        mockEverything();
    });

    xit("should reload page on key 18 and key 116", ()=>{

        codeChartaController.init = jest.fn();

        window.location.reload = jest.fn();

        var event18c = $.Event( "keypress" );
        event18c.which = 18;
        event18c.ctrlKey = true;
        $(window).trigger(event18c);

        var event18m = $.Event( "keypress" );
        event18m.which = 18;
        event18m.metaKey = true;
        $(window).trigger(event18m);

        var event116 = $.Event( "keyup" );
        event116.which = 116;
        $(window).trigger(event116);

        $(window).trigger("other");

        expect(window.location.reload).toHaveBeenCalledTimes(3);

    });

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
