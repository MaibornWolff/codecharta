package de.maibornwolff.codecharta.analysers.importers.sbom.http

import de.maibornwolff.codecharta.analysers.importers.sbom.FakeHttpGateway
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test

class RetryingHttpGatewayTest {
    @Test
    fun `should retry a rate limit with growing pauses until it gets an answer`() {
        // Arrange
        val replies = ArrayDeque(listOf(HttpReply(429, ""), HttpReply(502, ""), HttpReply(200, "ok")))
        val pauses = mutableListOf<Long>()
        val gateway = RetryingHttpGateway(FakeHttpGateway(postReply = { _, _ -> replies.removeFirst() }), pause = { pauses += it })

        // Act
        val reply = gateway.post("https://example.test", "{}")

        // Assert
        assertThat(reply.body).isEqualTo("ok")
        assertThat(pauses).containsExactly(500L, 1_000L)
    }

    @Test
    fun `should take a not found as an answer without retrying`() {
        // Arrange
        val http = FakeHttpGateway()
        val gateway = RetryingHttpGateway(http, pause = {})

        // Act
        val reply = gateway.get("https://example.test/missing")

        // Assert
        assertThat(reply.isNotFound).isTrue()
        assertThat(http.requests).hasSize(1)
    }

    @Test
    fun `should give up after the last pause and name the last problem`() {
        // Arrange
        val gateway = RetryingHttpGateway(FakeHttpGateway(postReply = { _, _ -> error("connection reset") }), pause = {})

        // Act + Assert
        assertThatThrownBy { gateway.post("https://example.test", "{}") }
            .isInstanceOf(HttpFailure::class.java)
            .hasMessageContaining("connection reset")
    }
}
