import {IRootScopeService, ICompileService, IScope} from "angular";

import "./common.ts";
import {NG, NGMock} from "../../../ng.mockhelper.ts";

describe("common", ()=>{

    let $rootScope: IRootScopeService;
    let $compile: ICompileService;


    beforeEach(NGMock.mock.module("app.codeCharta.ui.common"));

    beforeEach(NGMock.mock.inject((_$rootScope_, _$compile_) => {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
    }));

    describe("fab", ()=>{

        it("snapshot test", () => {
            let scope: IScope = $rootScope.$new();
            let element = $compile(NG.element('<fab-component icon-class="some class"></fab-component>'))(scope);
            scope.$apply();
            expect(element).toMatchSnapshot();
        });

    });

});


