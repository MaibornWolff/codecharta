package de.maibornwolff.codecharta.importer.sonar;

import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMeasuresAPIDatasource;
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMetricsAPIDatasource;
import de.maibornwolff.codecharta.importer.sonar.model.MetricObject;
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier;
import de.maibornwolff.codecharta.model.Project;
import io.reactivex.Flowable;
import io.reactivex.schedulers.Schedulers;

import java.util.List;
import java.util.stream.Collectors;

public class SonarImporter {

    private SonarMetricsAPIDatasource metricsDS;

    private SonarMeasuresAPIDatasource measuresDS;

    public SonarImporter(SonarMetricsAPIDatasource metricsDS, SonarMeasuresAPIDatasource measuresDS) {
        this.metricsDS = metricsDS;
        this.measuresDS = measuresDS;
    }

    public Project getProjectFromMeasureAPI(String name, List<String> metrics) {
        List<String> metricsList = getMetricList(metrics);
        SonarComponentProjectAdapter project = new SonarComponentProjectAdapter(name);

        int noPages = measuresDS.getNumberOfPages(metricsList);

        Flowable.range(1, noPages)
                .flatMap(p -> Flowable.just(p)
                        .subscribeOn(Schedulers.io())
                        .map(page -> measuresDS.getMeasures(metricsList, page)))
                .filter(m -> m.getComponents() != null)
                .flatMap(m -> Flowable.fromIterable(m.getComponents()))
                .filter(c -> c.getQualifier() == Qualifier.FIL || c.getQualifier() == Qualifier.UTS)
                .blockingForEach(component -> project.addComponentAsNode(component));

        return project;
    }

    private List<String> getMetricList(List<String> metrics) {
        if (metrics.isEmpty()) {
            return metricsDS.getAvailableMetrics().stream()
                    .filter(m -> m.isFloatType())
                    .map(MetricObject::getKey)
                    .collect(Collectors.toList());
        }
        return metrics;
    }

}
