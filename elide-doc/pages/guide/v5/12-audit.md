---
layout: guide
group: guide
title: Logging & Audit
version: 5
---

# Logging

Elide emits a number of useful log messages that can aid in debugging.  This section will cover common configurations to capture Elide's most useful messages.  It will also cover common logging tasks outside Elide including HTTP request/response logging, request tracing, and database query logging.  All examples use Spring Boot configured with logback.  However, most of the concepts apply regardless of the logging framework used.

## Elide JPQL/HQL Logging

When using the JPA or Hibernate datastores, Elide generates [HQL/JPQL](https://docs.oracle.com/html/E13946_04/ejb3_langref.html) queries that are sent to the [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping) layer.  These queries are similar to SQL but they use the model names instead of physical table names.  

To enable logging to see these queries, set the following property (based on the data store) to DEBUG:

```xml
<!-- Log JPA Datastore HQL Statements -->
<logger name="com.yahoo.elide.datastores.jpa.porting.EntityManagerWrapper" level="DEBUG" />
```

```xml
<!-- Log Hibernate 5 Datastore HQL Statements -->
<logger name="com.yahoo.elide.datastores.hibernate5.porting.SessionWrapper level="DEBUG" />
```

```xml
<!-- Log Hibernate 3 Datastore HQL Statements -->
<logger name="com.yahoo.elide.datastores.hibernate3.porting.SessionWrapper level="DEBUG" />
```

This will enable logs similar to:
```
HQL Query: SELECT example_models_ArtifactGroup FROM example.models.ArtifactGroup AS example_models_ArtifactGroup
```

## Elide Error Response Logging

To get extra information why a particular error was returned to a client, enable the following properties to DEBUG:

```xml
<!-- Log HTTP Error Explanations -->
<logger name="com.yahoo.elide.graphql.QueryRunner" level="DEBUG" />
<logger name="com.yahoo.elide.Elide" level="DEBUG" />
```

This is particularly helpful to understand what permissions in a complex permission rule have passed, failed, or were not evaluated.  For example, the following indicates that
_'User is Admin'_ permission rule failed:

```
ForbiddenAccessException: Message=CreatePermission: CREATE PERMISSION WAS INVOKED ON PersistentResource{type=post, id=2} WITH CHANGES ChangeSpec { resource=PersistentResource{type=post, id=2}, field=abusiveContent, original=false, modified=true} FOR EXPRESSION [FIELD((User is Admin FAILED))]	Mode=Optional[ALL_CHECKS]	Expression=[Optional[CREATE PERMISSION WAS INVOKED ON PersistentResource{type=post, id=2} WITH CHANGES ChangeSpec { resource=PersistentResource{type=post, id=2}, field=abusiveContent, original=false, modified=true} FOR EXPRESSION [FIELD((User is Admin FAILED))]]]
```

## Elide Error Response Entity Bodies

It is also possible to return these verbose messages as an entity body in HTTP requests that failed due to Authorization:

```HTTP
HTTP/1.1 403 Forbidden
Date: Sat, 14 Dec 2019 03:33:08 GMT
Content-Type: application/vnd.api+json
Content-Length: 291
Server: Jetty(9.4.24.v20191120)

{
    "errors": [
        "CreatePermission: CREATE PERMISSION WAS INVOKED ON PersistentResource{type=post, id=2} WITH CHANGES ChangeSpec { resource=PersistentResource{type=post, id=2}, field=abusiveContent, original=false, modified=true} FOR EXPRESSION [FIELD((User is Admin FAILED))]"
    ]
}
```

By default these descriptions are disabled.  They can be turned on in Elide Settings:

### Elide Standalone

If using [Elide standalone][elide-standalone], override the following function in `ElideStandaloneSettings` and enable the `VerbosePermissionExecutor`:

```java
@Override
public ElideSettings getElideSettings(ServiceLocator injector) {

    ...
    ElideSettingsBuilder builder = new ElideSettingsBuilder(dataStore)
            .withVerboseErrors()
    ...

    return builder.build();
} 
```

### Elide Spring Boot

If using [Elide spring boot][elide-spring], override the following bean and enable the `VerbosePermissionExecutor`:

```java
@Bean
public Elide initializeElide(EntityDictionary dictionary,
                      DataStore dataStore, ElideConfigProperties settings) {

    ElideSettingsBuilder builder = new ElideSettingsBuilder(dataStore)
             ...
            .withVerboseErrors()
             ...

    return new Elide(builder.build());
}
```

## Hibernate SQL Logging

You can configure Hibernate to display the SQL commands it runs including the parameters it binds to prepared statements:

```xml
<!-- Log Hibernate SQL Statements -->
<logger name="org.hibernate.SQL" level="DEBUG" />
<logger name="org.hibernate.type.descriptor.sql.BasicBinder" level="TRACE" />
```

This will produce logs like:
```
select products0_.group_name as group_na4_1_0_, products0_.name as name1_1_0_, products0_.name as name1_1_1_, products0_.commonName as commonNa2_1_1_, products0_.description as descript3_1_1_, products0_.group_name as group_na4_1_1_ from ArtifactProduct products0_ where products0_.group_name=?
binding parameter [1] as [VARCHAR] - [com.yahoo.elide]
```

Be sure to configure Hibernate to show SQL in the JDBC configuration as well:

### Spring Boot Application YAML:

```yaml
spring:
  jpa:
    hibernate:
      show_sql: true
```

### Elide Standalone Settings:

```java
@Override
public Properties getDatabaseProperties() {
    Properties options = new Properties();
    ...

    options.put("hibernate.show_sql", "true");
    return options;
}
```

## HTTP Request & Response Logging

Sometimes it is useful to log the actual HTTP request and response bodies (be careful in production if the entity bodies contain sensitive data).   This example requires spring boot and [logback-access-spring-boot-starter](https://github.com/akihyro/logback-access-spring-boot-starter):

```xml
<dependency>
    <groupId>net.rakugakibox.spring.boot</groupId>
    <artifactId>logback-access-spring-boot-starter</artifactId>
    <version>${logback-acccess-version}</version>
</dependency>
```

The actual logging of the requests and responses is performed by Logback's [TeeFilter](http://logback.qos.ch/recipes/captureHttp.html).  To add the servlet filter, you must provide the `FilterRegistrationBean` as follows:
```java
@Configuration
public class FilterConfiguration {

    @Bean
    public FilterRegistrationBean requestResponseFilter() {
        final FilterRegistrationBean<TeeFilter> filterRegBean = new FilterRegistrationBean<>();
        TeeFilter filter = new TeeFilter();
        filterRegBean.setFilter(filter);
        filterRegBean.addUrlPatterns("/*");
        filterRegBean.setName("Elide Request Response Filter");
        filterRegBean.setAsyncSupported(Boolean.TRUE);
        return filterRegBean;
    }
}
```

Finally, configure logback access by creating a logback-access-spring.xml file in your classpath.  This one writes logs to a rotating file (the location is defined in the application yaml 'logging.path'):


```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- Make sure this property is set in your application.yaml -->
    <springProperty scope="context" name="logDir" source="logging.path"/>

    <appender name="ACCESSFILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${logDir}/access.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${logDir}/archived/access_%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
            <totalSizeCap>100MB</totalSizeCap>
        </rollingPolicy>
        <encoder>
            <pattern>%t{yyyy-MM-dd:HH:mm:ss Z} %remoteIP %user %requestURL %statusCode %bytesSent %elapsedTime %header{X-B3-TraceId} %requestContent %responseContent</pattern>
        </encoder>
    </appender>

    <appender-ref ref="ACCESSFILE" />
</configuration>
```

The pattern extracts the following fields from the HTTP request & response:

| Field Name                | Explanation                               |
| ------------------------- | ----------------------------------------- |
| %t{yyyy-MM-dd:HH:mm:ss Z} | The date and time of the log              |         
| remoteIP                  | The remote IP address                     |
| requestURL                | The request URL                           |
| statusCode                | The HTTP status code of the response      |
| bytesSent                 | Response content length                   |
| elapsedTime               | Time in milliseconds to serve the request |
| %header{X-B3-TraceId}     | Tracing Header used to track requests     |
| requestContent            | The request entity body                   |
| responseContent           | The response entity body                  |
{:.table}

The 'X-B3-TraceId' header can be used to match request tracing in the server logs.  An example access log would look like:

```
2019-12-14:15:48:53 -0600 0:0:0:0:0:0:0:1 - GET /api/v1/group HTTP/1.1 200 496 385 0000000000000005  {"data":[{"type":"group","id":"com.example.repository","attributes":{"commonName":"Example Repository","description":"The code for this project"},"relationships":{"products":{"data":[]}}},{"type":"group","id":"com.yahoo.elide","attributes":{"commonName":"Elide","description":"The magical library powering this project"},"relationships":{"products":{"data":[{"type":"product","id":"elide-core"},{"type":"product","id":"elide-standalone"},{"type":"product","id":"elide-datastore-hibernate5"}]}}}]}
```

## Request Tracing & Server Logs

This example uses [Spring Cloud Sleuth](https://cloud.spring.io/spring-cloud-sleuth/reference/html/) without [Zipkin](https://zipkin.io/) integration:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-sleuth</artifactId>
    <version>${spring-cloud-sleuth-version}</version>
</dependency>
```

Cloud Sleuth will use [logback MDC logging](http://logback.qos.ch/manual/mdc.html) to pass (if provided in headers) or set a number of unique identifiers that can be added to log statements to trace requests.   These headers ('X-B3-TraceId' and 'X-B3-SpanId') can also be logged in the access log to get the complete picture of a request.

The following logback-spring.xml file can be added to your classpath.  It does the following:
1. Logs to the console and a rotating file.
2. Turns on Elide, JPQL, and Hibernate logging.
3. Logs the time, thread identifier, request trace identifier (X-B3-TraceId), log level, log class, and finally the log message.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- Make sure these properties are set in your application.yaml -->
    <springProperty scope="context" name="logDir" source="logging.path"/>
    <springProperty scope="context" name="springAppName" source="spring.application.name"/>

    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{dd-MM-yyyy HH:mm:ss.SSS} %magenta([%thread]) [${springAppName}, %X{X-B3-TraceId:-}] %highlight(%-5level) %logger{36}.%M - %msg%n</pattern>
        </encoder>
    </appender>

    <appender name="LOGFILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${logDir}/server.log</file>
        <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
            <Pattern>%d{dd-MM-yyyy HH:mm:ss.SSS} [%thread] [${springAppName}, %X{X-B3-TraceId:-}] %-5level %logger{36}.%M - %msg%n</Pattern>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${logDir}/archived/server_%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
            <totalSizeCap>100MB</totalSizeCap>
        </rollingPolicy>
    </appender>

    <!-- Log Hibernate SQL Statements -->
    <logger name="org.hibernate.SQL" level="DEBUG" />
    <logger name="org.hibernate.type.descriptor.sql.BasicBinder" level="TRACE" />

    <!-- Log JPA Datastore HQL Statements -->
    <logger name="com.yahoo.elide.datastores.jpa.porting.EntityManagerWrapper" level="DEBUG" />

    <!-- Log HTTP Error Explanations -->
    <logger name="com.yahoo.elide.graphql.QueryRunner" level="DEBUG" />
    <logger name="com.yahoo.elide.Elide" level="DEBUG" />

    <root level="info">
        <appender-ref ref="STDOUT" />
        <appender-ref ref="LOGFILE" />
    </root>
</configuration>
```

Result log files will look like:
```
14-12-2019 15:48:53.329 [qtp1863374262-22] [Elide, d426047505ceef4e] DEBUG c.y.e.d.j.p.EntityManagerWrapper.logQuery - HQL Query: SELECT example_models_ArtifactGroup FROM example.models.ArtifactGroup AS example_models_ArtifactGroup
```

# Audit

Elide provides an Audit mechanism that assigns semantic meaning to CRUD operations for the purposes of logging and audit.  For example, we may want to log when users change their password or when an account is locked.  Both actions are mutations on a user entity that update different fields. Audit can assign these actions to parameterized, human readable logging statements that can be logged to a file, written to a database, etc.

## Core Concepts

A model's **lineage** is the path taken through the entity relationship graph to reach it.
A model and every prior model in its lineage are fully accessible to parameterize audit logging in Elide.

## Annotations
Elide audits operations on classes and class fields marked with the `Audit` annotation.

The `Audit` annotation takes several arguments:

1. The CRUD action performed (CREATE, DELETE, or UPDATE).
1. An operation code which uniquely identifies the semantic meaning of the action.
1. The statement to be logged.  This is a template string that allows '{}' variable substitution.
1. An ordered list of [Unified Expression Language](https://uel.java.net/) expressions that are used to substitute ‘{}’ in the log statement.  Elide binds the model that is being audited and every model in its lineage to variables that are accessible to the UEL expressions.  The variable names map to model's type (typically the class name).

## Example

Let's say I have a simple _user_ entity with a _password_ field.  I want to audit whenever the password is changed. 
The user is accessed via the URL path '/company/53/user/21'.  I could annotate this action as follows:

```java
@Entity
@Include
public class User {
    @Audit(action = Audit.Action.UPDATE,
           operation = 572,
           logStatement = "User {0} from company {1} changed password.",
           logExpressions = {"${user.userid}", "${company.name}"})
    private String password;
    private String userid;
}
```

Elide binds the `User` object to the variable name _user_ and the `Company` object to the variable name _company_. The `Company` object is bound because it belongs to the `User` object's lineage.

## Customizing Logging
Customizing audit functionality in elide requires two steps:

1. Define audit annotations on JPA entity classes and fields.  
1. Provide a Logger implementation to customize the handling of audit triggers.  The default logger simply logs to [slf4j](http://www.slf4j.org/).

## Logger Implementation
A customized logger extends the following abstract class:

```java
public abstract class AuditLogger {
    public void log(LogMessage message);
    public abstract void commit() throws IOException;
}
```

[elide-standalone]: https://github.com/yahoo/elide/tree/master/elide-standalone
[elide-spring]: https://github.com/yahoo/elide/tree/master/elide-spring/elide-spring-boot-autoconfigure
