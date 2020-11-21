package de.maibornwolff.codecharta.progresstracker

import java.util.Collections
import java.util.concurrent.TimeUnit
import kotlin.math.log10

class ProgressTracker() {

    private var startTime = System.currentTimeMillis()

    // function based on java implementation by Alexander Shuev: https://stackoverflow.com/questions/1001290/console-based-progress-in-java
    fun updateProgress(total: Long, parsed: Long, unit: String, filename: String = "") {
        val eta = if (parsed == 0L) 0 else (total - parsed) * (System.currentTimeMillis() - startTime) / parsed
        val etaHms = if (parsed == 0L) "N/A" else String.format(
            "%02d:%02d:%02d",
            TimeUnit.MILLISECONDS.toHours(eta),
            TimeUnit.MILLISECONDS.toMinutes(eta) % TimeUnit.HOURS.toMinutes(1),
            TimeUnit.MILLISECONDS.toSeconds(eta) % TimeUnit.MINUTES.toSeconds(1)
        )
        val string = StringBuilder(150)
        if (total > 0) {
            val percent = (parsed * 100 / total).toInt()
            string
                .append('\r')
                .append(
                    java.lang.String.join(
                        "",
                        Collections.nCopies(
                            if (percent == 0) 2 else 2 - log10(percent.toDouble())
                                .toInt(),
                            " "
                        )
                    )
                )
                .append(String.format(" %d%% [", percent))
                .append(java.lang.String.join("", Collections.nCopies(percent, "=")))
                .append('>')
                .append(java.lang.String.join("", Collections.nCopies(100 - percent, " ")))
                .append(']')
                .append(
                    java.lang.String.join(
                        "",
                        Collections.nCopies(
                            if (parsed == 0L) log10(total.toDouble()).toInt() else log10(total.toDouble())
                                .toInt() - log10(parsed.toDouble()).toInt(),
                            " "
                        )
                    )
                )
                .append(String.format(" %d/%d %s, ETA: %s", parsed, total, unit, etaHms))

            if (filename != "")
                string.append(" parsed file: $filename")
            System.err.print(string)
        }
    }
}
