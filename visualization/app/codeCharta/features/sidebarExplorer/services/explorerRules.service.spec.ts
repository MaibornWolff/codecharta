import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { BlacklistItem, CodeMapNode, NodeType } from "../../../codeCharta.model"
import { codeMapNodesSelector } from "../../../state/selectors/accumulatedData/codeMapNodes.selector"
import { blacklistSelector } from "../../../sharedView/sharedView.facade"
import { ExplorerRulesService } from "./explorerRules.service"
import { firstValueFrom } from "rxjs"
import { removeBlacklistItem } from "../../../sharedView/sharedView.facade"

const makeLeaf = (path: string): CodeMapNode => ({
    name: path.split("/").pop() ?? path,
    path,
    type: NodeType.FILE,
    attributes: { unary: 1 }
})

describe("ExplorerRulesService", () => {
    let service: ExplorerRulesService
    let mockStore: MockStore

    const leaves = [
        makeLeaf("/root/src/alpha.kt"),
        makeLeaf("/root/src/beta.kt"),
        makeLeaf("/root/test/alpha.spec.ts"),
        makeLeaf("/root/test/beta.spec.ts")
    ]
    const blacklist: BlacklistItem[] = [
        { type: "flatten", path: "*.spec.ts*" },
        { type: "flatten", path: "*alpha*" },
        { type: "exclude", path: "*node_modules*" }
    ]

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ExplorerRulesService,
                provideMockStore({
                    selectors: [
                        { selector: blacklistSelector, value: blacklist },
                        { selector: codeMapNodesSelector, value: leaves }
                    ]
                })
            ]
        })

        service = TestBed.inject(ExplorerRulesService)
        mockStore = TestBed.inject(MockStore)
    })

    describe("flattenRulesWithCount$", () => {
        it("should count leaves matched per single rule", async () => {
            // Arrange & Act
            const rules = await firstValueFrom(service.flattenRulesWithCount$)

            // Assert
            const specRule = rules.find(r => r.item.path === "*.spec.ts*")
            const alphaRule = rules.find(r => r.item.path === "*alpha*")
            expect(specRule.affectedCount).toBe(2)
            expect(alphaRule.affectedCount).toBe(2)
        })

        it("should mark wildcard paths as RULE", async () => {
            // Arrange & Act
            const rules = await firstValueFrom(service.flattenRulesWithCount$)

            // Assert
            for (const rule of rules) {
                expect(rule.kind).toBe("RULE")
            }
        })

        it("should mark concrete paths as MANUAL", async () => {
            // Arrange
            mockStore.overrideSelector(blacklistSelector, [{ type: "flatten", path: "/root/src/a.ts" }])
            mockStore.refreshState()

            // Act
            const rules = await firstValueFrom(service.flattenRulesWithCount$)

            // Assert
            expect(rules[0].kind).toBe("MANUAL")
        })

        it("should not include exclude items", async () => {
            // Arrange & Act
            const rules = await firstValueFrom(service.flattenRulesWithCount$)

            // Assert
            for (const rule of rules) {
                expect(rule.item.type).toBe("flatten")
            }
        })
    })

    describe("excludeRulesWithCount$", () => {
        it("should only include exclude items", async () => {
            // Arrange & Act
            const rules = await firstValueFrom(service.excludeRulesWithCount$)

            // Assert
            expect(rules).toHaveLength(1)
            expect(rules[0].item.path).toBe("*node_modules*")
        })
    })

    describe("removeRule", () => {
        it("should dispatch removeBlacklistItem with the given item", () => {
            // Arrange
            const dispatchSpy = jest.spyOn(mockStore, "dispatch")

            // Act
            service.removeRule(blacklist[0])

            // Assert
            expect(dispatchSpy).toHaveBeenCalledWith(removeBlacklistItem({ item: blacklist[0] }))
        })
    })
})
