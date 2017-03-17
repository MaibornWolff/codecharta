require("./checkbox.js");

/**
 * @test {CheckBoxDirective}
 */
describe("app.codeCharta.ui.common.checkbox", function() {

    var element;
    var scope;

    beforeEach(()=>{

        angular.module("sceDelegateProviderConfig", []).config(function(_$sceDelegateProvider_) {
            let $sceDelegateProvider = _$sceDelegateProvider_;
            $sceDelegateProvider.resourceUrlWhitelist(["**"]);
        });

        angular.mock.module("sceDelegateProviderConfig");
        angular.mock.module("app.codeCharta.ui.common.checkbox");


    });

    beforeEach(angular.mock.inject(($compile, $rootScope)=>{
        scope = $rootScope.$new();
        scope.model = true;
        scope.change = sinon.spy();
        element = $compile('<checkbox-directive label="some label" model="model" change="change()"></checkbox-directive>')(scope);
        scope.$apply();
    }));

    /**
     * @test {CheckBoxDirective#link}
     */
    xit("change model", function() {
        scope.model= false;
        scope.$apply();
        expect(scope.change.calledOnce);
    });

});

