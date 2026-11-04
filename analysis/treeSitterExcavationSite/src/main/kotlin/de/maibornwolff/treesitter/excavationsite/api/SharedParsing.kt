package de.maibornwolff.treesitter.excavationsite.api

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.SharedParses

/**
 * Lets the metrics, extraction and dependency analyses of one source share its parse: within [within], a source that
 * is analysed again with the same grammar on the same thread is not parsed again. Meant for one file at a time, as the
 * parses live until [within] returns.
 */
object SharedParsing {
    fun <T> within(block: () -> T): T = SharedParses.sharing(block)
}
