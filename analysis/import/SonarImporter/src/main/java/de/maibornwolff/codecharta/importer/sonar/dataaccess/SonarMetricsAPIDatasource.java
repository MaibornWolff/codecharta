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

import de.maibornwolff.codecharta.importer.sonar.SonarImporterException;
import de.maibornwolff.codecharta.importer.sonar.filter.ErrorResponseFilter;
import de.maibornwolff.codecharta.importer.sonar.model.MetricObject;
import de.maibornwolff.codecharta.importer.sonar.model.Metrics;
import io.reactivex.Flowable;
import io.reactivex.schedulers.Schedulers;
import org.glassfish.jersey.client.ClientProperties;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.core.MediaType;
import java.net.URL;
import java.util.List;

/**
 * Requests Data from Sonar Instance through REST-API
 */
public class SonarMetricsAPIDatasource {

    static final int PAGE_SIZE = 500;

    private static final String METRICS_URL_PATTERN = "%s/api/metrics/search?f=hidden,decimalScale&p=%s&ps=" + PAGE_SIZE;

    private static final int TIMEOUT_MS = 5000;

    private final String user;

    private final URL baseUrl;

    private final Client client;

    SonarMetricsAPIDatasource(URL baseUrl) {
        this("", baseUrl);
    }

    public SonarMetricsAPIDatasource(String user, URL baseUrl) {
        this.user = user;
        this.baseUrl = baseUrl;

        client = ClientBuilder.newClient()
                .property(ClientProperties.CONNECT_TIMEOUT, TIMEOUT_MS)
                .property(ClientProperties.READ_TIMEOUT, TIMEOUT_MS);
        client.register(ErrorResponseFilter.class);
        client.register(GsonProvider.class);


    }

    public List<String> getAvailableMetricKeys() {
        int noPages = getNumberOfPages();

        return Flowable.range(1, noPages)
                .flatMap(p -> Flowable.just(p)
                        .subscribeOn(Schedulers.io())
                        .map(this::getAvailableMetrics))
                .filter(m -> m.getMetrics() != null)
                .flatMap(m -> Flowable.fromIterable(m.getMetrics()))
                .filter(MetricObject::isFloatType)
                .map(MetricObject::getKey).distinct().toSortedList().blockingGet();
    }

    public Metrics getAvailableMetrics(int page) {
        String url = String.format(METRICS_URL_PATTERN, baseUrl, page);
        Invocation.Builder request = client.target(url)
                .request(MediaType.APPLICATION_JSON + "; charset=utf-8");
        if (!user.isEmpty()) {
            request.header("Authorization", "Basic " + AuthentificationHandler.createAuthTxtBase64Encoded(user));
        }

        try {
            return request.get(Metrics.class);
        } catch (RuntimeException e) {
            throw new SonarImporterException("Error requesting " + url, e);
        }
    }


    public int getNumberOfPages() {
        Metrics response = getAvailableMetrics(1);
        return (response.getTotal() / PAGE_SIZE) + 1;
    }
}
