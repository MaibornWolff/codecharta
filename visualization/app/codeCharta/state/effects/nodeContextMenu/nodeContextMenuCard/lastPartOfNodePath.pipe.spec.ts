import { LastPartOfNodePathPipe } from "./lastPartOfNodePath.pipe"

describe("lastPartOfNodePathPipe", () => {
    it("should shorten children with '...'-prefix", () => {
        expect(new LastPartOfNodePathPipe().transform("/root/child.ts")).toBe(".../child.ts")
    })

    it("should not shorten a top level entry", () => {
        expect(new LastPartOfNodePathPipe().transform("/root")).toBe("/root")
    })
})
