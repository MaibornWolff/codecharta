require("./data.ts");

/**
 * @test {DataLoadingService}
 */
describe("app.codeCharta.core.data.dataLoadingService", function() {

    var firstFile;
    var secondFile;
    var dataLoadingService;
    var $httpBackend;

    beforeEach(angular.mock.module("app.codeCharta.core.data"));
    beforeEach(angular.mock.inject(function (_dataLoadingService_, _$httpBackend_) {
        dataLoadingService = _dataLoadingService_;
        $httpBackend = _$httpBackend_;
    }));

    beforeEach(function() {

        firstFile = {
            "projectName": "Sample Project",
            "nodes": [{
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
                                "attributes": {"rloc": 30, "functions": 100, "mcc": 100}
                            },
                            {
                                "name": "other small leaf",
                                "attributes": {"rloc": 70, "functions": 1000, "mcc": 10}
                            }
                        ]
                    }
                ]
            }
            ]

        };

        secondFile = {

            "nodes": [{
                "name": "root",
                "id": 20,
                "attributes": {},
                "children": [
                    {
                        "name": "big leaf",
                        "id": 0,
                        "attributes": {"rloc": 120, "functions": 10, "mcc": 1},
                        "link": "http://www.google.de"
                    },
                    {
                        "name": "Parent Leaf",
                        "id": 1,
                        "attributes": {},
                        "children": [
                            {
                                "name": "small leaf",
                                "id": 2,
                                "attributes": {"rloc": 30, "functions": 101, "mcc": 80}
                            },
                            {
                                "name": "other small leaf",
                                "id": 3,
                                "attributes": {"rloc": 70, "functions": 10, "mcc": 100}
                            }
                        ]
                    }
                ]
            }]

        };
    });

    xit("should resolve firstFile",(done)=>{
        dataLoadingService.loadMapFromFileContent("file1.json", firstFile, 0).then(
            ()=>{
                done();
            },
            ()=>{
                done("should succeed");
            }
        );
        $httpBackend.flush();
    });

    xit("should reject secondFile",(done)=>{
        dataLoadingService.loadMapFromFileContent("file2.json", secondFile, 1).then(
            ()=>{
                done("should reject");
            },
            ()=>{
                done();
            }
        );
        $httpBackend.flush();

    });

});

