package de.maibornwolff.codecharta.importer.sonar;

import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMeasuresAPIDatasource;
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMetricsAPIDatasource;
import de.maibornwolff.codecharta.importer.sonar.model.ComponentMap;
import de.maibornwolff.codecharta.model.Project;

import java.util.List;

public class SonarMeasuresAPIImporter {

    private final SonarMeasuresAPIDatasource measuresDS;
    private final SonarMetricsAPIDatasource metricsDS;
    private final SonarCodeURLLinker sonarCodeURLLinker;

    public SonarMeasuresAPIImporter(SonarMeasuresAPIDatasource measuresDS, SonarMetricsAPIDatasource metricsDS, SonarCodeURLLinker sonarCodeURLLinker) {
        this.measuresDS = measuresDS;
        this.metricsDS = metricsDS;
        this.sonarCodeURLLinker = sonarCodeURLLinker;
    }

    public Project getProjectFromMeasureAPI(String name, List<String> metrics) {
        List<String> metricsList = getMetricList(metrics);
        ComponentMap componentMap = measuresDS.getComponentMapFromDS(metricsList);

        SonarComponentProjectAdapter project = new SonarComponentProjectAdapter(name, sonarCodeURLLinker);
        project.addComponentMapsAsNodes(componentMap);

        return project;
    }

    public List<String> getMetricList(List<String> metrics) {
        if (metrics.isEmpty()) {
            return metricsDS.getAvailableMetricsList();
        }
        return metrics;
    }

}
