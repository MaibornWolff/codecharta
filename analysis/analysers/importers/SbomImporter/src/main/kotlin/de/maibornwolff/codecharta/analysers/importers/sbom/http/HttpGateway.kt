package de.maibornwolff.codecharta.analysers.importers.sbom.http

import java.io.IOException
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

data class HttpReply(val status: Int, val body: String) {
    val isSuccess: Boolean get() = status in SUCCESS
    val isNotFound: Boolean get() = status == NOT_FOUND
    val isWorthRetrying: Boolean get() = status == TOO_MANY_REQUESTS || status >= SERVER_ERROR

    companion object {
        private val SUCCESS = 200..299
        private const val NOT_FOUND = 404
        private const val TOO_MANY_REQUESTS = 429
        private const val SERVER_ERROR = 500
    }
}

class HttpFailure(message: String) : IOException(message)

interface HttpGateway {
    fun get(url: String): HttpReply

    fun post(url: String, json: String): HttpReply
}

class JavaHttpGateway(private val timeout: Duration = Duration.ofSeconds(TIMEOUT_SECONDS)) : HttpGateway {
    private val client: HttpClient = HttpClient.newBuilder().connectTimeout(timeout).followRedirects(HttpClient.Redirect.NORMAL).build()

    override fun get(url: String): HttpReply = send(request(url).GET().build())

    override fun post(url: String, json: String): HttpReply =
        send(request(url).header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(json)).build())

    private fun request(url: String): HttpRequest.Builder =
        HttpRequest.newBuilder(URI.create(url)).timeout(timeout).header("User-Agent", USER_AGENT)

    private fun send(request: HttpRequest): HttpReply {
        val response = client.send(request, HttpResponse.BodyHandlers.ofString())
        return HttpReply(response.statusCode(), response.body())
    }

    companion object {
        private const val TIMEOUT_SECONDS = 30L
        private const val USER_AGENT = "codecharta-ccsh"
    }
}

/** Retries rate limits, server errors and broken connections with a growing pause; a 404 is an answer, not a failure. */
class RetryingHttpGateway(
    private val delegate: HttpGateway,
    private val pausesMillis: List<Long> = listOf(500L, 1_000L, 2_000L),
    private val pause: (Long) -> Unit = Thread::sleep
) : HttpGateway {
    override fun get(url: String): HttpReply = withRetries(url) { delegate.get(url) }

    override fun post(url: String, json: String): HttpReply = withRetries(url) { delegate.post(url, json) }

    private fun withRetries(url: String, call: () -> HttpReply): HttpReply {
        var lastProblem = ""
        for (attempt in 0..pausesMillis.size) {
            if (attempt > 0) pause(pausesMillis[attempt - 1])
            val reply = runCatching(call).getOrElse {
                lastProblem = it.message ?: it.javaClass.simpleName
                null
            }
            if (reply != null && !reply.isWorthRetrying) return reply
            if (reply != null) lastProblem = "HTTP ${reply.status}"
        }
        throw HttpFailure("$url failed: $lastProblem")
    }
}
