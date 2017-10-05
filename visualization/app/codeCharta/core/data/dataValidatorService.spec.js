require("./data.ts");

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

        //bind resource to httpBackend
        _$httpBackend_
            .when("GET", "schema.json")
            .respond(200, require("./schema.json"));

        $httpBackend = _$httpBackend_;

    }));

    beforeEach(()=>{

        file = {

            "projectName": "Sample Map",

            "nodes": [{
                "name": "root",
                "attributes": {},
                "children": [
                    {
                        "name": "big leaf",
                        "attributes": {"RLOC": 100, "Functions": 10, "MCC": 1},
                        "link": "http://www.google.de"
                    },
                    {
                        "name": "Parent Leaf",
                        "attributes": {},
                        "children": [
                            {
                                "name": "small leaf",
                                "attributes": {"RLOC": 30, "Functions": 100, "MCC": 100}
                            },
                            {
                                "name": "other small leaf",
                                "attributes": {"RLOC": 70, "Functions": 1000, "MCC": 10}
                            }
                        ]
                    }
                ]
            }]

        };

    });

    it("should resolve with sample file", (done)=>{
        dataValidatorService.validate(file).then(
            ()=>{done();},
            ()=>{done("should resolve");}
        );
        //$httpBackend.flush();
    });

    xit("should reject when no timestamp is given", (done)=>{
        file.timestamp = null;
        dataValidatorService.validate(file).then(
            ()=>{done("should reject")},
            ()=>{done();}
        );
        $httpBackend.flush();
    });

    it("should reject when children are not unique in name ", (done)=>{
        file.nodes[0].children[0].name = "same";
        file.nodes[0].children[1].name = "same";
        dataValidatorService.validate(file).then(
            ()=>{done("should reject")},
            ()=>{done();}
        );
        //$httpBackend.flush();
    });

    xit("should reject when children are not unique in id ", (done)=>{
        file.root.children[0].id = 0;
        file.root.children[1].id = 0;
        dataValidatorService.validate(file).then(
            ()=>{done("should reject")},
            ()=>{done();}
        );
        $httpBackend.flush();
    });

    it("should reject when children are empty", (done)=>{
        file.nodes[0].children = [];
        dataValidatorService.validate(file).then(
            ()=>{done("should reject")},
            ()=>{done();}
        );
        //$httpBackend.flush();
    });

    xit("root should be node and therefore have name and id", (done)=>{
        file.root = {
            name: "name",
            id: 0
        };
        dataValidatorService.validate(file).then(
            ()=>{done();},
            ()=>{done("should resolve");}
        );
        $httpBackend.flush();
    });

    xit("should reject if root is not a node and therefore has no name or id", (done)=>{
        file.root = {
            name: "name"
        };
        dataValidatorService.validate(file).then(
            ()=>{done("should reject");},
            ()=>{done();}
        );
        $httpBackend.flush();
    });

    xit("attributes should not allow whitespaces", (done)=>{
        file.nodes[0].attributes = {
            "tes t1": 0
        };
        dataValidatorService.validate(file).then(
            ()=>{done("should reject");},
            ()=>{done();}
        );
        $httpBackend.flush();
    });

    xit("attributes should not allow special characters", (done)=>{
        file.nodes[0].attributes = {
            "tes)t1": 0
        };
        dataValidatorService.validate(file).then(
            ()=>{done("should reject");},
            ()=>{done();}
        );
        $httpBackend.flush();
    });

    xit("id should not be a floating point number", (done)=>{
        file.root.children[1].id = 1.6;
        dataValidatorService.validate(file).then(
            ()=>{done("should reject");},
            ()=>{done();}
        );
        $httpBackend.flush();
    });

    xit("id should not be negative", (done)=>{
        file.root.children[1].id = -1;
        dataValidatorService.validate(file).then(
            ()=>{done("should reject");},
            ()=>{done();}
        );
        $httpBackend.flush();
    });


    xit("id should be unique in whole map", (done)=>{
        file.root.children[1].id = 1;
        file.root.children[1].children[0].id = 1;
        dataValidatorService.validate(file).then(
            ()=>{done("should reject");},
            ()=>{done();}
        );
        $httpBackend.flush();
    });

});

