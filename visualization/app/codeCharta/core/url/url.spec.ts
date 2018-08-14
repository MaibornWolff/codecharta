import {NGMock} from "../../../../mocks/ng.mockhelper";
import {IRootScopeService, ILocationService, IHttpBackendService} from "angular";
import DoneCallback = jest.DoneCallback;

import {NameDataPair, UrlService} from "./url.service";
import "./url.module";
import {VALID_TEST_DATA} from "./url.mocks";
import {CodeMap} from "../data/model/CodeMap";

describe("url.service", ()=>{

    let urlService: UrlService;
    let $rootScope: IRootScopeService;
    let $location: ILocationService;
    let $httpBackend: IHttpBackendService;

    let data: CodeMap;

    beforeEach(NGMock.mock.module("app.codeCharta.core.url"));

    beforeEach(NGMock.mock.inject((_urlService_, _$rootScope_, _$location_, _$httpBackend_) => {
        urlService = _urlService_;
        $rootScope = _$rootScope_;
        $location = _$location_;
        $httpBackend = _$httpBackend_;
    }));

    beforeEach(()=>{
        data = VALID_TEST_DATA;
    });

    it("file parameter should correctly resolve to a file", (done: DoneCallback) => {

        // mocks + values
        let url = "http://testurl?file=valid.json";

        $httpBackend
            .when("GET", "valid.json")
            .respond(200, data);

        $location.url(url);

        urlService.getFileDataFromQueryParam().then(
            (data: NameDataPair[]) => {
                expect(data.length).toBe(1);
                expect(data[0].name).toBe("valid.json");
                done();
            }
        );

        $httpBackend.flush();

    });


    it("file parameter should correctly resolve to multiple files", (done: DoneCallback) => {

        // mocks + values
        let url = "http://testurl?file=valid.json&file=other.json";

        $httpBackend
            .when("GET", "valid.json")
            .respond(200, data);

        let otherData = VALID_TEST_DATA;
        otherData.fileName = "other.json";

        $httpBackend
            .when("GET", "other.json")
            .respond(200, otherData);

        $location.url(url);

        urlService.getFileDataFromQueryParam().then(
            (data: NameDataPair[]) => {
                expect(data.length).toBe(2);
                expect(data[0].name).toBe("valid.json");
                expect(data[1].name).toBe("other.json");
                done();
            }
        );

        $httpBackend.flush();

    });

    it("getFileDataFromQueryParam should allow URL's", (done: DoneCallback) => {

        // mocks + values
        let url = "http://testurl.de/?file=http://someurl.com/some.json";

        $httpBackend
            .when("GET", "http://someurl.com/some.json")
            .respond(200, data);

        $location.url(url);

        urlService.getFileDataFromQueryParam().then(
            (data: NameDataPair[]) => {
                expect(data[0].name).toBe("http://someurl.com/some.json");
                done();
            },() => {
                done.fail("should succeed");
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


