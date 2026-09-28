@file:Suppress("unused")

package de.maibornwolff.treesitter.excavationsite.api

import de.maibornwolff.treesitter.excavationsite.shared.domain.Language

/**
 * Re-export Language from shared/domain for public API usage.
 *
 * This type alias allows external code to import Language from the api package
 * while the actual implementation lives in shared/domain.
 */
typealias Language = Language
