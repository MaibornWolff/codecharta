import "./data.module";
import {NGMock} from "../../../../mocks/ng.mockhelper";
import DoneCallback = jest.DoneCallback;
import {DataValidatorService} from "./data.validator.service";
import {TEST_FILE_CONTENT, TEST_FILE_DATA} from "./data.mocks";
import {CodeMap} from "./model/CodeMap";

/**
 * @test {DataValidatorService}
 */
describe("app.codeCharta.core.data.dataValidatorService", function () {

    let dataValidatorService: DataValidatorService;
    let file: CodeMap;

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NGMock.mock.module("app.codeCharta.core.data"));

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NGMock.mock.inject(function (_dataValidatorService_) {
        dataValidatorService = _dataValidatorService_;}));

    beforeEach(()=> {
        file = TEST_FILE_CONTENT;
    });

    it("should reject null", (done: DoneCallback)=> {
        dataValidatorService.validate(null).then(
            ()=> {
                done.fail("should not accept null");
            },
            ()=> {
                done();
            }
        );
    });

    it("should reject string", (done: DoneCallback)=> {
        dataValidatorService.validate("").then(
            ()=> {
                done.fail("should not accept string");
            },
            ()=> {
                done();
            }
        );
    });

    it("should not reject a file with edges", (done: DoneCallback)=> {
        file.edges = [
            {
                fromNodeName: "a",
                toNodeName: "b",
                attributes: {
                    avgCommits: 42,
                    pairingRate: 80,
                },
                visible: false
            }
        ];
        dataValidatorService.validate(file).then(
            ()=> {
                done();
            },
            ()=> {
                done.fail("should accept with edges");
            }
        );
    });

    it("should not reject a file without edges", (done: DoneCallback)=> {
        file.edges = undefined;
        dataValidatorService.validate(file).then(
            ()=> {
                done();
            },
            ()=> {
                done.fail("should accept without edges");
            }
        );
    });

    it("should not reject a file when numbers are floating point values", (done: DoneCallback)=> {
        file.nodes[0].children[0].attributes["RLOC"] = 333.4;
        dataValidatorService.validate(file).then(
            ()=> {
                done();
            },
            ()=> {
                done.fail("should accept floats");
            }
        );
    });

    it("should reject when children are not unique in name+type", (done: DoneCallback)=> {
        file.nodes[0].children[0].name = "same";
        file.nodes[0].children[0].type = "File";
        file.nodes[0].children[1].name = "same";
        file.nodes[0].children[1].type = "File";
        dataValidatorService.validate(file).then(
            ()=> {
                done.fail("should reject")
            },
            ()=> {
                done();
            }
        );
    });

    it("should reject when nodes are empty", (done: DoneCallback)=> {
        file.nodes = [];
        dataValidatorService.validate(file).then(
            ()=> {
                done.fail("should reject")
            },
            ()=> {
                done();
            }
        );
    });

    it("should reject if nodes is not a node and therefore has no name or id", (done: DoneCallback)=> {
        file.nodes[0] = {
            something: "something"
        };
        dataValidatorService.validate(file).then(
            ()=> {
                done.fail("should reject");
            },
            ()=> {
                done();
            }
        );
    });

    it("attributes should not allow whitespaces", (done: DoneCallback)=> {
        file.nodes[0].attributes = {
            "tes t1": 0
        };
        dataValidatorService.validate(file).then(
            ()=> {
                done.fail("should reject");
            },
            ()=> {
                done();
            }
        );
    });

    it("attributes should not allow special characters", (done: DoneCallback)=> {
        file.nodes[0].attributes = {
            "tes)t1": 0
        };
        dataValidatorService.validate(file).then(
            ()=> {
                done.fail("should reject");
            },
            ()=> {
                done();
            }
        );
    });

});

