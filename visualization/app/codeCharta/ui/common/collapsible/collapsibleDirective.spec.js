require("./collapsible.js");

/**
 * @test {CollapsibleDirective}
 */
describe("app.codeCharta.ui.common.collabsible", function() {

    var element;
    var scope;

    beforeEach(()=>{

        angular.module("sceDelegateProviderConfig", []).config(function(_$sceDelegateProvider_) {
            let $sceDelegateProvider = _$sceDelegateProvider_;
            $sceDelegateProvider.resourceUrlWhitelist(["**"]);
        });

        angular.mock.module("sceDelegateProviderConfig");
        angular.mock.module("app.codeCharta.ui.common.collapsible");


    });

    beforeEach(angular.mock.inject(($compile, $rootScope)=>{
        scope = $rootScope;
        element = $compile('<collapsible-directive>SOMETHING</collapsible-directive>')(scope);
        scope.$digest();
    }));

    /**
     * @test {CollapsibleDirective}
     */
    xit("should transclude", function() {
        expect(element.innerHTML()).to.contain("SOMETHING");
    });

});

