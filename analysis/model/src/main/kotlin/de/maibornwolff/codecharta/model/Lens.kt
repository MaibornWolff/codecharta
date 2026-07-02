package de.maibornwolff.codecharta.model

/**
 * A namespaced, additive overlay joined to the file tree by node [NodeId]. Lenses separate the
 * different analysis signals (metrics, dependency, domain, security) so the suite can extend the
 * format without bloating the identity layer. Each concrete lens owns how it merges with another
 * instance of itself, so the merge resolver delegates per lens instead of special-casing fields.
 */
sealed interface Lens
