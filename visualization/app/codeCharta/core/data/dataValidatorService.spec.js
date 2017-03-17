require("./data.js");

/**
 * @test {DataValidatorService}
 */
describe("app.codeCharta.core.data.dataValidatorService", function() {

    var dataValidatorService;

    beforeEach(angular.mock.module("app.codeCharta.core.data"));
    beforeEach(angular.mock.inject(function (_dataValidatorService_, $httpBackend) {
        dataValidatorService = _dataValidatorService_;

        //bind ressource to httpBackend
        $httpBackend
            .when("GET", "schema.json")
            .respond(200, require("./schema.json"));
    }));

    /**
     * @test {DataValidatorService#validate}
     * @test {DataValidatorService#uniqueName}
     * @test {DataValidatorService#uniqueArray}
     */
    describe("map with revisions", ()=>{

        /**
         * @test {DataValidatorService#validate}
         * @test {DataValidatorService#uniqueName}
         * @test {DataValidatorService#uniqueArray}
         */
        xit("must have 'revisions' array as a property with at least one element of type 'node'", function (done) {

            this.timeout(10000);

            let correct = {
                "revisions": [
                    {
                        "name":"some name"
                    }
                ]
            };

            dataValidatorService.validate(correct).then(

                (result) => {
                    expect(dataValidatorService.validate(result).valid);
                    done();
                }, () => {
                    done("failed");
                }

            ).catch((e)=>{
                done(err);
            });

        });

    });

    /**
     * @test {DataValidatorService#validate}
     * @test {DataValidatorService#uniqueName}
     * @test {DataValidatorService#uniqueArray}
     */
    describe("map without revisions", ()=>{

        /**
         * @test {DataValidatorService#validate}
         * @test {DataValidatorService#uniqueName}
         * @test {DataValidatorService#uniqueArray}
         */
        it("has an array of 'nodes'", () => {

            //has nodes array
            let correct = {
                "nodes": [
                    {
                        "name":"some name"
                    }
                ]
            };

            expect(dataValidatorService.validate(correct).valid);

            //has no nodes array
            let wrong = {
                "notNodes": {}
            };

            expect(!dataValidatorService.validate(wrong).valid);

        });

    });

    /**
     * @test {DataValidatorService#validate}
     * @test {DataValidatorService#uniqueName}
     * @test {DataValidatorService#uniqueArray}
     */
    describe("node definition", ()=>{

        /**
         * @test {DataValidatorService#validate}
         * @test {DataValidatorService#uniqueName}
         * @test {DataValidatorService#uniqueArray}
         */
        it("has name property", () => {

            //has name
            let correct = {
                "nodes": [
                    {
                        "name":"aName"
                    }
                ]
            };

            expect(dataValidatorService.validate(correct).valid);

            //has no name
            let wrong = {
                "nodes": [
                    {
                        "definetly not a name":"I am a name"
                    }
                ]
            };

            expect(!dataValidatorService.validate(wrong).valid);

        });

        /**
         * @test {DataValidatorService#validate}
         * @test {DataValidatorService#uniqueName}
         * @test {DataValidatorService#uniqueArray}
         */
        it("optional 'children' array property made of nodes", () => {

            //has valid children
            let correct = {
                "nodes": [
                    {
                        "name":"I am a parent",
                        "children": [
                            {
                                "name":"I am a child"
                            }
                        ]
                    }
                ]
            };

            expect(dataValidatorService.validate(correct).valid);

            //has no valid children
            let wrong = {
                "nodes": [
                    {
                        "name":"I am a parent",
                        "children": [
                            {
                                "notMyName":"Wont tell"
                            }
                        ]
                    }
                ]
            };

            expect(!dataValidatorService.validate(wrong).valid);

        });

        /**
         * @test {DataValidatorService#validate}
         * @test {DataValidatorService#uniqueName}
         * @test {DataValidatorService#uniqueArray}
         */
        it("optional 'attributes' property is an 'attributeList' object made of patternProperties '^.*$':string", () => {

            //has valid properties
            let correct = {
                "nodes": [
                    {
                        "name":"I am a parent",
                        "attributes": {
                            "IAmValid": 22,
                            "IAmAnInteger": 42
                        }
                    }
                ]
            };

            expect(dataValidatorService.validate(correct).valid);

            //has not valid properties
            let wrong1 = {
                "nodes": [
                    {
                        "name":"I am a parent",
                        "attributes": {
                            "IAmValid\nILied": 22
                        }
                    }
                ]
            };

            expect(!dataValidatorService.validate(wrong1).valid);

            //attributes have wrong dataType
            let wrong2 = {
                "nodes": [
                    {
                        "name":"I am a parent",
                        "attributes": {
                            "IAmAString": "",
                            "IAmAnObject": {},
                            "IAmNull": null
                        }
                    }
                ]
            };

            expect(!dataValidatorService.validate(wrong2).valid);


        });

    });

    /**
     * @test {DataValidatorService#validate}
     * @test {DataValidatorService#uniqueName}
     * @test {DataValidatorService#uniqueArray}
     */
    describe("avoid nodes with same parent and same name: ", ()=> {

        /**
         * @test {DataValidatorService#validate}
         * @test {DataValidatorService#uniqueName}
         * @test {DataValidatorService#uniqueArray}
         */
        it("nodes with same parent should not have the same name", ()=> {

            let correct = {
                "nodes" : [
                    {
                        "name":"root",
                        "attributes": {
                            "IamAString": "str",
                            "IAmAnObject": {},
                            "IAmAnInteger": 22
                        },
                        "children": [
                            {
                                "name":"node_0",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                }
                            },
                            {
                                "name":"node_1",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                }
                            }
                        ]
                    }
                ]
            };
            expect(dataValidatorService.validate(correct).valid);

            let wrong = {
                "nodes" : [
                    {
                        "name":"root",
                        "attributes": {
                            "IamAString": "str",
                            "IAmAnObject": {},
                            "IAmAnInteger": 22
                        },
                        "children": [
                            {
                                "name":"node_0",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                }
                            },
                            {
                                "name":"node_0",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                }
                            }
                        ]
                    }
                ]
            };
            expect(!dataValidatorService.validate(wrong).valid);

        });

        /**
         * @test {DataValidatorService#validate}
         * @test {DataValidatorService#uniqueName}
         * @test {DataValidatorService#uniqueArray}
         */
        it("nodes in different level should be allow to have the same name", ()=> {
            let different = {
                "nodes" : [
                    {
                        "name":"root",
                        "attributes": {
                            "IamAString": "str",
                            "IAmAnObject": {},
                            "IAmAnInteger": 22
                        },
                        "children": [
                            {
                                "name":"node_0",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                }
                            },
                            {
                                "name":"node_1",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                },
                                "children": [
                                    {
                                        "name":"node_1_0",
                                        "attributes":{
                                            "IamAString": "str",
                                            "IAmAnObject": {},
                                            "IAmAnInteger": 22
                                        }
                                    },
                                    {
                                        "name":"node_1_1",
                                        "attributes":{
                                            "IamAString": "str",
                                            "IAmAnObject": {},
                                            "IAmAnInteger": 22
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            expect(dataValidatorService.validate(different).valid);

            let same = {
                "nodes" : [
                    {
                        "name":"root",
                        "attributes": {
                            "IamAString": "str",
                            "IAmAnObject": {},
                            "IAmAnInteger": 22
                        },
                        "children": [
                            {
                                "name":"node_0",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                }
                            },
                            {
                                "name":"node_1",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                },
                                "children": [
                                    {
                                        "name":"node_1_0",
                                        "attributes":{
                                            "IamAString": "str",
                                            "IAmAnObject": {},
                                            "IAmAnInteger": 22
                                        }
                                    },
                                    {
                                        "name":"node_0",
                                        "attributes":{
                                            "IamAString": "str",
                                            "IAmAnObject": {},
                                            "IAmAnInteger": 22
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            expect(dataValidatorService.validate(same).valid);

        });

        /**
         * @test {DataValidatorService#validate}
         * @test {DataValidatorService#uniqueName}
         * @test {DataValidatorService#uniqueArray}
         */
        it("nodes in the same level with different parents should be allow to have the same name", ()=>{
            let different = {
                "nodes" : [
                    {
                        "name":"root",
                        "attributes": {
                            "IamAString": "str",
                            "IAmAnObject": {},
                            "IAmAnInteger": 22
                        },
                        "children": [
                            {
                                "name":"node_0",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                },
                                "children": [
                                    {
                                        "name":"node_0_0",
                                        "attributes": {
                                            "IamAString": "str",
                                            "IAmAnObject": {},
                                            "IAmAnInteger": 22
                                        }
                                    }
                                ]
                            },
                            {
                                "name":"node_1",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                },
                                "children": [
                                    {
                                        "name":"node_1_0",
                                        "attributes":{
                                            "IamAString": "str",
                                            "IAmAnObject": {},
                                            "IAmAnInteger": 22
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            expect(dataValidatorService.validate(different).valid);

            let same = {
                "nodes" : [
                    {
                        "name":"root",
                        "attributes": {
                            "IamAString": "str",
                            "IAmAnObject": {},
                            "IAmAnInteger": 22
                        },
                        "children": [
                            {
                                "name":"node_0",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                },
                                "children": [
                                    {
                                        "name":"node_0_0",
                                        "attributes": {
                                            "IamAString": "str",
                                            "IAmAnObject": {},
                                            "IAmAnInteger": 22
                                        }
                                    }
                                ]
                            },
                            {
                                "name":"node_1",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                },
                                "children": [
                                    {
                                        "name":"node_0_0",
                                        "attributes":{
                                            "IamAString": "str",
                                            "IAmAnObject": {},
                                            "IAmAnInteger": 22
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            expect(dataValidatorService.validate(same).valid);
        });

        /**
         * @test {DataValidatorService#validate}
         * @test {DataValidatorService#uniqueName}
         * @test {DataValidatorService#uniqueArray}
         */
        it("Parent and child should be allow to have the same name", ()=>{
            let different = {
                "nodes" : [
                    {
                        "name":"root",
                        "attributes": {
                            "IamAString": "str",
                            "IAmAnObject": {},
                            "IAmAnInteger": 22
                        },
                        "children": [
                            {
                                "name":"node_0",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                }
                            }
                        ]
                    }
                ]
            };
            expect(dataValidatorService.validate(different).valid);

            let same = {
                "nodes" : [
                    {
                        "name":"root",
                        "attributes": {
                            "IamAString": "str",
                            "IAmAnObject": {},
                            "IAmAnInteger": 22
                        },
                        "children": [
                            {
                                "name":"root",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                }
                            }
                        ]
                    }
                ]
            };
            expect(dataValidatorService.validate(same).valid);
        });

        /**
         * @test {DataValidatorService#validate}
         * @test {DataValidatorService#uniqueName}
         * @test {DataValidatorService#uniqueArray}
         */
        it("nodes, which have childrens, with the same parent should not have the same name", ()=>{
            let correct = {
                "nodes" : [
                    {
                        "name":"root",
                        "attributes": {
                            "IamAString": "str",
                            "IAmAnObject": {},
                            "IAmAnInteger": 22
                        },
                        "children": [
                            {
                                "name":"node_0",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                },
                                "children": [
                                    {
                                        "name":"node_0_1",
                                        "attributes": {
                                            "IamAString": "str",
                                            "IAmAnObject": {},
                                            "IAmAnInteger": 22
                                        }
                                    }
                                ]
                            },
                            {
                                "name":"node_1",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                },
                                "children": [
                                    {
                                        "name":"node_1_0",
                                        "attributes":{
                                            "IamAString": "str",
                                            "IAmAnObject": {},
                                            "IAmAnInteger": 22
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            expect(dataValidatorService.validate(correct).valid);

            let wrong = {
                "nodes" : [
                    {
                        "name":"root",
                        "attributes": {
                            "IamAString": "str",
                            "IAmAnObject": {},
                            "IAmAnInteger": 22
                        },
                        "children": [
                            {
                                "name":"node_0",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                },
                                "children": [
                                    {
                                        "name":"node_0_1",
                                        "attributes": {
                                            "IamAString": "str",
                                            "IAmAnObject": {},
                                            "IAmAnInteger": 22
                                        }
                                    }
                                ]
                            },
                            {
                                "name":"node_0",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                },
                                "children": [
                                    {
                                        "name":"node_1_0",
                                        "attributes":{
                                            "IamAString": "str",
                                            "IAmAnObject": {},
                                            "IAmAnInteger": 22
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            expect(!dataValidatorService.validate(wrong).valid);
        });

        /**
         * @test {DataValidatorService#validate}
         * @test {DataValidatorService#uniqueName}
         * @test {DataValidatorService#uniqueArray}
         */
        it("the first level in trees with revisions should be allow to have the same name", ()=>{
            let tree = {
                "nodes" : [
                    {
                        "name":"root",
                        "attributes": {
                            "IamAString": "str",
                            "IAmAnObject": {},
                            "IAmAnInteger": 22
                        },
                        "children": [
                            {
                                "name":"node_0",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                }
                            },
                            {
                                "name":"node_1",
                                "attributes":{
                                    "IamAString": "str",
                                    "IAmAnObject": {},
                                    "IAmAnInteger": 22
                                }
                            }
                        ]
                    }
                ]
            };

            let correct = {
                "revisions" : [tree, tree]
            };
            expect(dataValidatorService.validate(correct).valid);

            let wrong = {
                "not revisions": [tree, tree]
            };
            expect(!dataValidatorService.validate(wrong).valid);

        })
    });


});

