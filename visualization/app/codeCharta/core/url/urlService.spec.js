require("./url.js");
import {CodeMap} from "../../core/data/model/codeMap";

/**
 * @test {UrlService}
 */
describe("app.codeCharta.core.url.urlService", function() {

    var urlService, $location, $httpBackend, validdata;

    beforeEach(angular.mock.module("app.codeCharta.core.url"));
    beforeEach(angular.mock.inject(function (_urlService_, _$location_, _$httpBackend_) {
        urlService = _urlService_;
        $location = _$location_;
        $httpBackend = _$httpBackend_;
        validdata = new CodeMap("file", "project", {
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
        });
    }));

    /**
     * @test {UrlService#getUrl}
     */
    it("url should be location's url", ()=>{
        $location.url("somePath.html");
        expect(urlService.getUrl()).to.equal($location.absUrl());
    });

    /**
     * @test {UrlService#getParameterByName}
     */
    it("query parameter(s) should be recognized from static url and location mock", () => {

        let invalidParam ="invalid";
        let param1 = "param1";
        let value1 = "value1";
        let param2 = "param2";
        let value2 = "value2";
        let url1 = "http://testurl?"+param1+"="+value1;
        let url2 = "http://testurl?"+param1+"="+value1+"&"+param2+"="+value2;

        $location.url(url1);

        expect(urlService.getParameterByName(param1)).to.equal(value1);
        expect(urlService.getParameterByName(invalidParam)).to.equal(null);

        expect(urlService.getParameterByName(param1, url1)).to.equal(value1);
        expect(urlService.getParameterByName(invalidParam, url1)).to.equal(null);

        $location.url(url2);

        expect(urlService.getParameterByName(param1)).to.equal(value1);
        expect(urlService.getParameterByName(param2)).to.equal(value2);
        expect(urlService.getParameterByName(invalidParam)).to.equal(null);

        expect(urlService.getParameterByName(param1, url2)).to.equal(value1);
        expect(urlService.getParameterByName(param2, url2)).to.equal(value2);
        expect(urlService.getParameterByName(invalidParam, url2)).to.equal(null);

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
                expect(data.fileName).to.equal("http://someurl.com/some.json");
                done();
            },() => {
                done("should succeed");
            }
        );

        $httpBackend.flush();

    });

    it("file parameter should correctly resolve to a file", (done) => {

        // mocks + values
        let url = "http://testurl?file=valid.json";

        $httpBackend
            .when("GET", "valid.json")
            .respond(200, validdata);

        $location.url(url);

        urlService.getFileDataFromQueryParam().then(
            (data) => {
                expect(data.fileName).to.equal("valid.json");
                done();
            },() => {
                done("should succeed");
            }
        );

        $httpBackend.flush();

    });

});

