---
layout: guide
group: guide
title: Data Models
version: 4
---
<style>
.annotation-list {
    font-size: 14pt;
    margin: 0 auto;
    max-width: 800px;
}

.annotation-list .list-label {
    font-weight: bold;
}

.annotation-list .list-value {
    margin-left: 10px;
}

.annotation-list .code-font {
    font-family: "Courier New", Courier, monospace;
    margin-left: 10px;
}
</style>

**NOTE:** This page is a description on how to _create_ data models in the backend using Elide. For more information on _interacting_ with an Elide API, please see our [API usage documentation](/pages/guide/v{{ page.version }}/09-clientapis.html).

---------------------

Elide generates its API entirely based on the concept of **data models**.   Data models are Java classes that represent both a concept to your application and also the _schema_ of an exposed web service endpoint.  Data models are intended to be a _view_ on top of the [data store](/pages/guide/v{{ page.version }}/06-datatstores.html) or the set of data stores which support your Elide-based service.  

All Elide models have an identifier field that identifies a unique instance of the model.  Models are also composed of optional attributes and relationships.  Attribute are properties of the model.  Relationships are simply links to other related Elide models.    Annotations are used to declare that a class is an Elide model, that a relationship exists between two models, to denote which field is the identifier field, and to [secure the model](/pages/guide/v{{ page.version }}/03-security.html). 

## Annotations

