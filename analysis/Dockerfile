FROM sapmachine:11

COPY ./build/distributions/codecharta-analysis-*.tar /usr/local/

RUN cd /usr/local; \
    tar -xf codecharta-analysis-*; \
    rm codecharta-analysis-*.tar; \
    mv codecharta-analysis-*/bin/ccsh /usr/local/bin; \
    mv codecharta-analysis-*/lib/ccsh-*.jar /usr/local/lib; \
    rm -rf codecharta-analysis-*;

RUN apt-get update && apt-get dist-upgrade -y

RUN apt-get install git -y

RUN apt-get install wget curl -y; \
    wget -qO tokei.tar.gz https://github.com/XAMPPRocky/tokei/releases/latest/download/tokei-x86_64-unknown-linux-gnu.tar.gz; \
    tar -xf tokei.tar.gz -C /usr/local/bin; \
    rm tokei.tar.gz;

RUN wget -qO codemaat.jar https://github.com/adamtornhill/code-maat/releases/download/v1.0.2/code-maat-1.0.2-standalone.jar; \
    mkdir --parents /opt/codemaat; \
    mv codemaat.jar /opt/codemaat/;

RUN curl -sL https://deb.nodesource.com/setup_16.x -o /tmp/nodesource_setup.sh; \
    bash /tmp/nodesource_setup.sh; \
    apt-get install nodejs make gcc build-essential -y; \
    npm install -g --unsafe-perm metric-gardener

ENTRYPOINT ["bash"]