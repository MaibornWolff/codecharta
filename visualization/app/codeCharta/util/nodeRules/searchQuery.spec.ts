import { CodeMapNode, NodeType } from "../../model/codeCharta.model"
import { createExcludeMatcher } from "./excludeMatcher"
import { createFlattenMatcher } from "./flattenMatcher"
import { getNodesBySearchQuery } from "./getNodesBySearchQuery"
import { compileSearchQuery } from "./searchQuery"

const node = (path: string, children?: CodeMapNode[]): CodeMapNode => ({
    name: path.split("/").pop(),
    path,
    type: children ? NodeType.FOLDER : NodeType.FILE,
    attributes: {},
    ...(children && { children })
})

const ROOT = node("/root", [
    node("/root/src", [
        node("/root/src/app", [
            node("/root/src/app/user", [node("/root/src/app/user/UserService.ts"), node("/root/src/app/user/UserService.spec.ts")]),
            node("/root/src/app/order", [node("/root/src/app/order/OrderService.ts")])
        ]),
        node("/root/src/application", [node("/root/src/application/Main.ts")]),
        node("/root/src/mysrc", [node("/root/src/mysrc/app", [node("/root/src/mysrc/app/Other.ts")])]),
        node("/root/src/My File.ts")
    ]),
    node("/root/test", [node("/root/test/app", [node("/root/test/app/user", [node("/root/test/app/user/UserFixture.ts")])])]),
    node("/root/README.md")
])

const LEAF_PATHS = [
    "/root/src/app/user/UserService.ts",
    "/root/src/app/user/UserService.spec.ts",
    "/root/src/app/order/OrderService.ts",
    "/root/src/application/Main.ts",
    "/root/src/mysrc/app/Other.ts",
    "/root/src/My File.ts",
    "/root/test/app/user/UserFixture.ts",
    "/root/README.md"
]

const searchedPaths = (query: string) => getNodesBySearchQuery(ROOT, query).map(searchedNode => searchedNode.path)

const searchedLeaves = (query: string) => {
    const paths = new Set(searchedPaths(query))
    return LEAF_PATHS.filter(path => paths.has(path))
}