Elide has first class support for [JPA (Java Persistence API)](http://www.oracle.com/technetwork/java/javaee/tech/persistence-jsp-140049.html) annotations.  These annotations serve double duty by both:
 - describing the attributes, relationships, and id field of a model.
 - provide an object relational mapping that can be used by an Elide data store to persist the model.

Elide makes use of the following JPA annotations: `@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`, `@Id`, and `@GeneratedValue`.  
If you need more information about JPA, please [review their documentation](http://www.oracle.com/technetwork/java/javaee/tech/persistence-jsp-140049.html) or see our examples below.

However, JPA is not required and Elide supports its own set of annotations for describing models:

| Annotation Purpose       | JPA                         | Non-JPA           | 
|--------------------------|-----------------------------|-------------------|
| Expose a model in elide  |                             | `@Include`        |
| To One Relationship      | `@OneToOne`, `@ManyToOne`   | `@ToOne`          |
| To Many Relationship     | `@OneToMany`, `@ManyToMany` | `@ToMany`         |
| Mark an identifier field | `@Id`                       |                   |
{:.table}

Much of the Elide per-model configuration is done via annotations. For a full description of all Elide-supported annotations, please check out the [annotation overview](/pages/guide/v{{ page.version }}/15-annotations.html).

## Exposing a Model as an Elide Endpoint

After creating a proper data model, you can expose it through Elide by marking with with `@Include`.  Elide generates its API as a _graph_.  This graph can only be traversed starting at a _root_ node. Rootable entities are denoted by applying `@Include(rootLevel=true)` to the top-level of the class. Non-rootable entities can be accessed only as relationships through the graph.

```java
@Include(rootLevel=true)
@Entity
public class Author {
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;

    private String name;

    @ManyToMany
    private Set<Book> books;
}
```

```java
@Include
@Entity
public class Book {
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;

    private String title;

    @ManyToMany
    private Set<Author> authors;
}
```

Considering the example above, we have a full data model that exposes a specific graph. Namely, a root node of the type `Author` and a bi-directional relationship from `Author` to `Book`. That is, one can access all `Author` objects directly, but must go _through_ an author to see information about any specific `Book` object.

## Model Identifiers

Every model in Elide must have an ID.  This is a requirement of both the JSON-API specification and Elide's GraphQL API.  Identifiers can be assigned by the persistence layer automatically or the client.  Elide must know two things:

1. What field is the ID of the model.  This is determined by the `@Id` annotation.
2. Whether the persistence layer is assigning the ID or not.  This is determined by the presence or absence of the `@GeneratedValue` annotation.

Identifier fields in Elide are typically integers, longs, strings, or UUIDs.   It is also possible to have composite/compound ID fields composed of multiple fields.  For example, the following identifier type includes three fields that together create a primary key:

```java
@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Address implements Serializable {
    private long number;
    private String street;
    private long zipCode;
}
```

This new compound ID type can then be referenced in an Elide model identifier like this:

```java
@Include(rootLevel = true)
@Data
@Entity
public class Building {
    @Id
    @Embedded
    private Address address;
}
```

Because JSON-API requires all ID fields to be Strings, composite/compound IDs require the developer to register an Elide `Serde` to serialize and deserialize the ID type to a String.  For example, the following `Serde` will encode/decode an `Address` as a base64 encoded string:

```java
@ElideTypeConverter(type = Address.class, name = "Address")
public class AddressSerde implements Serde<String, Address> {
    private static final Pattern ADDRESS_PATTERN =
            Pattern.compile("Address\\(number=(\\d+), street=([a-zA-Z0-9 ]+), zipCode=(\\d+)\\)");

    @Override
    public Address deserialize(String val) {
        byte[] decodedBytes = Base64.getDecoder().decode(val);
        String decodedString = new String(decodedBytes);

        Matcher matcher = ADDRESS_PATTERN.matcher(decodedString);
        if (! matcher.matches()) {
            throw new InvalidValueException(decodedString);
        }
        long number = Long.valueOf(matcher.group(1));
        String street = matcher.group(2);
        long zipCode = Long.valueOf(matcher.group(3));

        Address address = new Address(number, street, zipCode);

        return address;
    }

    @Override
    public String serialize(Address val) {
        return Base64.getEncoder().encodeToString(val.toString().getBytes());
    }
}
```

More information about `Serde` and user defined types can be found [here](/pages/guide/v{{ page.version }}/09-clientapis.html#type-coercion).

## Attributes vs Relationships

Elide distinguishes between attributes and relationships in a data model:
1. *Relationships* are links from one model to another.  They can be traversed directly through the API.  If the relationship represents a collection, they can also be sorted, filtered, and paginated.  Relationships must be explicitly marked with an annotation (for example - `@ToMany`) in the model.  Relationships can be bidirectional or unidirectional.
2. *Attributes* are properties of a model.  Attributes can be primitive types, objects, or collections of objects or primitives.  Attributes which are collections cannot be sorted, filtered, or paginated in the API.  Complex attributes (collections or objects) cannot be used in a filter predicate.  Attributes are not marked with annotations in Elide.

## Model Properties or Fields

An elide model can be described using properties (getter and setter functions) or fields (class member variables) but not both on the same entity.  For any given entity, Elide looks at whether `@Id` is a property or field to determine the access mode (property or field) for that entity.  All public properties and all fields are exposed through the Elide API if they are not explicitly marked `@Transient` or `@Exclude`. `@Transient` allows a field to be ignored by both Elide and an underlying persistence store while `@Exclude` allows a field to exist in the underlying persistence layer without exposing it through the Elide API.

## Computed Attributes

A computed attribute is an entity attribute whose value is computed in code rather than fetched from a data store.

Elide supports computed properties by way of the `@ComputedAttribute` and `@ComputedRelationship` annotations. These are useful if your data store is also tied to your Elide view data model. For instance, if you mark a field `@Transient`, a data store such as Hibernate will ignore it. In the absence of the `@Computed*` attributes, Elide will too. However, when applying a computed property attribute, Elide will expose this field anyway.

A computed attribute can perform arbitrary computation and is exposed through Elide as a typical attribute. In the case below, this will create an attribute called `myComputedAttribute`.

```java
@Include
@Entity
public class Book {
    ...
    @Transient
    @ComputedAttribute
    public String getMyComputedAttribute(RequestScope requestScope) {
        return "My special string stored only in the JVM!";
    }
    ...
}
```

The same principles are analogous to `@ComputedRelationship`s.

## Lifecycle Hooks

Lifecycle event triggers allow custom business logic (defined in functions) to be invoked during CRUD operations at three distinct phases:

1. *Pre Security* - Executed prior to Elide _commit_ security check evaluation.
1. *Pre Commit* - Executed immediately prior to transaction commit but after all security checks have been evaluated.
1. *Post Commit* - Executed immediately after transaction commit.

There are two mechanisms to enable lifecycle hooks:
1. The simplest mechanism embeds the lifecycle hook as methods within the entity bean itself.   The methods are marked with `@On...` annotations (see below).
1. Lifecycle hook functions can also be registered with the `EntityDictionary` when initializing Elide.  

### Annotation Based Hooks

There are separate annotations for each CRUD operation (_read_, _update_, _create_, and _delete_) and also each life cycle phase of the current transaction:

```java
@Entity
class Book {
   @Column
   public String title;

   @OnReadPreSecurity("title")
   public void onReadTitle() {
      // title attribute about to be read but 'commit' security checks not yet executed.
   }

   @OnUpdatePreSecurity("title")
   public void onUpdateTitle() {
      // title attribute updated but 'commit' security checks not yet executed.
   }

   @OnUpdatePostCommit("title")
   public void onCommitTitle() {
      // title attribute updated & committed
   }

   @OnCreatePostCommit
   public void onCommitBook() {
      // book entity created & committed
   }

   /**
    * Trigger functions can optionally accept a RequestScope to access the user principal.
    */
   @OnDeletePreCommit
   public void onDeleteBook(RequestScope scope) {
      // book entity deleted but not yet committed
   }
}
```

All trigger functions can either take zero parameters or a single `RequestScope` parameter.  

The `RequestScope` can be used to access the user principal object that initiated the request:

```java
   @OnReadPostCommit("title")
   public void onReadTitle(RequestScope scope) {
      User principal = scope.getUser();
 
      //Do something with the principal object...
   }

```

Update and Create trigger functions on fields can also take both a `RequestScope` parameter and a `ChangeSpec` parameter.  The `ChangeSpec` can be used to access the before & after values for a given field change:

```java
   @OnUpdatePreSecurity("title")
   public void onUpdateTitle(RequestScope scope, ChangeSpec changeSpec) {
      //Do something with changeSpec.getModified or changeSpec.getOriginal
   }

```

Lifecycle triggers can evaluate for actions on a specific field in a class, for any field in a class, or for the entire class.  The behavior is determined by the _value_ passed in the annotation:
1. An empty value denotes that the trigger should be called exactly once per action on that given entity.
1. A value matching an entity field/property name denotes that the trigger should be called once per action on that given field/property.
1. A value set to `*` denotes that the trigger should be called once per action on _all_ fields or properties in the class that were referenced in the request. 

Below is a description of each of these annotations and their function:

1. `@OnCreatePreSecurity(value)` This annotation executes immediately when the object is created, with fields populated, on the server-side after User checks but before _commit_ security checks execute and before it is committed/persisted in the backend.  Any non-user _inline_ and _operation_ CreatePermission checks are effectively _commit_ security checks.
1. `@OnCreatePreCommit(value)` This annotation executes after the object is created and all security checks are evaluated on the server-side but before it is committed/persisted in the backend.
1. `@OnCreatePostCommit(value)` This annotation executes after the object is created and committed/persisted on the backend.
1. `@OnDeletePreSecurity` This annotation executes immediately when the object is deleted on the server-side but before _commit_ security checks execute and before it is committed/persisted in the backend.
1. `@OnDeletePreCommit` This annotation executes after the object is deleted and all security checks are evaluated on the server-side but before it is committed/persisted in the backend.
1. `@OnDeletePostCommit` This annotation executes after the object is deleted and committed/persisted on the backend.
1. `@OnUpdatePreSecurity(value)` This annotation executes immediately when the field is updated on the server-side but before _commit_ security checks execute and before it is committed/persisted in the backend.
1. `@OnUpdatePreCommit(value)` This annotation executes after the object is updated and all security checks are evaluated on the server-side but before it is committed/persisted in the backend.
1. `@OnUpdatePostCommit(value)` This annotation executes after the object is updated and committed/persisted on the backend.
1. `@OnReadPreSecurity(value)` This annotation executes immediately when the object is read on the server-side but before _commit_ security checks execute and before the transaction commits.
1. `@OnReadPreCommit(value)` This annotation executes after the object is read and all security checks are evaluated on the server-side but before the transaction commits.
1. `@OnReadPostCommit(value)` This annotation executes after the object is read and the transaction commits.

### Registered Function Hooks

To keep complex business logic separated from the data model, it is also possible to register `LifeCycleHook` functions during Elide initialization (since Elide 4.1.0):

```java
/**
 * Function which will be invoked for Elide lifecycle triggers
 * @param <T> The elide entity type associated with this callback.
 */
@FunctionalInterface
public interface LifeCycleHook<T> {
    /**
     * Run for a lifecycle event
     * @param elideEntity The entity that triggered the event
     * @param requestScope The request scope
     * @param changes Optionally, the changes that were made to the entity
     */
    public abstract void execute(T elideEntity,
                                 RequestScope requestScope,
                                 Optional<ChangeSpec> changes);
```

The hook functions are registered with the `EntityDictionary` by specifying the corresponding life cycle annotation (which defines when the hook triggers) along
with the entity model class and callback function:

```java
//Register a lifecycle hook for deletes on the model Book
dictionary.bindTrigger(Book.class, OnDeletePreSecurity.class, callback);

//Register a lifecycle hook for updates on the Book model's title attribute
dictionary.bindTrigger(Book.class, OnUpdatePostCommit.class, "title", callback);

//Register a lifecycle hook for updates on _any_ of the Book model's attributes
dictionary.bindTrigger(Book.class, OnUpdatePostCommit.class, callback, true);
```

## Initializers

Sometimes models require additional information from the surrounding system to be useful. Since all model objects in Elide are ultimately constructed by the `DataStore`, and because Elide does not directly depend on any specific dependency injection framework (though you can still use your own [dependency injection frameworks](#dependency-injection)), Elide provides an alternate way to initialize a model.

Elide can be configured with an `Initializer` implementation for a particular model class.  An `Initializer` is any class which implements the following interface:

```java
@FunctionalInterface
public interface Initializer<T> {
    /**
     * Initialize an entity bean
     *
     * @param entity Entity bean to initialize
     */
    public void initialize(T entity);
}
```

Initializers can be configured in the `EntityDictionary` using the following bind method:

```java
    /**
     * Bind a particular initializer to a class.
     *
     * @param <T>         the type parameter
     * @param initializer Initializer to use for class
     * @param cls         Class to bind initialization
     */
    public <T> void bindInitializer(Initializer<T> initializer, Class<T> cls) {
        bindIfUnbound(cls);
        getEntityBinding(cls).setInitializer(initializer);
    }
```

## Dependency Injection

Elide does not depend on a specific dependency injection framework.  However, Elide can inject entity models during
their construction (to implement life cycle hooks or other functionality).

Elide provides a framework agnostic, functional interface to inject entity models:

```java
/**
 * Used to inject all beans at time of construction.
 */
@FunctionalInterface
public interface Injector {

    /**
     * Inject an entity bean.
     *
     * @param entity Entity bean to inject
     */
    void inject(Object entity);
}
```

An implementation of this interface can be passed to the `EntityDictionary` during its construction:

```java
        EntityDictionary dictionary = new EntityDictionary(PermissionExpressions.getExpressions(),
                (obj) -> injector.inject(obj));
```

If you're using the `elide-spring-boot*` artifacts, dependency injection is already setup using Spring.
If you're using the `elide-standalone` artifact, dependency injection is already setup using Jetty's `ServiceLocator`.

## Validation

Data models can be validated using [bean validation](http://beanvalidation.org/1.0/spec/).  This requires
*JSR303* data model annotations and wiring in a bean validator in the `DataStore`.

## Type Coercion

Type coercion between the API and underlying data model has common support across JSON-API and GraphQL and is covered [here](/pages/guide/v{{ page.version }}/09-clientapis.html#type-coercion).

## Inheritance

Elide supports two kinds of inheritance:
1. Non-entity inheritance via the JPA annotation `@MappedSuperclass`.
2. Entity inheritance via the JPA annotation `@Inheritance`.

Entity inheritance has a few caveats:
1. Only the `InheritanceType.JOINED` and `InheritanceType.SINGLE_TABLE` strategies are supported.
2. Entity relationships whose type is a superclass have different behavior in JSON-API and GraphQL:
   1. JSON-API will return the type and attributes of the subclass (as well as the super class).
   2. GraphQL will return the type and attributes of the superclass only.

## Philosophy

Data models are intended to be a _view_ on top of the [data store](/pages/guide/v{{ page.version }}/06-datatstores.html) or the set of data stores which support your Elide-based service. While other JPA-based workflows often encourage writing data models that exactly match the underlying schema of the data store, we propose a strategy of isolation on per-service basis. Namely, we recommend creating a data model that only supports precisely the bits of data you need from your underlying schema. Often times there will be no distinction when first building your systems. However, as your systems scale and you develop multiple services with overlapping data store requirements, isolation often serves as an effective tool to **reduce interdependency** among services and **maximize the separation of concern**. Overall, while models can correspond to your underlying data store schema as a one-to-one representation, it's not always strictly necessary and sometimes even undesirable.

As an example, let's consider a situation where you have two Elide-based microservices: one for your application backend and another for authentication (suppose account creation is performed out-of-band for this example). Assuming both of these rely on a common data store, they'll both likely want to recognize the same underlying _User_ table. However, it's quite likely that the authentication service will only ever require information about user **credentials** and the application service will likely only ever need user **metadata**. More concretely, you could have a system that looks like the following:

**Table schema:**
```
id
userName
password
firstName
lastName
```

**Authentication schema:**
```
id
userName
password
```

**Application schema:**
```
id
userName
firstName
lastName
```

While you could certainly just use the raw table schema directly (represented as a JPA-annotated data model) and reuse it across services, the point is that you may be over-exposing information in areas where you may not want to. In the case of the _User_ object, it's quite apparent that the application service should never be _capable_ of accidentally exposing a user's private credentials. By creating isolated views per-service on top of common data stores, you sacrifice a small bit of [DRY principles](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) for much better isolation and a more targeted service. Likewise, if the underlying table schema is updated with a new field that neither one of these services needs, neither service requires a rebuild and redeploy since the change is irrelevant to their function. 

**A note about microservices:** Another common technique to building microservices is for each service to have its own set of data stores entirely independent from other services (i.e. no shared overlap); these data stores are then synced by other services as necessary through a messaging bus. If your system architecture calls for such a model, it's quite likely you will follow the same pattern we have outlined here with _one key difference_: the underlying table schema for your _individual service's data store_ will likely be exactly the same as your service's model representing it. However, overall, the net effect is the same since only the relevant information delivered over the bus is stored in your service's schema. In fact, this model is arguably more robust in the sense that if one data store fails not all services necessarily fail.

