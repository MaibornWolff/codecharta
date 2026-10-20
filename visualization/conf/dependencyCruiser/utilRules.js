/** @type {import('dependency-cruiser').IForbiddenRuleType[]} */
module.exports = [
    {
        name: "util-is-a-leaf-kernel",
        severity: "error",
        comment:
            "util/ is the shared LEAF kernel: pure, self-contained helpers that OTHER layers consume — never the reverse. It may import only within util/, the model/ type kernel (incl. the codeCharta.model re-export barrel + the api.model wire DTO, both now under model/) and node_modules; it must NOT reach into any app layer (views/features/renderer/lenses/stores). Positive allow-list: anything under app/codeCharta/ that is NOT util/ or model/ is forbidden, so any future layer is auto-fenced. Spec/e2e/mocks exempt.",
        from: { path: "^app/codeCharta/util/", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$", "\\.mocks\\.ts$"] },
        to: {
            path: "^app/codeCharta/",
            pathNot: ["^app/codeCharta/util/", "^app/codeCharta/model/"]
        }
    }
]
