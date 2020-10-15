/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
grammar IdList;

@header {
package com.yahoo.elide;
}

start
    : EOF                                                               #EOF
    | LBRACKET ALL RBRACKET EOF                                         #ALL
    | entityIds EOF                                                     #IDList
    ;

entityIds
    : entityId                                                          #ID
    | entityId COMMA entityIds                                          #ListWithID
    | LBRACKET type=NAME DOT collection=NAME RBRACKET                   #Subcollection
    | LBRACKET type=NAME DOT collection=NAME RBRACKET COMMA entityIds   #SubcollectionWithList
    ;

entityId : (TERM|NAME);

ALL: [Aa][Ll][Ll];

DOT: '.';
COMMA: ',';
LBRACKET: '[';
RBRACKET: ']';
WS: (' ' | '\t') -> channel(HIDDEN);

NAME: ALPHA ALPHANUMERIC;
TERM: ALPHANUMERIC;

ALPHA: [a-zA-Z];
DIGIT: [0-9];
ALPHANUMERIC: (DIGIT|ALPHA)+;
