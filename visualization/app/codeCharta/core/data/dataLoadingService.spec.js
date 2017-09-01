require("./data.js");

/**
 * @test {DataLoadingService}
 */
describe("app.codeCharta.core.data.dataLoadingService", function() {

    var dataLoadingService;
    var dataValidatorService;

    beforeEach(angular.mock.module("app.codeCharta.core.data"));
    beforeEach(angular.mock.inject(function (_dataLoadingService_, _dataValidatorService_) {
        dataLoadingService = _dataLoadingService_;
        dataValidatorService = _dataValidatorService_;
    }));

    it("should resolve valid file",()=>{
        dataValidatorService.validate = () => {
            return new Promise((resolve,reject)=>{resolve();});
        };
        return dataLoadingService.loadMapFromFileContent("valid");
    });

    it("should reject invalid file",(done)=>{
        dataValidatorService.validate = () => {
            return new Promise((resolve,reject)=>{reject();});
        };
        dataLoadingService.loadMapFromFileContent("invalid").then(
            ()=>{
                done("should reject");
            },
            ()=>{
                done();
            }
        );
    });

});

