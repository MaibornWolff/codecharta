package de.maibornwolff.codecharta.progresstracker

import java.util.Collections
import java.util.concurrent.TimeUnit
import kotlin.math.log10

/**
 * Draws a progress line at most once per [REDRAW_INTERVAL_MILLIS], and always the last update: parsers report every
 * file, from many threads, and drawing each one held them all on the lock of the console.
 */
class ProgressTracker(private val clock: () -> Long = System::currentTimeMillis) {
    private val startTime = clock()
    private var lastLineLength = 0

    @Volatile
    private var lastDrawTime: Long? = null

    fun updateProgress(total: Long, parsed: Long, unit: String, filename: String = "") {
        val now = clock()
        if (isTooSoon(total, parsed, now)) return
        draw(total, parsed, unit, filename, now)
    }

    private fun isTooSoon(total: Long, parsed: Long, now: Long): Boolean {
        val drawnAt = lastDrawTime ?: return false
        return parsed < total && now - drawnAt < REDRAW_INTERVAL_MILLIS
    }

    // function based on java implementation by Alexander Shuev: https://stackoverflow.com/questions/1001290/console-based-progress-in-java
    @Synchronized
    private fun draw(
        total: Long,
        parsed: Long,
        unit: String,
        filename: String,
        now: Long
    ) {
        if (isTooSoon(total, parsed, now)) return
        lastDrawTime = now
        val eta = if (parsed == 0L) 0 else (total - parsed) * (now - startTime) / parsed
        val etaHms =
            if (parsed == 0L) {
                "N/A"
            } else {
                String.format(
                    "%02d:%02d:%02d",
                    TimeUnit.MILLISECONDS.toHours(eta),
                    TimeUnit.MILLISECONDS.toMinutes(eta) % TimeUnit.HOURS.toMinutes(1),
                    TimeUnit.MILLISECONDS.toSeconds(eta) % TimeUnit.MINUTES.toSeconds(1)
                )
            }
        val string = StringBuilder(150)
        if (total > 0) {
            val percent = (parsed * 100 / total).toInt()
            string
                .append('\r')
                .append(
                    java.lang.String.join(
                        "",
                        Collections.nCopies(
                            if (percent == 0) {
                                2
                            } else {
                                2 - log10(percent.toDouble()).toInt()
                            },
                            " "
                        )
                    )
                ).append(String.format(" %d%% [", percent))
                .append(java.lang.String.join("", Collections.nCopies(percent, "=")))
                .append('>')
                .append(java.lang.String.join("", Collections.nCopies(100 - percent, " ")))
                .append(']')
                .append(
                    java.lang.String.join(
                        "",
                        Collections.nCopies(
                            if (parsed == 0L) {
                                log10(total.toDouble()).toInt()
                            } else {
                                log10(total.toDouble()).toInt() - log10(parsed.toDouble()).toInt()
                            },
                            " "
                        )
                    )
                ).append(String.format(" %d/%d %s, ETA: %s", parsed, total, unit, etaHms))

            if (filename != "") {
                string.append(" parsed file: $filename")
                val currentLength = string.length - 1 // -1 because we don't count the \r at the start of the line
                string.append(getClearingSpaces(currentLength))
            }
            System.err.print(string)
        }
    }

    private fun getClearingSpaces(currentLength: Int): String {
        var result = ""
        if (currentLength < lastLineLength) {
            result = " ".repeat(lastLineLength - currentLength)
        }
        lastLineLength = currentLength
        return result
    }

    companion object {
        const val REDRAW_INTERVAL_MILLIS = 100L
    }
}
