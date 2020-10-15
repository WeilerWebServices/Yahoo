#Overview
Exhaustive testing of an API for a web service with a hierarchical data model has always been a challenge for developers 
and testers. There are more negative test cases than positive ones. The negative tests can broadly be classified into 
one of the following categories:

* Invalid Endpoints: The scope of tests in this category is to verify invalid URL combinations with HTTP 404 responses.  
  This includes verifying entities which should not be exposed (implicitly or explicitly excluded from railsplitter) 
  remain hidden.
* Valid but unauthorized endpoints: The scope of these tests is to verify security of the web service (i.e the URL is 
  valid but the user accessing the URL is unauthorized to do so). The requests usually return with HTTP 403 responses.

Positive tests coverage ideally should exhaust all valid endpoints for all CRUD operations for all user roles.

The Railsplitter testing framework automates this process by requiring an alternate declaration of the same security 
policy that has already been defined by the railsplitter annotations.  Similar to entering a password twice for a login 
page, declaring the same policy in two different ways and then verifying the results match significantly reduces the 
likelihood of human error.  The test framework requires the railsplitter library, a data store with test data, and a 
configuration file.  Using this configuration file, the test framework can generate JSON API CRUD requests that 
completely explore every row in every table in the test data store for positive as well as negative test cases.

#Configuration

```
    Given exposed entities
      | EntityName    | Rootable |
      | company       | true     |
      | user          | true     |
      | pulseCompany  | true     |
      | project       | false    |
      ...

    And Users
      | superuser |

    #The 'Valid Ids List' is the complete list of IDs in the test data store that the particular user can access.
    #There should be a single row per 'EntityName' and 'UserName'.
    #Rows are only needed for entities with explicit permission checks.  
    And associated permissions
      | EntityName                        | UserName  | Valid Ids List | Entity Permissions | Restricted Read Fields | Restricted Write Fields |
      | company                           | superuser | 1              | C,R,U,D            |                        |                         |
      | projects                          | superuser | 16,14          | C,R,U,D            |                        |                         |
      | user                              | superuser | 1              | C,R,U,D            | password               |                         |

```

#Classes

##Type Definitions

The following classes are aliases to Java primitive types or enums:

| Class             | Java Primitive / Enum | Description |
| ----------------- | ----------------------| ----------- |
| ID                | String                | Represents an entity ID |
| Field             | String                | Represents an entity attribute |
| Permission        | Enum                  | CREATE, READ, UPDATE, DELETE | 
| EntityName        | String                | The name/type of an entity |
| User              | Object                | The user principle |
| UserAlias         | String                | The configuration friendly name for a user role |
| URL               | String                | A JSON API URL | 
| TestType          | Enum                  | POSITIVE_TEST, NEGATIVE_TEST_UNAUHORIZED, NEGATIVE_TEST_NOT_FOUND |
| RelationshipName  | String                | Represents name of a relationship |

##User Classes

###UserProfile

Represents a class of users or role that share the same set of permissions.

```
public class UserProfile {
    /** 
     * Created by passing the user profile name into the UserFactory
     */
    private final User user;

    /**
     * Maps the entity name to a set of of security restrictions.
     * This is built from the test framework configuration.
     */
    private final Map<EntityName, EntityConfiguration> entityConfigurations

    ...
}
```
###EntityConfiguration

Represents the permission restrictions for a given user profile for a given entity.
Everything in this class comes directly from the configuration file.

```
public class EntityConfiguration {
    private final EntityName entity;
    private final Map<Permission, List<ID>> permissibleIds;
    private final List<Field> cannotRead;
    private final List<Field> cannotWrite;
}

```

###UserFactory

This interface is supplied to the test framework during initialization.  It is used to generate
a user principle given an alias for a `UserProfile`.

```
public interface UserFactory {
    User makeUser(UserAlias alias);
}
```

##Graph Classes

