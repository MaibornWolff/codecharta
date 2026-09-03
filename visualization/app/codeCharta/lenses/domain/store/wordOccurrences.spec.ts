import { CodeMapNode, DomainLensData, NodeType } from "../../../model/codeCharta.model"
import { buildWordOccurrenceTree } from "./wordOccurrences"

describe("buildWordOccurrenceTree", () => {
    const tree: CodeMapNode = {
        name: "root",
        type: NodeType.FOLDER,
        path: "/root",
        children: [
            {
                name: "billing",
                type: NodeType.FOLDER,
                path: "/root/billing",
                children: [
                    { name: "invoice.ts", type: NodeType.FILE, path: "/root/billing/invoice.ts" },
                    { name: "dunning.ts", type: NodeType.FILE, path: "/root/billing/dunning.ts" }
                ]
            },
            {
                name: "api",
                type: NodeType.FOLDER,
                path: "/root/api",
                children: [{ name: "client.ts", type: NodeType.FILE, path: "/root/api/client.ts" }]
            }
        ]
    }

    it("should report each node's share of the word's occurrences in scope", () => {
        // Arrange
        const words: DomainLensData = {
            "/root": [{ text: "invoice", frequency: 10 }],
            "/root/billing": [{ text: "invoice", frequency: 8 }],
            "/root/api": [{ text: "invoice", frequency: 2 }]
        }

        // Act
        const occurrences = buildWordOccurrenceTree(tree, words, "/root", "invoice")

        // Assert
        expect(occurrences).toMatchObject({
            path: "/root",
            count: 10,
            share: 1,
            children: [
                { path: "/root/billing", count: 8, share: 0.8 },
                { path: "/root/api", count: 2, share: 0.2 }
            ]
        })
    })

    it("should sum a folder's children when the producer recorded no folder aggregate", () => {
        // Arrange
        const words: DomainLensData = {
            "/root/billing/invoice.ts": [{ text: "invoice", frequency: 6 }],
            "/root/billing/dunning.ts": [{ text: "invoice", frequency: 3 }],
            "/root/api/client.ts": [{ text: "invoice", frequency: 1 }]
        }

        // Act
        const occurrences = buildWordOccurrenceTree(tree, words, "/root", "invoice")

        // Assert
        expect(occurrences).toMatchObject({
            count: 10,
            children: [
                { path: "/root/billing", count: 9 },
                { path: "/root/api", count: 1 }
            ]
        })
    })

    it("should prefer a folder's own aggregate over the sum of its children", () => {
        // Arrange
        const words: DomainLensData = {
            "/root/billing": [{ text: "invoice", frequency: 20 }],
            "/root/billing/invoice.ts": [{ text: "invoice", frequency: 6 }]
        }

        // Act
        const occurrences = buildWordOccurrenceTree(tree, words, "/root", "invoice")

        // Assert
        expect(occurrences?.children[0]).toMatchObject({ path: "/root/billing", count: 20 })
    })

    it("should keep the files of a folder as its children", () => {
        // Arrange
        const words: DomainLensData = {
            "/root/billing/invoice.ts": [{ text: "invoice", frequency: 6 }],
            "/root/billing/dunning.ts": [{ text: "invoice", frequency: 3 }]
        }

        // Act
        const occurrences = buildWordOccurrenceTree(tree, words, "/root", "invoice")

        // Assert
        expect(occurrences?.children[0].children).toMatchObject([
            { path: "/root/billing/invoice.ts", name: "invoice.ts", isFolder: false, count: 6 },
            { path: "/root/billing/dunning.ts", isFolder: false, count: 3 }
        ])
    })

    it("should drop branches the word does not appear in", () => {
        // Arrange
        const words: DomainLensData = { "/root/api/client.ts": [{ text: "invoice", frequency: 1 }] }

        // Act
        const occurrences = buildWordOccurrenceTree(tree, words, "/root", "invoice")

        // Assert
        expect(occurrences?.children.map(child => child.path)).toEqual(["/root/api"])
    })

    it("should sort equally frequent nodes by name", () => {
        // Arrange
        const words: DomainLensData = {
            "/root/billing": [{ text: "invoice", frequency: 4 }],
            "/root/api": [{ text: "invoice", frequency: 4 }]
        }

        // Act
        const occurrences = buildWordOccurrenceTree(tree, words, "/root", "invoice")

        // Assert
        expect(occurrences?.children.map(child => child.name)).toEqual(["api", "billing"])
    })

    it("should scope the shares to the selected node", () => {
        // Arrange
        const words: DomainLensData = {
            "/root": [{ text: "invoice", frequency: 10 }],
            "/root/billing/invoice.ts": [{ text: "invoice", frequency: 6 }],
            "/root/billing/dunning.ts": [{ text: "invoice", frequency: 2 }]
        }

        // Act
        const occurrences = buildWordOccurrenceTree(tree, words, "/root/billing", "invoice")

        // Assert
        expect(occurrences).toMatchObject({
            path: "/root/billing",
            count: 8,
            children: [
                { path: "/root/billing/invoice.ts", count: 6, share: 0.75 },
                { path: "/root/billing/dunning.ts", count: 2, share: 0.25 }
            ]
        })
    })

    it("should report a share of zero when the word does not occur in scope", () => {
        // Act
        const occurrences = buildWordOccurrenceTree(tree, {}, "/root", "invoice")

        // Assert
        expect(occurrences).toMatchObject({ count: 0, share: 0, children: [] })
    })

    it("should report nothing when the scope path is not part of the tree", () => {
        // Act
        const occurrences = buildWordOccurrenceTree(tree, {}, "/root/gone", "invoice")

        // Assert
        expect(occurrences).toBeNull()
    })

    it("should report nothing when no map is loaded", () => {
        // Act
        const occurrences = buildWordOccurrenceTree(undefined, {}, "/root", "invoice")

        // Assert
        expect(occurrences).toBeNull()
    })
})
