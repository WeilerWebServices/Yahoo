Feature: Railsplitter Beans Security Testing

  Scenario: Accessing Child Node

    Given exposed entities
      | EntityName    | Rootable |
      | parent        | true     |
      | child         | false    |

    And users
      # Amalberti father
      | Emmanuel |
      # Bonham parents
      | Mo       |
      | Margery  |
      # Tang parents
      | Goran    |
      | Hina     |

    And aliases
      | Mo                  | 1 |
      | Margery             | 2 |
      | Mo's Spouse         | Margery |
      | Margery's Spouse    | Mo |
      | Margery's Ex        | Emmanuel |
      | Emmanuel            | 3 |
      | Emmanuel's Ex       | Margery |
      | Goran               | 4 |
      | Goran's Spouse      | Hina |
      | Hina                | 5 |
      | Hina's Spouse       | Goran |
      | Bonham Children     | 1,2 |
      | Amalberti Children  | 3,4 |
      | Tang Children       | 5 |

    And associated permissions
      | UserName  | EntityName | ValidIdsList            | EntityPermissions         | RestrictedReadFields  | RestrictedWriteFields |
       ########### ############ ##############            ########################### ####################### #######################
      | Mo        | parent     | Mo                      | Create,Read,Update        |                       | deceased              |
      | Mo        | parent     | Mo's Spouse             | Create,Read,Update        | otherSpouses          | deceased              |
      | Mo        | parent     | Emmanuel,Goran,Hina     | Read,Update               | otherSpouses          | [EXCLUDING] friends |
      | Mo        | child      | Bonham Children         | Create,Read,Update,Delete |                       | deceased              |
      | Mo        | child      | Amalberti Children      | Read,Update               |                       | deceased,firstName,lastName,age,parents |

      | Margery   | parent     | Margery                 | Create,Read,Update        |                       | deceased              |
      | Margery   | parent     | Margery's Spouse        | Create,Read,Update        | otherSpouses          | deceased              |
      | Margery   | parent     | Margery's Ex            | Read,Update               |                       | deceased,firstName,lastName,age,children,spouse |
      | Margery   | parent     | Goran,Hina              | Read,Update               | otherSpouses          | deceased,firstName,lastName,age,children,spouse |
      | Margery   | child      | Bonham Children         | Create,Read,Update,Delete |                       | deceased              |
      | Margery   | child      | Amalberti Children      | Read,Update               |                       | deceased,firstName,lastName,age,parents |

      | Emmanuel  | parent     | Emmanuel                | Create,Read,Update        |                       | deceased              |
      | Emmanuel  | parent     | Emmanuel's Ex           | Read,Update               |                       | deceased,firstName,lastName,age,children,spouse |
      | Emmanuel  | parent     | Mo,Goran,Hina           | Read,Update               | otherSpouses          | deceased,firstName,lastName,age,children,spouse |
      | Emmanuel  | child      | Amalberti Children      | Create,Read,Update,Delete |                       | deceased              |
      | Emmanuel  | child      | Bonham Children,Tang Children | Read,Update         |                       | deceased,firstName,lastName,age,parents |

      | Goran     | parent     | Goran                   | Create,Read,Update        |                       | deceased              |
      | Goran     | parent     | Goran's Spouse          | Create,Read,Update        | otherSpouses          | deceased              |
      | Goran     | parent     | Mo,Margery,Emmanuel     | Read,Update               | otherSpouses          | deceased,firstName,lastName,age,children,spouse |
      | Goran     | child      | Tang Children           | Create,Read,Update,Delete |                       | deceased              |
      | Goran     | child      | Amalberti Children      | Read,Update               |                       | deceased,firstName,lastName,age,parents |

      | Hina      | parent     | Hina                    | Create,Read,Update        |                       | deceased              |
      | Hina      | parent     | Hina's Spouse           | Create,Read,Update        | otherSpouses          | deceased              |
      | Hina      | parent     | Mo,Margery,Emmanuel     | Read,Update               | otherSpouses          | deceased,firstName,lastName,age,children,spouse |
      | Hina      | child      | Tang Children           | Create,Read,Update,Delete |                       | deceased              |
      | Hina      | child      | Amalberti Children      | Read,Update               |                       | deceased,firstName,lastName,age,parents |

    And disabled test ids
      # these tests are outside the scope of the validation framework because
      # the underlying data that drives their creation cannot be recreated using
      # the Elide security that is in place.
      #
      # In this particular case creating these relationships appears to be permissible,
      # though it is actually forbidden, because the relationships we are trying to create
      # already exist. (JSON API specifies that a relationship create succeeds if either
      # the data can be added to the relationship, or the data already is in the
      # relationship-which is the case here)
      #
      # Real world use cases:
      #   * legacy data that is valid but can no longer be produced via the API
      #   * complex permission logic (such as transactional or path specific logic)
      #     that cannot be verified with the framework and may produce erroneous validations
      | CreateRelation:child#4/relationships/playmates:Denied=[1,2] |

    Then send data to the Validation Driver
