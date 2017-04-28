package de.maibornwolff.codecharta.importer.sonar.filter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import de.maibornwolff.codecharta.importer.sonar.model.ErrorEntity;
import de.maibornwolff.codecharta.importer.sonar.model.ErrorResponse;

import javax.ws.rs.*;
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
        if (responseContext.getStatus() != Response.Status.OK.getStatusCode()) {
            if (responseContext.hasEntity()) {

                InputStream stream = responseContext.getEntityStream();
                Gson gson = new GsonBuilder().create();

                ErrorResponse error = gson.fromJson(new InputStreamReader(stream, StandardCharsets.UTF_8), ErrorResponse.class);

                String message = "Errors: \n";
                for (ErrorEntity errorEntity : error.getErrors()) {
                    message += errorEntity.getMsg() + "\n";
                }

                System.out.println(message);

                Response.Status status = Response.Status.fromStatusCode(responseContext.getStatus());
                WebApplicationException webAppException;
                switch (status) {
                    case BAD_REQUEST:
                        webAppException = new BadRequestException(message);
                        break;
                    case UNAUTHORIZED:
                        webAppException = new NotAuthorizedException(message);
                        break;
                    case FORBIDDEN:
                        webAppException = new ForbiddenException(message);
                        break;
                    case NOT_FOUND:
                        webAppException = new NotFoundException(message);
                        break;
                    case METHOD_NOT_ALLOWED:
                        webAppException = new NotAllowedException(message);
                        break;
                    case NOT_ACCEPTABLE:
                        webAppException = new NotAcceptableException(message);
                        break;
                    case UNSUPPORTED_MEDIA_TYPE:
                        webAppException = new NotSupportedException(message);
                        break;
                    case INTERNAL_SERVER_ERROR:
                        webAppException = new InternalServerErrorException(message);
                        break;
                    case SERVICE_UNAVAILABLE:
                        webAppException = new ServiceUnavailableException(message);
                        break;
                    default:
                        webAppException = new WebApplicationException(message);
                }

                throw webAppException;
            }
        }
    }
}