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
import de.maibornwolff.codecharta.importer.sonar.model.Component;
import de.maibornwolff.codecharta.importer.sonar.model.ComponentMap;
import de.maibornwolff.codecharta.importer.sonar.model.Measures;
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier;
import io.reactivex.BackpressureStrategy;
import io.reactivex.Flowable;
import io.reactivex.schedulers.Schedulers;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.core.MediaType;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.List;
import java.util.stream.Collectors;

public class SonarMeasuresAPIDatasource {

    private static final int PAGE_SIZE = 500;
    private static final int MAX_METRICS_IN_ONE_SONARCALL = 15;
    private static final String MEASURES_URL_PATTERN = "%s/api/measures/component_tree?baseComponentKey=%s&qualifiers=FIL,UTS&metricKeys=%s&p=%s&ps=" + PAGE_SIZE;
    private final String user;

    private final URL baseUrl;

    private final Client client;

    public SonarMeasuresAPIDatasource(String user, URL baseUrl) {
        this.user = user;
        this.baseUrl = baseUrl;

        client = ClientBuilder.newClient();
        client.register(ErrorResponseFilter.class);
        client.register(GsonProvider.class);
    }

    public ComponentMap getComponentMap(String componentKey, List<String> metricsList) {
        ComponentMap componentMap = new ComponentMap();


        Flowable.fromIterable(Lists.partition(metricsList, MAX_METRICS_IN_ONE_SONARCALL))
                .flatMap(p -> getMeasures(componentKey, p)
                        .subscribeOn(Schedulers.computation())
                )
                .blockingForEach(componentMap::updateComponent);

        return componentMap;
    }

    private Flowable<Component> getMeasures(String componentKey, List<String> sublist) {

        return Flowable.create(subscriber -> {
            int page = 0;
            long total = PAGE_SIZE;
            while (++page < (total / PAGE_SIZE) + 1) {
                Measures measures = getMeasures(componentKey, sublist, page);
                total = measures.getPaging().getTotal();

                if (measures.getComponents() != null) {
                    measures.getComponents().stream()
                            .filter(c -> c.getQualifier() == Qualifier.FIL || c.getQualifier() == Qualifier.UTS)
                            .forEach(subscriber::onNext);
                }
            }
            subscriber.onComplete();
        }, BackpressureStrategy.BUFFER);
    }


    Measures getMeasures(String componentKey, List<String> metrics, int pageNumber) {
        URI measureAPIRequestURI = createMeasureAPIRequestURI(componentKey, metrics, pageNumber);

        Invocation.Builder request = client
                .target(measureAPIRequestURI)
                .request(MediaType.APPLICATION_JSON + "; charset=utf-8");

        if (!user.isEmpty()) {
            request.header("Authorization", "Basic " + AuthentificationHandler.createAuthTxtBase64Encoded(user));
        }

        try {
            return request.get(Measures.class);
        } catch (RuntimeException e) {
            throw new SonarImporterException("Error requesting " + measureAPIRequestURI, e);
        }
    }

    URI createMeasureAPIRequestURI(String componentKey, List<String> metrics, int pageNumber) {
        if (metrics.isEmpty()) {
            throw new IllegalArgumentException("Empty list of metrics is not supported.");
        }

        String metricString = metrics.stream()
                .map(Object::toString)
                .collect(Collectors.joining(","));
        try {
            return new URI(String.format(MEASURES_URL_PATTERN, baseUrl, componentKey, metricString, pageNumber));
        } catch (URISyntaxException e) {
            throw new SonarImporterException(e);
        }
    }
}
