import "./codeMap.ts";
import angular from "angular";
import {CodeMapService} from "./codeMapService.ts";

describe("app.codeCharta.codeMap.codeMapService", function () {

    let codeMapService: CodeMapService, $scope;

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.module("app.codeCharta.codeMap"));

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.inject((_codeMapService_, _$rootScope_)=> {
        codeMapService = _codeMapService_;
        $scope = _$rootScope_;
    }));

    describe("scaleMap", ()=>{

        it("should set mapGeometry scale", ()=>{
            //TODO
        });

        it("should set mapGeometry position", ()=>{
            //TODO
        });

        it("should set mapMesh scale if it is exists", ()=>{
            //TODO
        });

        it("should set labelManager scale if it is exists", ()=>{
            //TODO
        });

    });

});