import ignore from "ignore"

export type IgnoreEngine = ReturnType<typeof ignore>

/** What a stored rule matches: the paths its include patterns match, minus those its exclude patterns match. */
export interface NodeRulePatterns {
    /** Null when the whole rule is negated (`!`-prefix): it then includes every path. */
    readonly includes: string[] | null
    readonly excludes: string[]
}

export type TransformedPathMatcher = (transformedPath: string) => boolean

const RULE_NEGATION = "!"
const PATTERN_SEPARATOR = ","

export function transformPath(toTransform: string) {
    let removeNumberOfCharactersFromStart = 2

    if (toTransform.startsWith("/")) {
        removeNumberOfCharactersFromStart = 1
    } else if (!toTransform.startsWith("./")) {
        return toTransform
    }

    return toTransform.slice(removeNumberOfCharactersFromStart)
}

/**
 * A rule is a comma-separated list of patterns. A `!` in front of the whole rule subtracts all of
 * them from every path; a `!` in front of a single pattern subtracts it from what the others match.
 */
export function parseNodeRule(rulePath: string): NodeRulePatterns {
    const rule = rulePath.trimStart()
    const isNegated = rule.startsWith(RULE_NEGATION)
    const patterns = splitPatterns(isNegated ? rule.slice(RULE_NEGATION.length) : rule)
    const subtracted = patterns.filter(pattern => isNegated || pattern.startsWith(RULE_NEGATION)).map(withoutNegation)
    const added = isNegated ? null : patterns.filter(pattern => !pattern.startsWith(RULE_NEGATION))
    return { includes: added && toGitignorePatterns(added), excludes: toGitignorePatterns(subtracted) }
}

const splitPatterns = (patternList: string) =>
    patternList
        .split(PATTERN_SEPARATOR)
        .map(pattern => pattern.trimStart())
        .filter(pattern => pattern.length > 0)

const withoutNegation = (pattern: string) => (pattern.startsWith(RULE_NEGATION) ? pattern.slice(RULE_NEGATION.length) : pattern)

const toGitignorePatterns = (patterns: string[]) => patterns.map(pattern => transformPath(toGitignorePattern(pattern)))

function toGitignorePattern(pattern: string) {
    if (isAnchoredAtRoot(pattern) || pattern.startsWith("*") || pattern.endsWith("*")) {
        return pattern
    }
    return isQuoted(pattern) ? pattern.slice(1, -1) : `*${pattern}*`
}

export const isAnchoredAtRoot = (pattern: string) => pattern.startsWith("/") || pattern.startsWith("./")

const isQuoted = (pattern: string) => pattern.startsWith('"') && pattern.endsWith('"')

export function createRuleMatcher({ includes, excludes }: NodeRulePatterns): TransformedPathMatcher {
    const includeEngine = includes === null ? null : ignore().add(includes)
    const excludeEngine = excludes.length === 0 ? null : ignore().add(excludes)
    return transformedPath => (includeEngine === null || includeEngine.ignores(transformedPath)) && !excludeEngine?.ignores(transformedPath)
}

/** Whether a rule only adds paths, so it can share one engine with other such rules. */
export const isPlainInclusion = ({ includes, excludes }: NodeRulePatterns) => includes !== null && excludes.length === 0

/**
 * The matching engine one list of rules builds: plain inclusions merge into one engine, while rules
 * that subtract paths need a matcher each because they affect paths their patterns do not name.
 */
export function buildRuleEngines(rules: { path: string }[]) {
    const combined = ignore()
    let hasPositiveRule = false
    const subtractingMatchers: TransformedPathMatcher[] = []

    for (const rule of rules) {
        const patterns = parseNodeRule(rule.path)
        if (isPlainInclusion(patterns)) {
            combined.add(patterns.includes)
            hasPositiveRule = true
        } else {
            subtractingMatchers.push(createRuleMatcher(patterns))
        }
    }

    // plain loops instead of Array.some: these run once per node over the whole map
    const matchesTransformed = (transformedPath: string): boolean => {
        if (hasPositiveRule && combined.ignores(transformedPath)) {
            return true
        }
        for (const matches of subtractingMatchers) {
            if (matches(transformedPath)) {
                return true
            }
        }
        return false
    }

    return { combined, hasPositiveRule, matchesTransformed }
}
