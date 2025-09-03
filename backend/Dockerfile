# ---- Build stage ----
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Alap munkakönyvtár
WORKDIR /app

# Másoljuk be a pom.xml-t és a forráskódot
COPY pom.xml ./
COPY src ./src

# Maven build
RUN mvn package -DskipTests

# ---- Run stage ----
FROM eclipse-temurin:17-jdk

# Munkakönyvtár a futtatáshoz
WORKDIR /app

# Másoljuk át a build stage-ből a futtatható JAR-t
COPY --from=build /app/target/*-runner.jar app.jar

# Nyitjuk a portot
EXPOSE 8080

# Futtatás
ENTRYPOINT ["java", "-jar", "app.jar"]
