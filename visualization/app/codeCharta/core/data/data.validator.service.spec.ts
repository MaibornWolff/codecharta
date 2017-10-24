import "./data.module.ts";
import {NGMock} from "../../../ng.mockhelper.ts";
import DoneCallback = jest.DoneCallback;
import {DataValidatorService} from "./data.validator.service.ts";
import {TEST_FILE_DATA} from "./data.mocks.ts";
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
        file = TEST_FILE_DATA;
    });

    it("should reject when children are not unique in name ", (done: DoneCallback)=> {
        file.root.children[0].name = "same";
        file.root.children[1].name = "same";
        dataValidatorService.validate(file).then(
            ()=> {
                done.fail("should reject")
            },
            ()=> {
                done();
            }
        );
    });

    it("should reject when children are empty", (done: DoneCallback)=> {
        file.root.children = [];
        dataValidatorService.validate(file).then(
            ()=> {
                done.fail("should reject")
            },
            ()=> {
                done();
            }
        );
    });

    it("should reject if root is not a node and therefore has no name or id", (done: DoneCallback)=> {
        file.root = {
            name: "name"
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
        file.root.attributes = {
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
        file.root.attributes = {
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

