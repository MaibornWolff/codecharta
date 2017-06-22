require("./data.js");

/**
 * @test {DataLoadingService}
 */
describe("app.codeCharta.core.data.dataLoadingService", function() {

    var firstFile;
    var secondFile;
    var dataLoadingService;

    beforeEach(angular.mock.module("app.codeCharta.core.data"));
    beforeEach(angular.mock.inject(function (_dataLoadingService_) {dataLoadingService = _dataLoadingService_;}));

    beforeEach(function(){

        firstFile = {
            name: "name",
            timestamp: "0",
            root:{
                name: "myRoot",
                id: "anId",
                attributes: {anAttribute: 12}
            }
        };

        secondFile = {
            name: "name",
            root:{
                name: "myRoot",
                id: "anId",
                attributes: {anAttribute: 12}
            }
        };

    });

    xit("should resolve firstFile",()=>{
        return dataLoadingService.loadMapFromFileContent(firstFile);
    });

    xit("should reject secondFile",(done)=>{
        dataLoadingService.loadMapFromFileContent(secondFile).then(
            ()=>{
                done("should reject");
            },
            ()=>{
                done();
            }
        );
    });

});

