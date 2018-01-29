package de.maibornwolff.codecharta.importer.sonar.filter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import de.maibornwolff.codecharta.importer.sonar.model.ErrorEntity;
import de.maibornwolff.codecharta.importer.sonar.model.ErrorResponse;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.client.ClientRequestContext;
import javax.ws.rs.client.ClientResponseContext;
import javax.ws.rs.client.ClientResponseFilter;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Provider;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Provider
public class ErrorResponseFilter implements ClientResponseFilter {

    @Override
    public void filter(ClientRequestContext requestContext, ClientResponseContext responseContext) throws IOException {
        Response.Status status = Response.Status.fromStatusCode(responseContext.getStatus());
        if (status != Response.Status.OK && responseContext.hasEntity()) {
            InputStream stream = responseContext.getEntityStream();

            try {
                Gson gson = new GsonBuilder().create();
                ErrorResponse error = gson.fromJson(new InputStreamReader(stream, StandardCharsets.UTF_8), ErrorResponse.class);

                String message = "Errors: \n";
                for (ErrorEntity errorEntity : error.getErrors()) {
                    message += errorEntity.getMsg() + "\n";
                }

                System.err.println(message);

                throw new WebApplicationException(message);
            } catch (RuntimeException e) {
                System.err.println("Error response could not be parsed. ");
            }
        }
    }
}