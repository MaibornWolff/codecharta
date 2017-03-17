import {RevisionChooserDirective} from "./revisionChooserDirective.js";

/**
 * @test {RevisionChooserDirective}
 */
describe("app.codeCharta.ui.revisionChooser.revisionChooserDirective", function() {

    var directive;

    beforeEach(()=>{
        directive = new RevisionChooserDirective();
    });

    /**
     * @test {RevisionChooserDirective#toggle}
     */
    it("should toggle visibility", ()=>{
        directive.visible = false;
        directive.toggle();
        expect(directive.visible);
    });

});
