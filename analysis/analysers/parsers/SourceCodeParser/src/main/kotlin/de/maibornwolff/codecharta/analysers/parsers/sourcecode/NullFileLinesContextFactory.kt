package de.maibornwolff.codecharta.analysers.parsers.sourcecode

import org.sonar.api.batch.fs.InputFile
import org.sonar.api.measures.FileLinesContext
import org.sonar.api.measures.FileLinesContextFactory

class NullFileLinesContextFactory : FileLinesContextFactory {
    override fun createFor(inputFile: InputFile): FileLinesContext {
        return object : FileLinesContext {
            override fun save() {}

            override fun setIntValue(metricKey: String, line: Int, value: Int) {
            }

            override fun setStringValue(metricKey: String, line: Int, value: String) {
            }
        }
    }
}
