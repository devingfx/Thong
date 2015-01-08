Simple JavaScript Templating for both nodejs and browsers - Thomas Di Grégorio
https://bitbucket.org/tdigregorio/tmpl/src - derived from
JavaScript micro templating - Jhon Resig - MIT Licensed
http://ejohn.org/blog/javascript-micro-templating/


# tmpl - Simple templating

tmpl is a portage and optimization of the great JavaScript micro templating from
Jhon Resig (http://ejohn.org/blog/javascript-micro-templating/).
First the code is made to be loaded both in browser via a <script> tag or in 
nodejs via require.
Second the templating rules have been exported into a rules array to let 
developpers create their own rules.


## Install

To use tmpl you have to load tmpl itself, plus some template rules. Some rules 
sets are bundled in the tmpl repo to help people understanding the rules syntax.

Pre made rules sets are:

- jstag (src/tmpl.x-tmpl-jstag.js) : Rules looking like `Hello <:varName/>`
- jresig (src/tmpl.x-tmpl-jresig.js) : The original rules from John Resig's blog post, looking like 
                                       `Hello <%=varName%>`
- php-like (src/tmpl.x-php-like.js) : Rules looking like php's : `Hello <?=varName?>`
- tjs (src/tmpl.x-tmpl-tjs.js) : Rules looking like tjs, looks like `Hello {{=varName}}`

Or you create your ow rules (see Add a templating rule section).

	<script src="js/tmpl.js"></script>
	<script src="js/tmpl.x-tmpl-jresig.js"></script>
	<script src="js/tmpl.x-tmpl-jstag.js"></script>

You can load several rules sets if needed, the rules will be store separately so
you'll be able to use the ones needed for each templates you wrote.

## Declare one rules set as default one

You can say to tmpl to use one rules set as the default one, to avoid giving the 
name each time you create a template function.

	tmpl.defaultRules = 'x-tmpl-jstag';

This is especially usefull if you loaded only one rules set.

## Usage

Use the tmpl function to generate a templating function. A templating function 
will take an Object as argument and return a string. You have to specify wich 
rules set to use for this template string:

	var greet = tmpl( "Some text and <%=thing%>!", 'x-tmpl-jresig' );

The references in template tokens resolves to the properties of the Object 
given as argument to the templating function.

	myDiv.innerText = greet( { thing: 'that\'s it' } );

You can also chain the calls to tmpl and the templating function directly if the
resulting template function is needed only 1 time:

	myDiv.innerHTML = tmpl( "Some text and <:thing/>!" )( { thing: 'that\'s it' } );

(notice the lack of rules sets name as a default one has been set)

This syntax is not optimized if the template have to be resolved several times 
(like in a for loop), because the parsing of rules and template function 
creation are executed each time. You better have to save the templating function
in a variable (like a global one) and use it against your data each time needed.

Tips: 
- You can write a multiline string in javascript using the backslash (\\) hack:

	var myArticleTpl = tmpl( 
							'<article class="catalog-item cat-<:category.id/>">\
								<span class="title"><:title/></span>\
							</article>'
							);

Using this syntax is correct in javascript cause you escaped the newline char so
the javascript virtual machine wont save this unknown char in the string. The 
caveat is that the newline chars are lost. If you need to the newline chars to 
be present in the final string you'll have explicitly write it:

	var myArticleTpl = tmpl( 
							'<article class="catalog-item cat-<:category.id/>">\n\
								<span class="title"><:title/></span>\n\
							</article>'
							);

- You can access global objects in the template tokens has you will in a normal 
function:

	window.admin = true;
	var myArticleTpl = tmpl( 
							'<article class="catalog-item cat-<:category.id/>">\
								<span class="title"><:title/></span>\
								<admin?>\
									<button class="editor">Edit</button>\
								</if>\
							</article>'
							);
	
	myDiv.innerHTML = myArticlesDatas.map( myArticleTpl ).join('');  // Notice Array.map usage here












## Add a templating rule

Simply add to the `tmpl.rules` Array a hash with 's' (search) and 'r' (replace) props :

	var rule = {s:<RegExp>, r:<string or function>};
	tmpl.rules.push(rule);

A rule consist in a RegExp that will be used in a String.replace to replace by the replace value.
The replace string will be part of the final function code generated, so you are in a middle of 
a javacript string declaration named 'o' ex : `var o = "<result of template here>"; return o;`
So imagine your template is `"Doctor @who@ ?"` the function code without any replacement
will be: `var o = "Doctor @who@ !"; return o;`
Now we want the code to access some variable after our rule is replaced.
ex: the js code will be: `var o = "Doctor " + (who) + " !"; return o;`

Exemple: Find a var tag of form 'text @varname@ text' and replace by the value.

	{
		s: /@(.*?)@/g , 	// Search char '@' then capture everything until another '@' (don't forget the global modifier /./g)
		r: '" + ($1) + "'	// Now after our rule is replaced the js code will be: var o = "Doctor " + (who) + " !"; return o;
	}

A more complex ex now! 
Imagine a conditional block of form 'lorem @IF::expression@ ipsum @STOP::IF dolor sit amet' ,
we need 2 rules: 1 for opening tag and one for the closing one.

Here the code without replacement will be: `var o = "lorem @IF::expression@ ipsum @STOP::IF dolor sit amet"; return o;`

* The openning one:

	{	
		s: /@IF::(.*?)@/g , 		// Search chars '@IF::' then capture everything until another '@'
		r: '"; if( $1 ) { o+="'		// Replace by a javascript if
	}

and with this replacement: `var o = "lorem "; if(expression) { o+=" ipsum @STOP::IF dolor sit amet"; return o;`
the code is buggy cause we need,

* the close tag rule:

	{
		s: /@STOP::IF/g , 			// Search chars '@STOP::IF'
		r: '"; } o+="'				// 
	}

Here the final code is: `var o = "lorem "; if(expression) { o+=" ipsum "; } o+=" dolor sit amet"; return o;`

## Unescaping:

A common use case is to first create a rules to escape " double quote char to be able to paste a quote in the resulting code
otherwise the quote should close the string declaration in js code: 

	'<div class="item">foo</div>'   >>   var o = "<div class="item">foo</div>"; return o;

Here the quotes surrounding "item" breaks the js string declaration
So after escape no more problems : 

	var o = "<div class=\"item\">foo</div>"; return o;

The problem is that escaping all the template's quotes will also escape the one in js parts that rules will use ex:

	{	s: /"/g ,	r: '\\"'	},			// Escape all quotes (")
	{
		s: /\{\{if(.*?)\}\}/g , 			// Search chars '{{if' then capture everything until '}}' are found
		r: '"; if( $1 ) { o+="'				// Replace by if statement with 1st capture
	}
	
	'<div class="item">{{if bar == "foo"}}foo{{/if}}</div>'
	done:
	var o = "<div class=\"item\">"; if( bar == \"foo\" ) { o+="foo"; } o+="</div>"; return o;

Here our js code will break because of escaped quotes surrounding foo: if( bar == \"foo\" )
You should instead use here a function replacement to first unescape the quotes in captured string before concatenate
it to the final js code like:

	{
		s: /\{\{if(.*?)\}\}/g , 					// Search chars '{{if' then capture everything until '}}' are found
		r: function(found, $1, $2, ...)				// Normal String.replace signature: function(<part of string match all rexexp> , <1st capture> , <2nd capture>, etc ...)
		{
			var code = $1.replace(/\\"/g, '"');		// Replace '\"' by '"'
			return '"; if( ' + code + ' ) { o+="';	// Return the good js code
		}				
	}

Quite ugly!
It's why the `tmpl.unescapeCode(<string>)` static maethod exists !
It's doing the unescape for you before resolving the mask passed to it!
Ex:

	{
		s: /\{\{if(.*?)\}\}/g , 						// Search chars '{{if' then capture everything until '}}' are found
		r: tmpl.unescapeCode('"; if( $1 ) { o+="')		// $1 is unescaped to be js code!!
	}