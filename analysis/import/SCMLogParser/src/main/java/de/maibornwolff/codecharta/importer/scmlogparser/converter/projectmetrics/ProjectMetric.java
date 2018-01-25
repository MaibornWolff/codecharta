package de.maibornwolff.codecharta.importer.scmlogparser.converter.projectmetrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile;

import java.util.List;
import java.util.Map;

public interface ProjectMetric {
    Map<String, Number> value(List<VersionControlledFile> vcFiles);
}
