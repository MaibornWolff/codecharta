import ignore from "ignore"

export type IgnoreEngine = ReturnType<typeof ignore>

export function transformPath(toTransform: string) {
    let removeNumberOfCharactersFromStart = 2

    if (toTransform.startsWith("/")) {
        removeNumberOfCharactersFromStart = 1
    } else if (!toTransform.startsWith("./")) {
        return toTransform
    }

    return toTransform.slice(removeNumberOfCharactersFromStart)
}

export function returnIgnore(gitignorePath: string) {
    gitignorePath = transformPath(gitignorePath.trimStart())

    let condition = true
    if (gitignorePath.startsWith("!")) {
        gitignorePath = gitignorePath.slice(1)
        condition = false
    }
    const ignoredNodePaths = ignore()

    for (let path of gitignorePath.split(",")) {
        path = path.trimStart()
        if (!path.startsWith("*") && !path.endsWith("*")) {
            path = path.startsWith('"') && path.endsWith('"') ? path.slice(1, -1) : `*${path}*`
        }
        if (path.length === 0) {
            continue
        }
        ignoredNodePaths.add(transformPath(path))
    }
    return { ignoredNodePaths, condition }
}

// Adds the patterns of a positive (non-negated) rule to an existing ignore engine.
// Returns false if the rule is negated (`!`-prefix) so the caller knows it cannot be
// merged into the combined engine and must keep a per-rule engine instead.
// Mirrors the pattern-transformation logic of `returnIgnore`.
export function addRulePatternsToEngine(engine: IgnoreEngine, rulePath: string): boolean {
    const path = transformPath(rulePath.trimStart())
    if (path.startsWith("!")) {
        return false
    }
    for (let p of path.split(",")) {
        p = p.trimStart()
        if (!p.startsWith("*") && !p.endsWith("*")) {
            p = p.startsWith('"') && p.endsWith('"') ? p.slice(1, -1) : `*${p}*`
        }
        if (p.length === 0) {
            continue
        }
        engine.add(transformPath(p))
    }
    return true
}

/**
 * The matching engine one list of rules builds: positive rules merge into one engine, while negated
 * (`!`) rules need one engine each because they affect every path that does *not* match.
 */
export function buildRuleEngines(rules: { path: string }[]) {
    const combined = ignore()
    let hasPositiveRule = false
    const negatedEngines: IgnoreEngine[] = []

    for (const rule of rules) {
        if (addRulePatternsToEngine(combined, rule.path)) {
            hasPositiveRule = true
        } else {
            negatedEngines.push(returnIgnore(rule.path).ignoredNodePaths)
        }
    }

    // plain loops instead of Array.some: these run once per node over the whole map
    const matchesTransformed = (transformedPath: string): boolean => {
        if (hasPositiveRule && combined.ignores(transformedPath)) {
            return true
        }
        for (const engine of negatedEngines) {
            if (!engine.ignores(transformedPath)) {
                return true
            }
        }
        return false
    }

    return { combined, hasPositiveRule, matchesTransformed }
}
