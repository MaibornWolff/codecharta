require("./data.js");

/**
 * @test {DataLoadingService}
 */
describe("app.codeCharta.core.data.dataLoadingService", function() {

    var rootNode;
    var firstFile;
    var secondFile;
    var dataLoadingService;

    beforeEach(angular.mock.module("app.codeCharta.core.data"));
    beforeEach(angular.mock.inject(function (_dataLoadingService_) {dataLoadingService = _dataLoadingService_;}));

    beforeEach(function(){

        rootNode = {
            children: [],
            attributes: {}
        };

        firstFile = {
            children: [],
            attributes: {anAttribute: "value"}
        };

        secondFile = {
            children: [],
            attributes: {anAttribute: "secondValue"}

        };
    });

    it("")


});

