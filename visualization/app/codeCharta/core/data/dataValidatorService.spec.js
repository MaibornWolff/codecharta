require("./data.js");

/**
 * @test {DataValidatorService}
 */
describe("app.codeCharta.core.data.dataValidatorService", function() {

    var dataValidatorService;
    var file;
    var $httpBackend;

    beforeEach(angular.mock.module("app.codeCharta.core.data"));
    beforeEach(angular.mock.inject(function (_dataValidatorService_, _$httpBackend_) {
        dataValidatorService = _dataValidatorService_;

        //bind ressource to httpBackend
        _$httpBackend_
            .when("GET", "schema.json")
            .respond(200, require("./schema.json"));

        $httpBackend = _$httpBackend_;

    }));

    beforeEach(()=>{

        file = {

            "name": "Sample Map",

            "timestamp": "0",

            "root": {
                "name": "root",
                "id":20,
                "attributes": {},
                "children": [
                    {
                        "name": "big leaf",
                        "id":0,
                        "attributes": {"RLOC": 100, "Functions": 10, "MCC": 1},
                        "link": "http://www.google.de"
                    },
                    {
                        "name": "Parent Leaf",
                        "id":1,
                        "attributes": {},
                        "children": [
                            {
                                "name": "small leaf",
                                "id":2,
                                "attributes": {"RLOC": 30, "Functions": 100, "MCC": 100}
                            },
                            {
                                "name": "other small leaf",
                                "id":3,
                                "attributes": {"RLOC": 70, "Functions": 1000, "MCC": 10}
                            }
                        ]
                    }
                ]
            }

        };

    });

    it("should resolve with sample file", (done)=>{
        dataValidatorService.validate(file).then(
            ()=>{done();},
            ()=>{done("should resolve");}
        );
        $httpBackend.flush();
    });

    it("should reject when no timestamp is given", (done)=>{
        file.timestamp = null;
        dataValidatorService.validate(file).then(
            ()=>{done("should reject")},
            ()=>{done();}
        );
        $httpBackend.flush();
    });

    it("should reject when children are not unique in name ", (done)=>{
        file.root.children[0].name = "same";
        file.root.children[1].name = "same";
        dataValidatorService.validate(file).then(
            ()=>{done("should reject")},
            ()=>{done();}
        );
        $httpBackend.flush();
    });

    //TODO more tests

});

