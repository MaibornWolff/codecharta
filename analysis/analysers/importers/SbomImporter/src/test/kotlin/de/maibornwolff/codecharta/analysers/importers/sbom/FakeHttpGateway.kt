package de.maibornwolff.codecharta.analysers.importers.sbom

import de.maibornwolff.codecharta.analysers.importers.sbom.http.HttpGateway
import de.maibornwolff.codecharta.analysers.importers.sbom.http.HttpReply
import java.util.Collections

/** Answers GETs from a table and POSTs with a function; records every request it saw. */
class FakeHttpGateway(
    private val getReplies: Map<String, HttpReply> = emptyMap(),
    private val postReply: (url: String, body: String) -> HttpReply = { _, _ -> HttpReply(404, "") }
) : HttpGateway {
    val requests: MutableList<String> = Collections.synchronizedList(mutableListOf())

    override fun get(url: String): HttpReply {
        requests += "GET $url"
        return getReplies[url] ?: HttpReply(404, "")
    }

    override fun post(url: String, json: String): HttpReply {
        requests += "POST $url $json"
        return postReply(url, json)
    }
}
