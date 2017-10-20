import angular from "angular";
import {IRootScopeService, ILocationService, IHttpBackendService} from "angular";
import "./url.ts";
import {UrlService} from "./urlService.ts";

describe("tooltip", ()=> {

    let urlService: UrlService;

    let $rootScope: IRootScopeService;
    let $location: ILocationService;
    let $httpBackend: IHttpBackendService;

    let validdata: Object;

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.module("app.codeCharta.core.url"));

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.inject((_urlService_, _$rootScope_, _$location_, _$httpBackend_)=> {
        urlService = _urlService_;
        $rootScope = _$rootScope_;
        $location = _$location_;
        $httpBackend = _$httpBackend_;
    }));

    beforeEach(()=>{
        validdata = {fileName: "file", projectName:"project", root:{
            "name": "root",
            "attributes": {},
            "children": [
                {
                    "name": "big leaf",
                    "attributes": {"rloc": 100, "functions": 10, "mcc": 1},
                    "link": "http://www.google.de"
                },
                {
                    "name": "Parent Leaf",
                    "attributes": {},
                    "children": [
                        {
                            "name": "small leaf",
                            "attributes": {"rloc": 30, "functions": 100, "mcc": 100},
                            "children": []
                        },
                        {
                            "name": "other small leaf",
                            "attributes": {"rloc": 70, "functions": 1000, "mcc": 10},
                            "children": []
                        }
                    ]
                }
            ]
        }};
    });

    it("file parameter should correctly resolve to a file", (done) => {

        // mocks + values
        let url = "http://testurl?file=valid.json";

        $httpBackend
            .when("GET", "valid.json")
            .respond(200, validdata);

        $location.url(url);

        urlService.getFileDataFromQueryParam().then(
            (data: any) => { //Todo type
                //noinspection TypeScriptUnresolvedVariable TODO correct type
                expect(data.fileName).toBe("valid.json");
                done();
            },() => {
                done("should succeed");
            }
        );

        $httpBackend.flush();

    });

    it("getFileDataFromQueryParam should allow URL's", (done) => {

        // mocks + values
        let url = "http://testurl.de/?file=http://someurl.com/some.json";

        $httpBackend
            .when("GET", "http://someurl.com/some.json")
            .respond(200, validdata);

        $location.url(url);

        urlService.getFileDataFromQueryParam().then(
            (data) => {
                //noinspection TypeScriptUnresolvedVariable TODO correct type
                expect(data.fileName).toBe("http://someurl.com/some.json");
                done();
            },() => {
                done("should succeed");
            }
        );

        $httpBackend.flush();

    });

    it("query parameter(s) should be recognized from static url and location mock", () => {

        let invalidParam ="invalid";
        let param1 = "param1";
        let value1 = "value1";
        let param2 = "param2";
        let value2 = "value2";
        let url1 = "http://testurl?"+param1+"="+value1;
        let url2 = "http://testurl?"+param1+"="+value1+"&"+param2+"="+value2;

        $location.url(url1);

        expect(urlService.getParameterByName(param1)).toBe(value1);
        expect(urlService.getParameterByName(invalidParam)).toBe(null);

        expect(urlService.getParameterByName(param1, url1)).toBe(value1);
        expect(urlService.getParameterByName(invalidParam, url1)).toBe(null);

        $location.url(url2);

        expect(urlService.getParameterByName(param1)).toBe(value1);
        expect(urlService.getParameterByName(param2)).toBe(value2);
        expect(urlService.getParameterByName(invalidParam)).toBe(null);

        expect(urlService.getParameterByName(param1, url2)).toBe(value1);
        expect(urlService.getParameterByName(param2, url2)).toBe(value2);
        expect(urlService.getParameterByName(invalidParam, url2)).toBe(null);

    });

    it("url should be location's url", ()=>{
        $location.url("somePath.html");
        expect(urlService.getUrl()).toBe($location.absUrl());
    });

});