describe("searchQuery", () => {
    describe("getNodesBySearchQuery", () => {
        it.each([
            ["UserService", ["/root/src/app/user/UserService.ts", "/root/src/app/user/UserService.spec.ts"]],
            ["src/app/user", ["/root/src/app/user", "/root/src/app/user/UserService.ts", "/root/src/app/user/UserService.spec.ts"]],
            ["user/UserService.ts", ["/root/src/app/user/UserService.ts"]],
            ["/root/src/app/order", ["/root/src/app/order", "/root/src/app/order/OrderService.ts"]]
        ])("should find %s at any depth as a path fragment", (query, expectedPaths) => {
            // Act
            const paths = searchedPaths(query)

            // Assert
            expect(paths).toEqual(expectedPaths)
        })

        it("should treat spaces and commas alike as separators of terms that each add matches", () => {
            // Arrange
            const expected = [
                "/root/src/app/user/UserService.ts",
                "/root/src/app/user/UserService.spec.ts",
                "/root/src/app/order/OrderService.ts"
            ]

            // Act & Assert
            expect(searchedLeaves("UserService OrderService")).toEqual(expected)
            expect(searchedLeaves("UserService ,OrderService")).toEqual(expected)
            expect(searchedLeaves(" UserService,\tOrderService ")).toEqual(expected)
        })

        it("should remove the matches of a term starting with an exclamation mark", () => {
            // Act
            const leaves = searchedLeaves("UserService !spec")

            // Assert
            expect(leaves).toEqual(["/root/src/app/user/UserService.ts"])
        })

        it("should remove matches inside a matched folder", () => {
            // Act
            const leaves = searchedLeaves("src/app !spec")

            // Assert
            expect(leaves).toEqual([
                "/root/src/app/user/UserService.ts",
                "/root/src/app/order/OrderService.ts",
                "/root/src/application/Main.ts",
                "/root/src/mysrc/app/Other.ts"
            ])
        })

        it("should find everything the terms miss when every term starts with an exclamation mark", () => {
            // Act
            const leaves = searchedLeaves("!src !README")

            // Assert
            expect(leaves).toEqual(["/root/test/app/user/UserFixture.ts"])
        })

        it("should keep the spaces of a quoted name", () => {
            // Act
            const leaves = searchedLeaves('"My File.ts"')

            // Assert
            expect(leaves).toEqual(["/root/src/My File.ts"])
        })

        it("should match a quoted path by whole names only", () => {
            // Act
            const paths = searchedPaths('"src/app"')

            // Assert
            expect(paths).toEqual([
                "/root/src/app",
                "/root/src/app/user",
                "/root/src/app/order",
                "/root/src/app/user/UserService.ts",
                "/root/src/app/user/UserService.spec.ts",
                "/root/src/app/order/OrderService.ts"
            ])
        })

        it("should match a path from the root exactly, not folders that start the same", () => {
            // Act
            const leaves = searchedLeaves("/root/src/app")

            // Assert
            expect(leaves).not.toContain("/root/src/application/Main.ts")
            expect(leaves).toContain("/root/src/app/order/OrderService.ts")
        })

        it("should use a glob as typed, at any depth", () => {
            // Act & Assert
            expect(searchedLeaves("*.spec.ts")).toEqual(["/root/src/app/user/UserService.spec.ts"])
            expect(searchedLeaves("app/*/User*.ts")).toEqual([
                "/root/src/app/user/UserService.ts",
                "/root/src/app/user/UserService.spec.ts",
                "/root/test/app/user/UserFixture.ts"
            ])
        })

        it("should find nothing for a query without terms", () => {
            // Act & Assert
            expect(getNodesBySearchQuery(ROOT, "  , ! ")).toEqual([])
            expect(getNodesBySearchQuery(undefined, "app")).toEqual([])
        })
    })

    describe("compileSearchQuery", () => {
        it.each([
            ["app", "*app*"],
            ["src/app", "**/*src/app*"],
            ['"src/app"', "**/src/app"],
            ['"My File.ts"', "**/My File.ts"],
            ['"My File', "**/My File"],
            ["/root/src/app", "/root/src/app"],
            ['"/root/My Folder"', "/root/My Folder"],
            ["*.ts", "*.ts"],
            ["**/legacy/**", "**/legacy/**"],
            ["app !spec", "*app*, !*spec*"],
            ["!spec !test", "!*spec*, *test*"],
            ["  , ! ", ""]
        ])("should compile %s into the rule %s", (query, expectedRule) => {
            // Act
            const rule = compileSearchQuery(query)

            // Assert
            expect(rule).toBe(expectedRule)
        })
    })

    describe("a rule made from a search", () => {
        const QUERIES = [
            "UserService",
            "src/app",
            "src/app/user",
            "UserService ,OrderService",
            "UserService !spec",
            "src/app !spec",
            "!src !README",
            "!UserService,OrderService",
            '"src/app"',
            '"My File.ts"',
            "/root/src/app",
            "*.spec.ts",
            "app/*/User*.ts"
        ]

        it.each(QUERIES)("should exclude exactly the leaves the search %s showed", query => {
            // Arrange
            const matcher = createExcludeMatcher([{ path: compileSearchQuery(query) }])

            // Act
            const excludedLeaves = LEAF_PATHS.filter(path => matcher.isExcludedLeaf(path))

            // Assert
            expect(excludedLeaves).toEqual(searchedLeaves(query))
        })

        it.each(QUERIES)("should flatten exactly the nodes the search %s showed", query => {
            // Arrange
            const matcher = createFlattenMatcher([{ path: compileSearchQuery(query) }])

            // Act
            const flattenedPaths = allPaths(ROOT).filter(path => matcher.isFlattened(path))

            // Assert
            expect(flattenedPaths.sort()).toEqual(searchedPaths(query).sort())
        })
    })
})

function allPaths(root: CodeMapNode): string[] {
    return [root.path, ...(root.children ?? []).flatMap(allPaths)]
}
