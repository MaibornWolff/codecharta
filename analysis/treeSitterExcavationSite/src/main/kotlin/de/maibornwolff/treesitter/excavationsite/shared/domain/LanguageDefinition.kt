package de.maibornwolff.treesitter.excavationsite.shared.domain

interface LanguageDefinition :
    MetricMapping,
    ExtractionMapping,
    DependencyMapping {
    val calculationConfig: CalculationConfig
        get() = CalculationConfig()

    /** Transforms the content before parsing, e.g. to keep only the `<script>` section of a Vue file. */
    val preprocessor: ((String) -> String)?
        get() = null

    /** Other-language sources inside a file, such as Angular inline templates; their complexity and texts count for the file. */
    val embeddedSources: EmbeddedSourceMapping?
        get() = null
}
