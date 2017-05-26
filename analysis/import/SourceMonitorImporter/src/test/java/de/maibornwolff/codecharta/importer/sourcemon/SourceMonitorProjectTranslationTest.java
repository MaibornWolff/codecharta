package de.maibornwolff.codecharta.importer.sourcemon;

import de.maibornwolff.codecharta.translation.MetricTranslator;
import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

public class SourceMonitorProjectTranslationTest {
    private final SourceMonitorProjectAdapter project = new SourceMonitorProjectAdapter("test");

    private static InputStream toInputStream(String content) {
        return new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    public void should_translate_node_attributes_according_to_translation_factory() throws UnsupportedEncodingException {

        // given
        Map<String, String> map = TranslationFactory.buildTranslationMap();
        String attribName = map.keySet().iterator().next(); // prevent brittle testing for specific values, taking some value and its translation
        String translatedValue = map.get(attribName);
        String attribVal = "\"0,1\"";
        float attValFloat = 0.1F;

        // when
        project.addSourceMonitorProjectFromCsv(toInputStream("head1,head2,head3,head4," + attribName + "\nprojectName,blubb2,blubb3,blubb4," + attribVal + "\n"));
        project.setNodes(MetricTranslator.translateMetrics(project, TranslationFactory.buildTranslationMap()).getNodes());

        // then
        Map<String, Object> nodeAttributes = project.getRootNode().getChildren().iterator().next().getAttributes();
        assertThat(nodeAttributes.size(), is(1));
        assertThat(nodeAttributes.get(translatedValue), is(attValFloat));
    }

}