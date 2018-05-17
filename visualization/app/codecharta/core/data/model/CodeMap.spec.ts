import {CodeMapNode} from "./CodeMap";
describe("CodeMap value calculation", ()=> {

    it("attribute exists, no children", ()=> {
        let root = new CodeMapNode("root");
        root.attributes = {a:100};
        expect(root.calculateValue("a")).toBe(100);
    });

    it("attribute do not exists, no children", ()=> {
        let root = new CodeMapNode("root");
        root.attributes = {a:100};
        expect(root.calculateValue("b")).toBe(0);
    });

    it("attribute do not exists, multiple children with non existant attributes", ()=> {
        let root = new CodeMapNode("root");
        let firstChild = new CodeMapNode("firstChild");
        let secondChild = new CodeMapNode("secondChild");
        root.children = [firstChild, secondChild];
        expect(root.calculateValue("a")).toBe(0);
    });

    it("attribute do not exists, multiple children with existant attributes", ()=> {
        let root = new CodeMapNode("root");
        let firstChild = new CodeMapNode("firstChild");
        firstChild.attributes = {a:100};
        let secondChild = new CodeMapNode("secondChild");
        secondChild.attributes = {a:200};
        root.children = [firstChild, secondChild];
        expect(root.calculateValue("a")).toBe(300);
    });

    it("attribute do not exists, multiple children with some existant attributes", ()=> {
        let root = new CodeMapNode("root");
        let firstChild = new CodeMapNode("firstChild");
        firstChild.attributes = {a:100};
        let secondChild = new CodeMapNode("secondChild");
        root.children = [firstChild, secondChild];
        expect(root.calculateValue("a")).toBe(100);
    });

    it("attribute exists, multiple children with existant attributes", ()=> {
        let root = new CodeMapNode("root");
        root.attributes = {a:99};
        let firstChild = new CodeMapNode("firstChild");
        firstChild.attributes = {a:100};
        let secondChild = new CodeMapNode("secondChild");
        secondChild.attributes = {a:200};
        root.children = [firstChild, secondChild];
        expect(root.calculateValue("a")).toBe(300);
    });

});