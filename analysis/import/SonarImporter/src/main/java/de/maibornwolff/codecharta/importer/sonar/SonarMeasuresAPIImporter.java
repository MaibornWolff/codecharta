package de.maibornwolff.codecharta.importer.sonar;

import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMeasuresAPIDatasource;
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMetricsAPIDatasource;
import de.maibornwolff.codecharta.importer.sonar.model.ComponentMap;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.translator.MetricNameTranslator;

import java.util.List;

public class SonarMeasuresAPIImporter {

    private final SonarMeasuresAPIDatasource measuresDS;
    private final SonarMetricsAPIDatasource metricsDS;
    private final SonarCodeURLLinker sonarCodeURLLinker;
    private final MetricNameTranslator translator;
    private final boolean usePath;

    public SonarMeasuresAPIImporter(SonarMeasuresAPIDatasource measuresDS, SonarMetricsAPIDatasource metricsDS) {
        this(measuresDS, metricsDS, SonarCodeURLLinker.NULL, MetricNameTranslator.TRIVIAL, false);
    }

    public SonarMeasuresAPIImporter(SonarMeasuresAPIDatasource measuresDS, SonarMetricsAPIDatasource metricsDS, SonarCodeURLLinker sonarCodeURLLinker, MetricNameTranslator translator, boolean usePath) {
        this.measuresDS = measuresDS;
        this.metricsDS = metricsDS;
        this.sonarCodeURLLinker = sonarCodeURLLinker;
        this.translator = translator;
        this.usePath = usePath;
    }

    public Project getProjectFromMeasureAPI(String projectKey, String projectName, List<String> metrics) {
        List<String> metricsList = getMetricList(metrics);
        ComponentMap componentMap = measuresDS.getComponentMap(projectKey, metricsList);

        SonarComponentProjectAdapter project = new SonarComponentProjectAdapter(projectName, sonarCodeURLLinker, translator, usePath);
        project.addComponentMapsAsNodes(componentMap);

        return project;
    }

    public List<String> getMetricList(List<String> metrics) {
        if (metrics.isEmpty()) {
            return metricsDS.getAvailableMetricKeys();
        }
        return metrics;
    }

}
