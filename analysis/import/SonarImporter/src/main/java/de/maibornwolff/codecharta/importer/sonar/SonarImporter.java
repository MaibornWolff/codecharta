package de.maibornwolff.codecharta.importer.sonar;

import com.google.common.collect.ImmutableList;
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMeasuresAPIDatasource;
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.translator.MetricNameTranslator;
import io.reactivex.Flowable;
import io.reactivex.schedulers.Schedulers;

import java.util.List;

public class SonarImporter {

    public static final List STANDARD_SONAR_METRICS = ImmutableList.of(
            "complexity", "ncloc", "functions", "duplicated_lines", "classes", "coverage", "generated_lines", "bugs", "commented_out_code_lines", "lines", "violations", "comment_lines", "duplicated_blocks");

    private SonarMeasuresAPIDatasource measuresDS;
    private SonarCodeURLLinker sonarCodeURLLinker;

    public SonarImporter(SonarMeasuresAPIDatasource measuresDS, SonarCodeURLLinker sonarCodeURLLinker) {
        this.sonarCodeURLLinker = sonarCodeURLLinker;
        this.measuresDS = measuresDS;
    }

    public Project getProjectFromMeasureAPI(String name, List<String> metrics) throws SonarImporterException {
        List<String> metricsList = getMetricList(metrics);
        MetricNameTranslator translator = SonarMetricTranslatorFactory.createMetricTranslator();
        SonarComponentProjectAdapter project = new SonarComponentProjectAdapter(name, sonarCodeURLLinker, translator);

        int noPages = measuresDS.getNumberOfPages(metricsList);

        Flowable.range(1, noPages)
                .flatMap(p -> Flowable.just(p)
                        .subscribeOn(Schedulers.io())
                        .map(page -> measuresDS.getMeasures(metricsList, page)))
                .filter(m -> m.getComponents() != null)
                .flatMap(m -> Flowable.fromIterable(m.getComponents()))
                .filter(c -> c.getQualifier() == Qualifier.FIL || c.getQualifier() == Qualifier.UTS)
                .blockingForEach(project::addComponentAsNode);

        return project;
    }

    public List<String> getMetricList(List<String> metrics) {
        if (metrics.isEmpty()) {
            return STANDARD_SONAR_METRICS;
        }
        return metrics;
    }

}