We need a number of classes to represent the directed acyclic graph (DAG) of collections (tables) and entities (rows) 
in the test data store. Nodes in this graph are either collections of entities or individual entities.  Edges between nodes represent either:

1. Relationships (An entity connected to another entity or collection of other entities)
2. Entity Identifier (An entity collection connected to a specific instance inside the collection)

We also need a way to walk the DAG to execute different algorithms on the graph.  The [visitor pattern](https://en.wikipedia.org/wiki/Visitor_pattern) 
is leveraged for this purpose.

###Visitable
Something which can be visited by a visitor.  Visitables will be the nodes in the graph and the graph itself.

```
public interface Visitable {
    /**
     * Generally traverses the graph calling accept on visitables on visit on itself.  See wikipedia!
     */
    public void accept(Visitor visitor);
}
```

###GraphNode 

Represents a node in the graph.

```
public abstract class GraphNode implements Visitable
    /**
     * The path taken to visit this graph node 
     */
    private final List<GraphNode> lineage;

    /**
     * Converts this node's lineage to a JSON API URL.
     */
    public URL generateURL() { ... }

    /**
     * Needed for visitables. 
     */
    @Override
    public abstract void accept(Visitor visitor);
}
```
###EntityCollection

A collection of entities and also a GraphNode.  The collection could represent a root collection or a collection hanging 
off a relationship. To-one relationships are still modeled as a collection of one element.

```
public class EntityCollection extends GraphNode {
    private final EntityName fieldNameForCollection;

    /**
     * The complete list of entities (indexed by ID) that are accessible from this collection.
     */
    private final Map<ID, Entity> entities;

    @Override
    /**
     * Calls accept on each entity in the collection.  Calls visit on itself.
     */
    public void accept(Visitor visitor) { ... }
}
```
###Entity

An inidvidual entity instance and also a GraphNode.  The object is constructed from the JSON API representation fetched
from the test elide/data store.

```
public class Entity extends GraphNode {
    private final ID id;


    /**
     * Stores each relationship sucked out of the JSON API encoding of the entity.
     */
    private final Map<Field, JsonNode> relationships;

    /**
     * Stores each attribute sucked out of the JSON API encoding of the entity.
     */
    private final Map<Field, JsonNode> attributes;

    /**
     * Stores the entire JSON API encoding of the entity as a string.
     */
    private final String serializedForm;

    /**
     * Stores the entire JSON API encoding of the entity as a json node.
     */
    private final JsonNode jsonForm;

    /**
     * The names of the relationships which are not exposed via JSON API.
     */
    List<RelationshipName> hiddenRelationships

    /**
     * The edges from this GraphNode to the relationship collections.
     */
    Map<RelationshipName, EntityCollection> collections;

    /**
     * Calls accept on each relationship (EntityCollection) in the entity.  Calls visit on itself.
     */
    @Override
    public void accept(Visitor visitor) { ... } 
}
```

###EntityGraph

Stores the root nodes of the directed acyclic graph.

```
public class EntityGraph implements Visitable
    private final List<EntityCollection> rootCollections;

    /**
     * Calls accept on each root collection (EntityCollection).  
     */
    @Override
    public void accept(Visitor visitor) { ... } 
```

## Visitor Classes
These classes are concrete implementations of visitor from the visitor pattern.  
We'll use these to generate the test plan and to print/dump the test data store.

### Visitor

```
public interface Visitor<T> {
    public T visitEntity(Entity entity);
    public T visitEntityCollection(EntityCollection collection);
    public T visitEntityGraph(EntityGraph graph);
}
```

### PrintGraphVisitor

Prints the graph to the screen in a format like TBD

```
public class PrintGraphVisitor implements Visitor<String> {
    @Override
    public String visitEntity(Entity entity) { ... }
    @Override
    public String visitEntityCollection(EntityCollection collection) { ... }
    @Override
    public String visitEntityGraph(EntityGraph graph) { ... }

}
```

### GenerateTestPlanVisitor

Generates a TestPlan by walking the directed acyclic graph that represents the test data store.

```
public class GenerateTestPlanVisitor implements Visitor<TestPlan> {
    /**
     * What the visitor builds
     */
    private TestPlan plan;
    
    /**
     * Generates the following tests:
     *  - ReadEntityTest
     *  - DeleteEntityTest
     *  - UpdateEntityAttributeTest
     *  - UpdateEntityRelationshipTest
     *  - CreateRelationshipTest
     *  - ReadRelationshipTest
     *  - UpdateRelationshipTest
     *  - DeleteRelationshipTest
     *  - HiddenRelationshipTest
     */
    @Override
    public TestPlan visitEntity(Entity entity) { ... }

    /**
     * Generates the following tests:
     *  - ReadCollectionTest
     *  - CreateEntityTest
     */
    @Override
    public TestPlan visitEntityCollection(EntityCollection collection) { ... }

    /**
     * Generates the following tests:
     *  - HiddenRootCollectionTest
     */
    @Override
    public String visitEntityGraph(EntityGraph graph) { ... }

}
```

## Test Classes

The following classes are related to tests that are generated by the framework

### Test
A test which gets executed.

```
public abstract class Test {
    /** Runs the test.  Returns true if it passes and false otherwise. */
    public abstract boolean execute();

    /**
     * Prints details about the test for both displaying the full test plan and also
     * listing which tests failed and why.  It should include the URL, request, & response.
     */    
    @Override
    public String toString() { ... }
}
```

### TestPlan
A list of tests to execute

```
public class TestPlan {
    /** 
     * Which tests to run 
     */
    public List<Test> toExecute;

    /**
     * Prints the entire test plan.
     */    
    @Override
    public String toString() { ... }

    /**
     * Runs the test plan and returns a list of tests which failed.
     */
    public List<Test> execute() { ... }
}
```

### Concrete Test Classes

The following classes are constructed with:

1. An Elide instance
2. A UserProfile object
3. A GraphNode (Entity or EntityCollection)
4. A TestType
5. Other parameters needed for the specific test

In their execute methods, they:

1. Construct a JSON API request
2. Send it to elide
3. Validate the response

| Class                         | Description |
| ----------------------------- | ----------- |
| CreateEntityTest              | Creates an individual entity. |
| ReadEntityTest                | Reads an individual entity.  Verifies restricted fields are not present. |
| UpdateEntityAttributeTest     | Updates an **individual attribute** in an entity | 
| UpdateEntityRelationshipTest  | Updates an **individual relationship** in an entity | 
| DeleteEntityTest              | Deletes an individual entity. |
| ReadCollectionTest            | Reads an entire collection. Verifies restricted elements are not present. |
| CreateRelationshipTest        | Tests appending relationship objects to an individual entity relationship |
| ReadRelationshipTest          | Tests reading relationship objects from an individual entity relationship.  Verifies restricted fields are not present. |
| UpdateRelationshipTest        | Replaces the list of relationships on an individual entity relationship. |
| DeleteRelationshipTest        | Deletes a list of relationship objects from an individual entity relationship. |
| HiddenRelationshipTest        | Tests an invalid URL which includes a relationship which was excluded (implicitly or explicitly) in elide |
| HiddenRootCollectionTest      | Tests an invalid URL which includes a root collection which was excluded (implicitly or explicitly) in elide |

## Framework Classes

The following classes are the main entry points to the test framework.

### ReadOnlyHibernateManager

Extends HibernateManager by returning a Transaction where all write operations (save, delete, commit) are NOP operations.
The purpose of this class is to bypass hibernate validation and prevent cascading of deletes which would corrupt the test database
and break test isolation.

```
public class ReadOnlyHibernateManager extends HibernateManager {
    @Override
     public DatabaseTransaction beginTransaction() { ... }
}
```

### TestDriver

This is the main entry point to the framework.  It initializes `Elide` with a `ReadOnlyHibernateManager`
and constructs an `EntityGraph` using the `EntityDictionary` and `Elide`.

It then constructs a `GenerateTestPlanVisitor` and passes it to the `EntityGraph` to construct the `TestPlan`.

Finally it executes the `TestPlan`.  TestDriver will take command line arguments to:

1. Simply print the test plan but not execute it
2. Dump the test database to standard out
3. Execute the test plan  

# Algorithms

## Generating the test plan 

The test plan generation happens inside the `GenerateTestPlanVisitor` visit functions.  

Here is some pseudocode:

```
@Override
public TestPlan visitEntityCollection(EntityCollection collection) { 
    if (user.getPermissibleIds() is empty) { //There are no restrictions on this collection
        allowed_ids = collection.getIds()
        disallowed_ids = empty set
    } else {
        allowed_ids = collection.getIds() intersect user.getPermissibleIds(collection.fieldNameForCollection)
        disallowed_ids = collection.getIds() minus user.getPermissibleIds(collection.fieldNameForCollection)
    }
    invalid_id = max(collection.getIds()) + 1

    generateReadCollectionTests(collection, allowed_ids);
    generateCreateEntityTests(collection, allowed_ids, disallowed_ids, invalid_id);

    return testPlan;
}

private void generateCreateEntityTests(collection, allowed_ids, disallowed_ids, invalid_id) {
    for (ID id : allowed_ids) {
        Entity entity = collection.getEntity(id)
        Test test = new CreateEntityTest(railspliter, user, entity, POSITIVE_TEST);
        testPlan.add(test)
    }

    for (ID id : disallowed_ids) {
        Entity entity = collection.getEntity(id)
        Test test = new CreateEntityTest(railspliter, user, entity, NEGATIVE_TEST_UNAUTHORIZED);
        testPlan.add(test)
    }

    //getInvalidEntity would clone a valid entity in the collection and then set the ID to the invalid ID.
    Entity invalid = collection.getInvalidEntity(invalid_id)

    Test test = new CreateEntityTest(railspliter, user, invalid, NEGATIVE_TEST_NOT_FOUND);
    TestPlan.add(test)
}

private void generateReadCollectionTests(collection, allowed_ids) {
    Test test = new ReadCollectionTest(elide, user, allowed_ids, POSITIVE_TEST);
    TestPlan.add(test)
}


private void generateUpdateEntityTests(allowedAttributes, allowdRelationships, disallowedAttributes, disallowedRelationships) {
    for (AttributeName attributeName : allowedAttributes) {
        JsonNode attributeValue = entity.getAttributeValue(attributeName);
        Test test = new UpdateEntityAttributeTest(railspliter, user, entity, attributeName, attributeValue, POSITIVE_TEST);
        testPlan.add(test)
    }
    for (AttributeName attributeName : disallowedAttributes) {
        JsonNode attributeValue = entity.getAttributeValue(attributeName);
        Test test = new UpdateEntityAttributeTest(railspliter, user, entity, attributeName, attributeValue, NEGATIVE_TEST_UNAUTHORIZED);
        testPlan.add(test)
    }
    ... Do the same for relationships ...
}
```

## Example Read Test

```
boolean execute() {
    URL = entity.generateURL();
    response = elide.get(URL, userProfile.getUser());
    if (type == POSITIVE_TEST) {
        return (response.status == 200) && (response.body == entity.serializedForm)
    } else if (type == NEGATIVE_TEST_UNAUTHORIZED) {
        return (response.status == 403)
    } else {
        return (response.status == 404)
    }
}
```

## Example Update Attribute Test

```
boolean execute() {
    body = stripAttributes(entity.getJsonForm());
    body = addAttribute(engity.getJsonForm(), attributeValue);
    URL = entity.generateURL();
    response = elide.patch(URL, body, userProfile.getUser());
    if (type == POSITIVE_TEST) {
        return (response.status == 200)
    } else if (type == NEGATIVE_TEST_UNAUTHORIZED) {
        return (response.status == 403)
    } else {
        return (response.status == 404)
    }
}
```

