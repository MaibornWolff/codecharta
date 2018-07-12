import {CodeMapActionsService} from "./codeMap.actions.service";

import {SettingsService} from "../../core/settings/settings.service";
jest.mock("../../core/settings/settings.service");

import {ThreeOrbitControlsService} from "./threeViewer/threeOrbitControlsService";
import {CodeMapNode} from "../../core/data/model/CodeMap";
jest.mock("./threeViewer/threeOrbitControlsService");

describe("code map action service tests", ()=>{

    let codeMapActionService: CodeMapActionsService;
    let $timeout;
    let visibleNode: CodeMapNode;
    let hiddenNode: CodeMapNode;
    let simpleHiddenHierarchy: CodeMapNode;

    beforeEach(()=>{
       visibleNode = {name: "test", attributes: {}, visible: true};
       hiddenNode = {name: "test", attributes: {}, visible: false};
       simpleHiddenHierarchy = {
            name: "root",
            attributes: {},
            visible: false,
            children: [
                {
                    name: "a",
                    attributes: {},
                    visible: false,
                    children: [
                        {
                            name: "aa",
                            attributes: {},
                            visible: false
                        },
                        {
                            name: "ab",
                            attributes: {},
                            visible: false
                        }
                    ]
                },
                {
                    name: "b",
                    attributes: {},
                    visible: false
                }
            ]
        };
        $timeout = jest.fn();
        codeMapActionService = new CodeMapActionsService(
            new SettingsService(),
            new ThreeOrbitControlsService(),
            $timeout);
    });

    it("showing invisible node with invisible children should make them all visible", ()=>{
        codeMapActionService.toggleNodeVisibility(simpleHiddenHierarchy);
    });

    it("toggling visible node should call hide method", ()=>{
        let tmp = codeMapActionService.hideNode;
        codeMapActionService.hideNode = jest.fn();
        codeMapActionService.toggleNodeVisibility(visibleNode);
        expect(codeMapActionService.hideNode).toHaveBeenCalledWith(visibleNode)
        codeMapActionService.hideNode = tmp;
    });

    it("toggling hidden node should call show method", ()=>{
        let tmp = codeMapActionService.showNode;
        codeMapActionService.showNode = jest.fn();
        codeMapActionService.toggleNodeVisibility(hiddenNode);
        expect(codeMapActionService.showNode).toHaveBeenCalledWith(hiddenNode)
        codeMapActionService.showNode = tmp;
    });

});