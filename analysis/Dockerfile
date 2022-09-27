FROM sapmachine:11

COPY ./build/distributions/*.tar /usr/local/

RUN apt update

RUN cd /usr/local; \
    tar -xf codecharta-analysis-*; \
    rm codecharta-analysis-*.tar; \
    mv codecharta-analysis-*/bin/ccsh /usr/local/bin; \
    mv codecharta-analysis-*/lib/ccsh-*.jar /usr/local/lib; \
    rm -rf codecharta-analysis-*;
