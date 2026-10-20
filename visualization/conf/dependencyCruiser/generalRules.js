/** @type {import('dependency-cruiser').IForbiddenRuleType[]} */
module.exports = [
    {
        name: "no-circular",
        severity: "error",
        comment:
            "Prevent circular dependencies between modules. The graph is acyclic (Slice 16h). Unchanged by the reorg — it is path-agnostic.",
        from: {},
        to: { circular: true }
    },
    {
        name: "no-orphans",
        severity: "info",
        comment: "Warn about orphan modules (files not imported anywhere)",
        from: {
            orphan: true,
            pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$", "\\.d\\.ts$", "(^|/)\\.[^/]+\\.[jt]s$", "app/main\\.ts$", "conf/", "script/"]
        },
        to: {}
    },
    {
        name: "no-prod-import-of-mocks",
        severity: "error",
        comment:
            "TEST-ONLY: mock factories/fixtures (app/codeCharta/mocks/ and *.mocks.ts) may be imported only by spec/e2e or other mock files — never by a production module. These are doNotFollow leaves (options.doNotFollow), so their inbound edges are recorded and this rule catches a prod→mock import that the old `exclude` hid from the graph entirely.",
        from: { path: "^app/codeCharta/", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$", "\\.mocks\\.ts$", "^app/codeCharta/mocks/"] },
        to: { path: ["^app/codeCharta/mocks/", "\\.mocks\\.ts$"] }
    }
]
