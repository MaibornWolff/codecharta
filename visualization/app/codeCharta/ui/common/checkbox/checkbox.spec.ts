import {NGMock, NG} from "../../../../ng.mockhelper.ts";
import {IRootScopeService, ICompileService, IScope} from "angular";

import "./checkbox.ts";

describe("checkbox", ()=>{

    let $rootScope: IRootScopeService;
    let $compile: ICompileService;


    beforeEach(NGMock.mock.module("app.codeCharta.ui.common.checkbox"));

    beforeEach(NGMock.mock.inject((_$rootScope_, _$compile_) => {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
    }));

    it("snapshot test", () => {
        let scope: IScope = $rootScope.$new();
        let element = $compile(NG.element('<checkbox-directive label="some label" model="model" change="change()"></checkbox-directive>'))(scope);
        scope.$apply();
        expect(element).toMatchSnapshot();
    });

});


