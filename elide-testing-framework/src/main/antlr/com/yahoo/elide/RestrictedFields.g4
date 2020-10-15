/*
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the Apache License, Version 2. Please see LICENSE.txt in the project root for terms.
 */
grammar RestrictedFields;

@header {
package com.yahoo.elide;
}

start
    : EOF
    | excluding_fields EOF
    | fields EOF
    ;

fields
    : LBRACKET ALL RBRACKET                             #ALL
    | TERM                                              #TERM
    | TERM COMMA fields                                 #TERM_LIST
    ;

excluding_fields
    : LBRACKET EXCLUDING RBRACKET fields
    ;

COMMA: ',';
LBRACKET: '[';
RBRACKET: ']';
WS: (' ' | '\t') -> channel(HIDDEN);

ALL: [Aa][Ll][Ll];
EXCLUDING: [Ee][Xx][Cc][Ll][Uu][Dd][Ii][Nn][Gg];
TERM: ALPHANUMERIC;

ALPHA: [a-zA-Z];
DIGIT: [0-9];
ALPHANUMERIC: ALPHA (DIGIT|ALPHA)*;
