FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /workspace
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
RUN mvn -B -ntp -f backend/pom.xml clean package

FROM tomcat:10.1-jdk17-temurin

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
RUN rm -rf /usr/local/tomcat/webapps/*
COPY --from=build /workspace/backend/target/tourbooking-api.war /usr/local/tomcat/webapps/tourbooking-api.war

EXPOSE 8080
