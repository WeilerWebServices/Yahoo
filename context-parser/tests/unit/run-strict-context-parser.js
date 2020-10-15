/*
Copyright (c) 2015, Yahoo Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.

Authors: Nera Liu <neraliu@yahoo-inc.com>
         Albert Yu <albertyu@yahoo-inc.com>
         Adonis Fung <adon@yahoo-inc.com>
*/
(function () {

    require("mocha");
    var config = {
        enableInputPreProcessing: true,
        enableCanonicalization: true,
        enableVoidingIEConditionalComments: true
    };
    var expect = require("expect.js"),
        ContextParser = require("../../src/context-parser.js").Parser,
        contextParser = new ContextParser(config);

    describe('Input Stream Pre-processing Test', function(){
        it('\\r\\n treatment', function () {
            expect(contextParser.contextualize('\r\n')).to.equal('\n');
            expect(contextParser.contextualize('\r\r\r')).to.equal('\n\n\n');
        });
        it('control character \\x0B treatment', function () {
            expect(contextParser.contextualize('\x0B')).to.equal('\uFFFD');
        });
        it('unicode non-character U+1FFFF and U+1FFFE treatment', function () {
            expect(contextParser.contextualize('\uD83F\uDFFE')).to.equal('\uFFFD');  //U+1FFFE
            expect(contextParser.contextualize('\uD83F\uDFFF')).to.equal('\uFFFD');  //U+1FFFF
        });
    });

    describe('Voiding IE Conditional Comments Test', function(){
        it('<!--[if lt IE 9]> treatment', function () {
            var a = '<!--[if lt IE 9]><script src="javascripts/html5shiv.min.js"></script><![endif]-->',
                b = '<!--[if lt IE 9] ><script src="javascripts/html5shiv.min.js"></script><![endif]-->';
            expect(contextParser.contextualize(a)).to.equal(b);
        });
    });

    describe("HTML Partials", function() {
        it("Inherit internal states from last partial parsing ", function() {
            var html = ['<a href=', '{{url}}', '>hello</a>'],
                htmlStates1, htmlStates3;
                contextParser1 = new ContextParser(config);

            expect(contextParser1.contextualize(html[0])).to.equal('<a href=');
            // StateMachine.State.STATE_BEFORE_ATTRIBUTE_VALUE = 37;
            expect(contextParser1.getCurrentState()).to.equal(37);

            // hardcode STATE_ATTRIBUTE_VALUE_UNQUOTED
            contextParser1.setCurrentState(40);

            contextParser1.contextualize(html[2][0]);
            // confirm state switched to STATE_DATA
            expect(contextParser1.getCurrentState()).to.equal(1);

            expect(contextParser1.contextualize(html[2].slice(1))).to.equal('hello</a>');

        });

        it("bogus comment conversion", function() {
            expect(contextParser.contextualize('</>')).to.equal('<!--/-->');
            expect(contextParser.contextualize('<?>')).to.equal('<!--?-->');
            expect(contextParser.contextualize('<!>')).to.equal('<!--!-->');
            expect(contextParser.contextualize('<!->')).to.equal('<!--!--->');

            // the following does not require transforming into comment
            expect(contextParser.contextualize('<%>')).to.equal('&lt;%>');
            expect(contextParser.contextualize('<3>')).to.equal('&lt;3>');
        });

        it("bogus comment conversion skipped", function() {
            var contextParser = new ContextParser(config);

            var html = ['</', '>'];
            expect(contextParser.contextualize(html[0])).to.equal('</');
            expect(contextParser.contextualize(html[1])).to.equal('>');

            var html = ['<?', '?>'];
            expect(contextParser.contextualize(html[0])).to.equal('<!--?');
            expect(contextParser.contextualize(html[1])).to.equal('?-->');

            var html = ['<!', '>'];
            expect(contextParser.contextualize(html[0])).to.equal('<!--!');
            expect(contextParser.contextualize(html[1])).to.equal('-->');

            var html = ['<!-', '>'];
            expect(contextParser.contextualize(html[0])).to.equal('<!--!-');
            expect(contextParser.contextualize(html[1])).to.equal('-->');

            delete contextParser;
        });

        it("bogus comment attacks", function() {

            // https://html5sec.org/#91
            var html = [
                '<? foo="><script>alert(1)</script>">',
                '<! foo="><script>alert(1)</script>">',
                '</ foo="><script>alert(1)</script>">',
                '<? foo="><x foo=\'?><script>alert(1)</script>\'>">',
                '<! foo="[[[x]]"><x foo="]foo><script>alert(1)</script>">',
                '<% foo><x foo="%><script>alert(1)</script>">'
            ];

            expect(contextParser.contextualize(html[0])).to.equal('<!--? foo="--><script>alert(1)</script>">');
            expect(contextParser.contextualize(html[1])).to.equal('<!--! foo="--><script>alert(1)</script>">');
            expect(contextParser.contextualize(html[2])).to.equal('<!--/ foo="--><script>alert(1)</script>">');

            expect(contextParser.contextualize(html[3])).to.equal('<!--? foo="--><x foo=\'?><script>alert(1)</script>\'>">');
            expect(contextParser.contextualize(html[4])).to.equal('<!--! foo="[[[x]]"--><x foo="]foo><script>alert(1)</script>">');
            expect(contextParser.contextualize(html[5])).to.equal('&lt;% foo><x foo="%><script>alert(1)</script>">');
        });

        it("bogus comment conversion with two contextualize calls (listeners inherited)", function() {
            var html = ['<?yo', 'yo?>'];
            var contextParser = new ContextParser(config);
            expect(contextParser.contextualize(html[0])).to.equal('<!--?yo');
            expect(contextParser.contextualize(html[1])).to.equal('yo?-->');
            delete contextParser;
        });

        it("bogus comment conversion with forked ContextParser", function() {
            var html = ['<?yo', 'yo?>'];
            var contextParser = new ContextParser(config);
            expect(contextParser.contextualize(html[0])).to.equal('<!--?yo');

            var contextParser1 = contextParser.fork();
            expect(contextParser1.contextualize(html[1])).to.equal('yo?-->');
            delete contextParser, contextParser1;
        });
    });

    describe("Comment Precedence in RAWTEXT and RCDATA", function() {
        it("<% treatment", function() {
            expect(contextParser.contextualize('<style> <% </style> %> </style>')).to.equal('<style> &lt;% </style> %> </style>');
            expect(contextParser.contextualize('<textarea> <% </textarea> %> </textarea>')).to.equal('<textarea> &lt;% </textarea> %> </textarea>');
        });
        it("<! treatment", function() {
            expect(contextParser.contextualize('<style> <!-- </style> --> </style>')).to.equal('<style> &lt;!-- </style> --> </style>');
            expect(contextParser.contextualize('<textarea> <!-- </textarea> --> </textarea>')).to.equal('<textarea> &lt;!-- </textarea> --> </textarea>');
        });
    });

    describe("Parse Error Correction in DATA", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('\x00')).to.equal('\uFFFD');
        });
    });

    describe("Parse Error Correction in RCDATA", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<title>\x00</title>')).to.equal('<title>\uFFFD</title>');
        });
    });

    describe("Parse Error Correction in RAWTEXT", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<style>\x00</style>')).to.equal('<style>\uFFFD</style>');
        });
    });

    describe("Parse Error Correction in SCRIPT DATA", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<script>\x00</script>')).to.equal('<script>\uFFFD</script>');
        });
    });

    describe("Parse Error Correction in PLAINTEXT", function() {
        it("NULL treatment", function() {
            expect(new ContextParser(config).contextualize('<plaintext>\x00')).to.equal('<plaintext>\uFFFD');
        });
    });

    describe("Parse Error Correction in TAG OPEN", function() {
        it("QUESTION MARK treatment", function() {
            expect(contextParser.contextualize('abcd<?  ?>efgh')).to.equal('abcd<!--?  ?-->efgh');
        });
        it("ANYTHING ELSE treatment", function() {
            expect(contextParser.contextualize('abcd<\x00efgh')).to.equal('abcd&lt;\uFFFDefgh');
            expect(contextParser.contextualize('abcd<3<3<3efgh')).to.equal('abcd&lt;3&lt;3&lt;3efgh');
            expect(contextParser.contextualize('<<br>')).to.equal('&lt;<br>');
        });
    });

    describe("Parse Error Correction in END TAG OPEN", function() {
        it("GREATER-THAN SIGN treatment", function() {
            expect(contextParser.contextualize('abcd</>efgh')).to.equal('abcd<!--/-->efgh');
        });
        it("ANYTHING ELSE treatment", function() {
            expect(contextParser.contextualize('abcd</\x00div>efgh')).to.equal('abcd<!--/\uFFFDdiv-->efgh');
            expect(contextParser.contextualize('abcd</ div>efgh')).to.equal('abcd<!--/ div-->efgh');
        });
    });

    describe("Parse Error Correction in TAG NAME", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<b\x00r><b\x00r/>')).to.equal('<b\uFFFDr><b\uFFFDr/>');
        });
    });


    describe("Parse Error Correction in SCRIPT DATA ESCAPED", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<script><!-- \x00 --></script>')).to.equal('<script><!-- \uFFFD --></script>');
        });
    });

    describe("Parse Error Correction in SCRIPT DATA ESCAPED DASH", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<script><!-- -\x00 --></script>')).to.equal('<script><!-- -\uFFFD --></script>');
        });
    });

    describe("Parse Error Correction in SCRIPT DATA ESCAPED DASH DASH", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<script><!-- --\x00 --></script>')).to.equal('<script><!-- --\uFFFD --></script>');
        });
    });

    describe("Parse Error Correction in SCRIPT DATA DOUBLE ESCAPED", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<script><!-- <script>\x00 --></script>')).to.equal('<script><!-- <script>\uFFFD --></script>');
        });
    });

    describe("Parse Error Correction in SCRIPT DATA DOUBLE ESCAPED DASH", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<script><!-- <script> -\x00 --></script>')).to.equal('<script><!-- <script> -\uFFFD --></script>');
        });
    });

    describe("Parse Error Correction in SCRIPT DATA DOUBLE ESCAPED DASH DASH", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<script><!-- <script> --\x00 --></script>')).to.equal('<script><!-- <script> --\uFFFD --></script>');
        });
    });

    describe("Parse Error Correction in BEFORE ATTRIBUTE NAME", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<a \x00href="#">hello</a>')).to.equal('<a \uFFFDhref="#">hello</a>');
        });
        it("QUOTATION MARK treatment", function() {
            expect(contextParser.contextualize('<a "href="#">hello</a>')).to.equal('<a href="#">hello</a>');
            expect(contextParser.contextualize('<img src="x" "b>hello</b>')).to.equal('<img src="x" b>hello</b>');
            expect(contextParser.contextualize('<img src="x""b>hello</b>')).to.equal('<img src="x" b>hello</b>');
        });
        it("APOSTROPHE treatment", function() {
            expect(contextParser.contextualize('<a \'href="#">hello</a>')).to.equal('<a href="#">hello</a>');
            expect(contextParser.contextualize('<img src="x" \'b>hello</b>')).to.equal('<img src="x" b>hello</b>');
            expect(contextParser.contextualize('<img src="x"\'b>hello</b>')).to.equal('<img src="x" b>hello</b>');
        });
        it("LESS-THAN SIGN treatment", function() {
            expect(contextParser.contextualize('<a <href="#">hello</a>')).to.equal('<a href="#">hello</a>');
            expect(contextParser.contextualize('<img src="x" <b>hello</b>')).to.equal('<img src="x" b>hello</b>');
            expect(contextParser.contextualize('<img src="x"<b>hello</b>')).to.equal('<img src="x" b>hello</b>');
        });
        it("EQUALS SIGN treatment", function() {
            expect(contextParser.contextualize('<a =href="#">hello</a>')).to.equal('<a href="#">hello</a>');
            expect(contextParser.contextualize('<img src="x" =b>hello</b>')).to.equal('<img src="x" b>hello</b>');
            expect(contextParser.contextualize('<img src="x"=b>hello</b>')).to.equal('<img src="x" b>hello</b>');
        });
    });

    describe("Parse Error Correction in ATTRIBUTE NAME", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<a hre\x00f="#">hello</a>')).to.equal('<a hre\uFFFDf="#">hello</a>');
        });
        it("QUOTATION MARK treatment", function() {
            expect(contextParser.contextualize('<a href"="#">hello</a>')).to.equal('<a href="#">hello</a>');
            expect(contextParser.contextualize('<a href"="#">hello</a>')).to.equal('<a href="#">hello</a>');
        });
        it("APOSTROPHE treatment", function() {
            expect(contextParser.contextualize('<a href\'="#">hello</a>')).to.equal('<a href="#">hello</a>');
            expect(contextParser.contextualize('<a href\'="#">hello</a>')).to.equal('<a href="#">hello</a>');
        });
        it("LESS-THAN SIGN treatment", function() {
            expect(contextParser.contextualize('<a href<="#">hello</a>')).to.equal('<a href="#">hello</a>');
            expect(contextParser.contextualize('<a href<="#">hello</a>')).to.equal('<a href="#">hello</a>');
        });


        it("malicious attribute names using APOSTROPHE", function() {

            // https://html5sec.org/#62
            var html = [
                '<!-- IE 6-8 --><x \'="foo"><x foo=\'><img src=x onerror=alert(1)//\'>', 
                '<!-- IE 6-9 --><! \'="foo"><x foo=\'><img src=x onerror=alert(2)//\'>',
                '<!-- IE 6-9 --><? \'="foo"><x foo=\'><img src=x onerror=alert(3)//\'>'
            ];

            expect(contextParser.contextualize(html[0])).to.equal('<!-- IE 6-8 --><x foo><x foo=\'><img src=x onerror=alert(1)//\'>');
            expect(contextParser.contextualize(html[1])).to.equal('<!-- IE 6-9 --><!--! \'="foo"--><x foo=\'><img src=x onerror=alert(2)//\'>');
            expect(contextParser.contextualize(html[2])).to.equal('<!-- IE 6-9 --><!--? \'="foo"--><x foo=\'><img src=x onerror=alert(3)//\'>');
        });
    });

    describe("Parse Error Correction in AFTER ATTRIBUTE NAME", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<a href \x00="#">hello</a>')).to.equal('<a href \uFFFD="#">hello</a>');
        });
        it("QUOTATION MARK treatment", function() {
            expect(contextParser.contextualize('<a href "="#">hello</a>')).to.equal('<a href ="#">hello</a>');
        });
        it("APOSTROPHE treatment", function() {
            expect(contextParser.contextualize('<a href \'="#">hello</a>')).to.equal('<a href ="#">hello</a>');
        });
        it("LESS-THAN SIGN treatment", function() {
            expect(contextParser.contextualize('<a href <="#">hello</a>')).to.equal('<a href ="#">hello</a>');
        });
    });

    describe("Parse Error Correction in BEFORE ATTRIBUTE VALUE", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<a href=\x00x>hello</a>')).to.equal('<a href=\uFFFDx>hello</a>');
        });
        it("GREATER-THAN SIGN treatment", function() {
            expect(contextParser.contextualize('<a href=>hello</a>')).to.equal('<a href>hello</a>');
        });
        it("LESS-THAN SIGN treatment", function() {
            expect(contextParser.contextualize('<a href=<x>hello</a>')).to.equal('<a href=&lt;x>hello</a>');
            expect(contextParser.contextualize('<a href=<>hello</a>')).to.equal('<a href=&lt;>hello</a>');
        });
        it("EQUALS SIGN treatment", function() {
            expect(contextParser.contextualize('<a href==x>hello</a>')).to.equal('<a href=&#61;x>hello</a>');
            expect(contextParser.contextualize('<a href==>hello</a>')).to.equal('<a href=&#61;>hello</a>');
        });
        it("GRAVE ACCENT treatment", function() {
            expect(contextParser.contextualize('<a href=`x`>hello</a>')).to.equal('<a href=&#96;x&#96;>hello</a>');
            expect(contextParser.contextualize('<a href=`>hello</a>')).to.equal('<a href=&#96;>hello</a>');
        });
    });

    describe("Parse Error Correction in ATTRIBUTE VALUE (DOUBLE-QUOTED)", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<a href="\x00">hello</a>')).to.equal('<a href="\uFFFD">hello</a>');
        });
    });

    describe("Parse Error Correction in ATTRIBUTE VALUE (SINGLE-QUOTED)", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<a href=\'\x00\'>hello</a>')).to.equal('<a href=\'\uFFFD\'>hello</a>');
        });
    });

    describe("Parse Error Correction in ATTRIBUTE VALUE (UNQUOTED)", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<a href=x\x00>hello</a>')).to.equal('<a href=x\uFFFD>hello</a>');
        });
        it("QUOTATION MARK treatment", function() {
            expect(contextParser.contextualize('<a href=x">hello</a>')).to.equal('<a href=x&quot;>hello</a>');
        });
        it("APOSTROPHE treatment", function() {
            expect(contextParser.contextualize('<a href=x\'>hello</a>')).to.equal('<a href=x&#39;>hello</a>');
        });
        it("LESS-THAN SIGN treatment", function() {
            expect(contextParser.contextualize('<a href=x<>hello</a>')).to.equal('<a href=x&lt;>hello</a>');
            expect(contextParser.contextualize('<a href=<>hello</a>')).to.equal('<a href=&lt;>hello</a>');
        });
        it("EQUALS SIGN treatment", function() {
            expect(contextParser.contextualize('<a href=x=>hello</a>')).to.equal('<a href=x&#61;>hello</a>');
            expect(contextParser.contextualize('<a href==>hello</a>')).to.equal('<a href=&#61;>hello</a>');
        });
        it("GRAVE ACCENT treatment", function() {
            expect(contextParser.contextualize('<a href=x`>hello</a>')).to.equal('<a href=x&#96;>hello</a>');
            expect(contextParser.contextualize('<a href=`>hello</a>')).to.equal('<a href=&#96;>hello</a>');
        });
    });

    describe("Parse Error Correction in AFTER ATTRIBUTE VALUE (QUOTED)", function() {
        it("ANYTHING ELSE treatment", function() {
            expect(contextParser.contextualize('<img src="x" onclick=""/>')).to.equal('<img src="x" onclick=""/>');
            expect(contextParser.contextualize('<img src="x"onclick=""/>')).to.equal('<img src="x" onclick=""/>');
        });
    });

    describe("Parse Error Correction in SELF-CLOSING START TAG", function() {
        it("ANYTHING ELSE treatment", function() {
            expect(contextParser.contextualize('<br/ onclick="">')).to.equal('<br  onclick="">');
            expect(contextParser.contextualize('<br/onclick="">')).to.equal('<br onclick="">');

            expect(contextParser.contextualize('<br /onclick="">')).to.equal('<br  onclick="">');
            expect(contextParser.contextualize('<br oncl/ick="">')).to.equal('<br oncl ick="">');
            expect(contextParser.contextualize('<br onclick /="">')).to.equal('<br onclick  >');
            expect(contextParser.contextualize('<br onclick/="alert(1)">')).to.equal('<br onclick alert(1)>');
            expect(contextParser.contextualize('<br onclick /="alert(1)">')).to.equal('<br onclick  alert(1)>');
        });
    });

    describe("Parse Error Correction in MARKUP DECLARATION OPEN", function() {
        it("doctype treatment", function() {
            expect(contextParser.contextualize('<!doctype html>')).to.equal('<!doctype html>');
            expect(contextParser.contextualize('<!doctype html5>')).to.equal('<!--!doctype html5--><!doctype html>');
            expect(contextParser.contextualize('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">'))
                .to.equal('<!--!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"--><!doctype html>');
        });
        it("[CDATA[ treatment", function() {
            expect(contextParser.contextualize('<math><ms><![CDATA[x<y]]></ms></math>')).to.equal('<math><ms><![CDATA[x<y]]></ms></math>');
        });
        it("standard comment treatment", function() {
            expect(contextParser.contextualize('<!--hello-->')).to.equal('<!--hello-->');
        });
    });

    describe("Parse Error Correction in COMMENT START", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<!--\x00-->')).to.equal('<!--\uFFFD-->');
        });
        it("GREATER-THAN SIGN treatment", function() {
            expect(contextParser.contextualize('<!-->')).to.equal('<!---->');
        });
    });

    describe("Parse Error Correction in COMMENT START DASH", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<!---\x00-->')).to.equal('<!---\uFFFD-->');
        });
        it("GREATER-THAN SIGN treatment", function() {
            expect(contextParser.contextualize('<!--->')).to.equal('<!---->');
        });

    });

    describe("Parse Error Correction in COMMENT", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<!-- \x00-->')).to.equal('<!-- \uFFFD-->');
        });
    });

    describe("Parse Error Correction in COMMENT END DASH", function() {
        it("NULL treatment", function() {
            // expect(contextParser.contextualize('<!---\x00->')).to.equal('<!---\uFFFD->');
            expect(contextParser.contextualize('<!---\x00>-->')).to.equal('<!---\uFFFD>-->');
        });
    });

    describe("Parse Error Correction in COMMENT END", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<!----\x00>-->')).to.equal('<!----\uFFFD>-->');
        });
        it("EXCLAMATION MARK treatment", function() {
            expect(contextParser.contextualize('<!--abc--!>')).to.equal('<!--abc-->');
            expect(contextParser.contextualize('<!--abc--!-->')).to.equal('<!--abc--!-->');
            expect(contextParser.contextualize('<!--abc--! -->')).to.equal('<!--abc--! -->');
            expect(contextParser.contextualize('<!--abc--! --!>')).to.equal('<!--abc--! -->');
        });
        it("HYPHEN-MINUS treatment", function() {
            expect(contextParser.contextualize('<!--abc--->')).to.equal('<!--abc--->');
        });
        it("ANYTHING ELSE treatment", function() {
            expect(contextParser.contextualize('<!--abc--a-->')).to.equal('<!--abc--a-->');
        });
    });

    describe("Parse Error Correction in COMMENT END BANG", function() {
        it("NULL treatment", function() {
            expect(contextParser.contextualize('<!----!\x00>-->')).to.equal('<!----!\uFFFD>-->');
        });
    });

}());
