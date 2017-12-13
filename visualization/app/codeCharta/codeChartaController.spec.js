require("./codeCharta.js");

/**
 * @test {CodeChartaController}
 */
describe("app.codeCharta.codeChartaController", function() {

    var dataService, urlService, settingsService, codeChartaController, $controller, $httpBackend , scenarioService;

    beforeEach(angular.mock.module("app.codeCharta"));

    beforeEach(angular.mock.inject((_$controller_, _dataService_, _settingsService_, _urlService_, _$httpBackend_, _scenarioService_)=>{
        dataService = _dataService_;
        settingsService = _settingsService_;
        urlService = _urlService_;
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        scenarioService = _scenarioService_;
    }));

    /**
     * @test {CodeChartaController#initHandlers}
     */
    it("should reload page on key 18 and key 116", ()=>{

        window.location.reload = sinon.spy();

        codeChartaController = $controller("codeChartaController", {dataService: dataService, urlService: urlService, settingsService:settingsService, scenarioService:scenarioService});

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

        expect(!window.location.reload.calledThrice);

    });

    /**
     * @test {CodeChartaController#loadFileOrSample}
     */
    it("should load file from existing url file param",()=>{

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
    it("should load sample data from file if no param specified",()=>{

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
    it("should update settings from url params if file was loaded from url param",()=>{

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
    it("should alert if no file can be loaded initially",()=>{

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
    it("should print errors when data is not loaded correctly",()=>{

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