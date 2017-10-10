require("./detailPanel.js");
/**
 * @test {DetailPanelDirective}
 */
describe("app.codeCharta.ui.detailPanel", function() {

    var scope, compile, detailPanelController;

    beforeEach(()=>{

        angular.module("sceDelegateProviderConfig", []).config(function(_$sceDelegateProvider_) {
            let $sceDelegateProvider = _$sceDelegateProvider_;
            $sceDelegateProvider.resourceUrlWhitelist(["**"]);
        });

        angular.mock.module("sceDelegateProviderConfig");

        angular.mock.module("app.codeCharta.ui.detailPanel");

    });

    beforeEach(angular.mock.inject(($timeout, settingsService, $rootScope, $controller)=>{
        detailPanelController = $controller("detailPanelController", {$scope: $rootScope, $rootScope: $rootScope, settingsService:settingsService, $timeout: $timeout});
    }));

    beforeEach(angular.mock.inject(($compile, $rootScope)=>{
        scope = $rootScope;
        compile = $compile;
    }));

    /**
     * @test {DetailPanelDirective#setSelectedDetails}
     */
    xit("should not show links", function() {

        detailPanelController.setSelectedDetails(
            {
                name: "a",
                area: 123,
                height: 23,
                color: 23,
                heightDelta: 23,
                areaDelta:1,
                colorDelta: 2,
                link: "LINK"
            }
        );

        var element = compile('<detail-panel-directive></detail-panel-directive>')(scope);

        scope.$digest();

        expect(element.html()).to.not.contain("LINK");

    });

});

