FROM sapmachine:11.0.23

ARG USER_ADD
ARG USER_ID=1000
ARG USER_GID=$USER_UID
ARG USERNAME=ubuntu

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
    wget -qO tokei.tar.gz https://github.com/XAMPPRocky/tokei/releases/download/v12.1.2/tokei-x86_64-unknown-linux-gnu.tar.gz; \
    tar -xf tokei.tar.gz -C /usr/local/bin; \
    rm tokei.tar.gz;

RUN wget -qO codemaat.jar https://github.com/adamtornhill/code-maat/releases/download/v1.0.2/code-maat-1.0.2-standalone.jar; \
    mkdir --parents /opt/codemaat; \
    mv codemaat.jar /opt/codemaat/;

RUN curl -sL https://deb.nodesource.com/setup_18.x -o /tmp/nodesource_setup.sh; \
    bash /tmp/nodesource_setup.sh; \
    apt-get install nodejs make gcc build-essential -y;

RUN wget -qO /tmp/sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.7.0.2747-linux.zip; \
    apt-get install unzip -y; \
    cd /tmp ; unzip sonar-scanner.zip; cd sonar-scanner-*-linux; \
    cp ./bin/sonar-scanner /usr/local/bin/; \
    cp ./lib/sonar-scanner-cli-*.jar /usr/local/lib/; \
    mkdir --parents /usr/local/conf ; cp ./conf/sonar-scanner.properties /usr/local/conf/; \
    cp -r ./jre/ /usr/local/jre; cd /; rm /tmp/sonar-scanner.zip; rm -rf /tmp/sonar-scanner-*-linux;


RUN if [ -n "$USER_ADD" ]; then \
      groupadd --gid $USER_GID $USERNAME \
          && useradd --uid $USER_ID --gid $USER_GID -m $USERNAME; \
    fi

USER $USERNAME

CMD ["ccsh"]
