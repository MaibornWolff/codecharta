import { BlacklistItem, CcState } from "../../../codeCharta.model"
import { defaultState } from "../../../state/store/state.manager"
import { blacklistMatcherSelector } from "./blacklistMatcher.selector"

const stateWithBlacklist = (blacklist: BlacklistItem[]): CcState => ({
    ...defaultState,
    sharedView: {
        ...defaultState.sharedView,
        blacklist
    }
})

describe("blacklistMatcherSelector", () => {
    afterEach(() => {
        blacklistMatcherSelector.release()
    })

    it("should return the same matcher reference for two reads of a reference-equal blacklist", () => {
        // Arrange
        const blacklist: BlacklistItem[] = [{ type: "exclude", path: "*.spec.ts" }]
        const state = stateWithBlacklist(blacklist)

        // Act
        const first = blacklistMatcherSelector(state)
        const second = blacklistMatcherSelector(state)

        // Assert
        expect(second).toBe(first)
    })

    it("should answer isExcludedLeaf and isFlattened correctly for exact path, glob pattern, and non-match", () => {
        // Arrange
        const blacklist: BlacklistItem[] = [
            { type: "exclude", path: "/root/exact/file.ts" },
            { type: "flatten", path: "*.spec.ts" }
        ]
        const matcher = blacklistMatcherSelector(stateWithBlacklist(blacklist))

        // Act & Assert — exact path match
        expect(matcher.isExcludedLeaf("/root/exact/file.ts")).toBe(true)
        // glob pattern match
        expect(matcher.isFlattened("/root/some/path/foo.spec.ts")).toBe(true)
        // non-match
        expect(matcher.isExcludedLeaf("/root/other/file.ts")).toBe(false)
        expect(matcher.isFlattened("/root/other/file.ts")).toBe(false)
        // type isolation: a flatten rule should not mark the path excluded
        expect(matcher.isExcludedLeaf("/root/some/path/foo.spec.ts")).toBe(false)
    })
})
