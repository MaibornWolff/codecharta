/*
 * Copyright (c) 2017, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package de.maibornwolff.codecharta.importer.sonar.dataaccess;

import com.google.common.collect.Lists;
import de.maibornwolff.codecharta.importer.sonar.SonarImporterException;
import de.maibornwolff.codecharta.importer.sonar.filter.ErrorResponseFilter;
import de.maibornwolff.codecharta.importer.sonar.model.ComponentMap;
import de.maibornwolff.codecharta.importer.sonar.model.Measures;
import de.maibornwolff.codecharta.importer.sonar.model.PagingInfo;
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier;
import io.reactivex.Flowable;
import io.reactivex.schedulers.Schedulers;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.List;
import java.util.stream.Collectors;

public class SonarMeasuresAPIDatasource {

    private static final int PAGE_SIZE = 100;

    private static final int MAX_METRICS_IN_ONE_SONARCALL = 15;

    private static final String MEASURES_URL_PATTERN = "%s/api/measures/component_tree?baseComponentKey=%s&qualifiers=FIL,UTS&metricKeys=%s&p=%s&ps=" + PAGE_SIZE;

    private final String user;

    private final URL baseUrl;

    private final String projectKey;

    public SonarMeasuresAPIDatasource(String user, URL baseUrl, String projectKey) {
        this.user = user;
        this.baseUrl = baseUrl;
        this.projectKey = projectKey;
    }

    public ComponentMap getComponentMap(List<String> metricsList) {
        ComponentMap componentMap = new ComponentMap();
        for (List<String> sublist : Lists.partition(metricsList, MAX_METRICS_IN_ONE_SONARCALL)) {
            int noPages = getNumberOfPages(sublist);

            Flowable.range(1, noPages)
                    .flatMap(p -> Flowable.just(p)
                            .subscribeOn(Schedulers.io())
                            .map(page -> getMeasures(sublist, page)))
                    .filter(m -> m.getComponents() != null)
                    .flatMap(m -> Flowable.fromIterable(m.getComponents()))
                    .filter(c -> c.getQualifier() == Qualifier.FIL || c.getQualifier() == Qualifier.UTS)
                    .blockingForEach(componentMap::updateComponent);
        }
        return componentMap;
    }


    public Measures getMeasures(List<String> metrics, int pageNumber) {
        URI measureAPIRequestURI = createMeasureAPIRequestURI(metrics, pageNumber);

        Client client = ClientBuilder.newClient();
        client.register(ErrorResponseFilter.class);
        client.register(GsonProvider.class);

        Invocation.Builder request = client.register(GsonProvider.class).target(measureAPIRequestURI).request();

        if (!user.isEmpty()) {
            request.header("Authorization", "Basic " + AuthentificationHandler.createAuthTxtBase64Encoded(user));
        }

        return request.get(Measures.class);

    }

    URI createMeasureAPIRequestURI(List<String> metrics, int pageNumber) {
        if (metrics.isEmpty()) {
            throw new IllegalArgumentException("Empty list of metrics is not supported.");
        }

        String metricString = metrics.stream()
                .map(Object::toString)
                .collect(Collectors.joining(","));
        try {
            return new URI(String.format(MEASURES_URL_PATTERN, baseUrl, projectKey, metricString, pageNumber));
        } catch (URISyntaxException e) {
            throw new SonarImporterException(e);
        }
    }

    public int getNumberOfPages(List<String> metrics) {
        PagingInfo pagingInfo = getMeasures(metrics, 1).getPaging();
        int total = pagingInfo.getTotal();
        return (total / PAGE_SIZE) + 1;
    }
}
