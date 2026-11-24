import { isAnchoredAtRoot } from "./gitignorePattern"

const TERM = /!?"[^"]*"?|[^\s,]+/g
const NEGATION = "!"
const QUOTE = '"'
const ANY_DEPTH = "**/"
const RULE_SEPARATOR = ", "

/**
 * Turns what was typed into the search bar into the rule that matches the same nodes, so the search
 * and the flatten or exclude rule made from it can never disagree. Returns "" when nothing was typed.
 */
export function compileSearchQuery(query: string): string {
    const includes: string[] = []
    const excludes: string[] = []
    for (const [term] of query.matchAll(TERM)) {
        const isNegated = term.startsWith(NEGATION)
        const pattern = compileTerm(isNegated ? term.slice(NEGATION.length) : term)
        if (pattern === "") {
            continue
        }
        if (isNegated) {
            excludes.push(pattern)
        } else {
            includes.push(pattern)
        }
    }
    return toRule(includes, excludes)
}

function toRule(includes: string[], excludes: string[]) {
    if (includes.length === 0) {
        return excludes.length === 0 ? "" : NEGATION + excludes.join(RULE_SEPARATOR)
    }
    return [...includes, ...excludes.map(pattern => NEGATION + pattern)].join(RULE_SEPARATOR)
}

function compileTerm(term: string) {
    if (term === "") {
        return ""
    }
    if (term.startsWith(QUOTE)) {
        const name = term.slice(QUOTE.length, term.length > 1 && term.endsWith(QUOTE) ? -QUOTE.length : undefined)
        return name.length === 0 ? "" : toExactPattern(name)
    }
    if (isAnchoredAtRoot(term) || isGlob(term)) {
        return toExactPattern(term)
    }
    const containing = `*${term}*`
    return term.includes("/") ? ANY_DEPTH + containing : containing
}

function toExactPattern(name: string) {
    const matchesAtAnyDepth = name.startsWith(ANY_DEPTH) || (name.startsWith("*") && !name.includes("/"))
    return isAnchoredAtRoot(name) || matchesAtAnyDepth ? name : ANY_DEPTH + name
}

const isGlob = (pattern: string) => /[*?[]/.test(pattern)
