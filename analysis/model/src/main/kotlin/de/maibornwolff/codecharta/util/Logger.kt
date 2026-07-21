package de.maibornwolff.codecharta.util

import io.github.oshai.kotlinlogging.KotlinLogging

object Logger {
    private val logger = KotlinLogging.logger {}

    fun info(value: () -> String) {
        logger.info {
            value()
        }
    }

    fun error(value: () -> String) {
        logger.error {
            value()
        }
    }

    fun error(throwable: Throwable, value: () -> String) {
        logger.error(throwable) {
            value()
        }
    }

    fun warn(value: () -> String) {
        logger.warn {
            value()
        }
    }

    fun warn(throwable: Throwable, value: () -> String) {
        logger.warn(throwable) {
            value()
        }
    }

    fun debug(value: () -> String) {
        logger.debug {
            value()
        }
    }
}
