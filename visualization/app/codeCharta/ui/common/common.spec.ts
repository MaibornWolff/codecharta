import {IRootScopeService, ICompileService, IScope} from "angular";

import "./common";
import {NG, NGMock} from "../../../../mocks/ng.mockhelper";

describe("common", ()=>{

    let $rootScope: IRootScopeService;
    let $compile: ICompileService;


    beforeEach(NGMock.mock.module("app.codeCharta.ui.common"));

    beforeEach(NGMock.mock.inject((_$rootScope_, _$compile_) => {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
    }));

    describe("checkbox", ()=>{

        it("snapshot test", () => {
            let scope: IScope = $rootScope.$new();
            let element = $compile(NG.element('<checkbox-directive label="some label" model="model" change="change()"></checkbox-directive>'))(scope);
            scope.$apply();
            expect(element).toMatchSnapshot();
        });

    });

    describe("collapsible", ()=>{

        it("snapshot test", () => {
            let scope: IScope = $rootScope.$new();
            let element = $compile(NG.element('<collapsible-directive>SOMETHING</collapsible-directive>'))(scope);
            scope.$apply();
            expect(element).toMatchSnapshot();
        });

    });

    describe("dropdown", ()=>{

        it("snapshot test", () => {
            let scope: IScope = $rootScope.$new();
            let element = $compile(NG.element('<dropdown-directive label="label" value="value" model="value"></dropdown-directive>'))(scope);
            scope.$apply();
            expect(element).toMatchSnapshot();
        });

    });

    describe("numberField", ()=>{

        it("snapshot test", () => {
            let scope: IScope = $rootScope.$new();
            let element = $compile(NG.element('<number-field-directive label="label" value="10" model="value" min="2"></number-field-directive>'))(scope);
            scope.$apply();
            expect(element).toMatchSnapshot();
        });

    });

    describe("slider", ()=>{

        it("snapshot test", () => {
            let scope: IScope = $rootScope.$new();
            let element = $compile(NG.element('<slider-directive label="label" value="10" model="value" min="2" max="4" step="1" decimal="0"></slider-directive>'))(scope);
            scope.$apply();
            expect(element).toMatchSnapshot();
        });

    });

    describe("collapsibleElement", ()=>{

        //TODO materialize again ...
        xit("snapshot test", () => {
            let scope: IScope = $rootScope.$new();
            let element = $compile(NG.element('<collapsible-directive><collapsible-element-directive label="some" icon-class="class">SOMETHING</collapsible-element-directive></collapsible-directive>'))(scope);
            scope.$apply();
            expect(element).toMatchSnapshot();
        });

    });

});


