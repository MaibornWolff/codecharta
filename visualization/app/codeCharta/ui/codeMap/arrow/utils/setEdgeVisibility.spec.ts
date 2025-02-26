import { Edge, EdgeVisibility } from "../../../../codeCharta.model"
import { setEdgeVisibility } from "./setEdgeVisibility"

describe("setEdgeVisibility", () => {
    const edgePreviewNodes = new Set(["aNode", "anotherNode"])

    it("should set edge's visibility to 'none' if edge has no attributes for given metric", () => {
        const edges: Edge[] = [{ attributes: {}, fromNodeName: "from", toNodeName: "to" }]
        setEdgeVisibility(edgePreviewNodes, edges, "loc", true, true)
        expect(edges[0].visible).toBe(EdgeVisibility.none)
    })

    it("should set edge's visibility to 'none' if edge has neither from nor to", () => {
        const edges: Edge[] = [{ attributes: { loc: 12 }, fromNodeName: "from", toNodeName: "to" }]
        setEdgeVisibility(edgePreviewNodes, edges, "loc", true, true)
        expect(edges[0].visible).toBe(EdgeVisibility.none)
    })

    it("should set edge's visibility to 'both' if edge has from and to for given metric", () => {
        const edges: Edge[] = [{ attributes: { loc: 12 }, fromNodeName: "aNode", toNodeName: "anotherNode" }]
        setEdgeVisibility(edgePreviewNodes, edges, "loc", true, true)
        expect(edges[0].visible).toBe(EdgeVisibility.both)
    })

    it("should set edge's visibility to 'from' if edge has only from for given metric", () => {
        const edges: Edge[] = [{ attributes: { loc: 12 }, fromNodeName: "aNode", toNodeName: "to" }]
        setEdgeVisibility(edgePreviewNodes, edges, "loc", true, true)
        expect(edges[0].visible).toBe(EdgeVisibility.from)
    })

    it("should set edge's visibility to 'to' if edge has only to for given metric", () => {
        const edges: Edge[] = [{ attributes: { loc: 12 }, fromNodeName: "from", toNodeName: "aNode" }]
        setEdgeVisibility(edgePreviewNodes, edges, "loc", true, true)
        expect(edges[0].visible).toBe(EdgeVisibility.to)
    })

    it("should set edge's visibility to 'none' if showIncomingEdges is false and showOutgoingEdges is false", () => {
        const edges: Edge[] = [{ attributes: { loc: 12 }, fromNodeName: "aNode", toNodeName: "anotherNode" }]
        setEdgeVisibility(edgePreviewNodes, edges, "loc", false, false)
        expect(edges[0].visible).toBe(EdgeVisibility.none)
    })

    it("should set edge's visibility to 'from' if showIncomingEdges is false and showOutgoingEdges is true", () => {
        const edges: Edge[] = [{ attributes: { loc: 12 }, fromNodeName: "aNode", toNodeName: "anotherNode" }]
        setEdgeVisibility(edgePreviewNodes, edges, "loc", false, true)
        expect(edges[0].visible).toBe(EdgeVisibility.from)
    })

    it("should set edge's visibility to 'to' if showIncomingEdges is true and showOutgoingEdges is false", () => {
        const edges: Edge[] = [{ attributes: { loc: 12 }, fromNodeName: "aNode", toNodeName: "anotherNode" }]
        setEdgeVisibility(edgePreviewNodes, edges, "loc", true, false)
        expect(edges[0].visible).toBe(EdgeVisibility.to)
    })
})
