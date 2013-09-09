Simple JavaScript Templating for both nodejs and browsers - Thomas Di Grégorio - https://bitbucket.org/tdigregorio/tmpl/src - derived from
Simple JavaScript Templating - John Resig - http://ejohn.org/ - MIT Licensed

# tmpl - Simple templating

tmpl is a portage and optimization of the great Simple JavaScript Templating from Jhon Resig.
First the code is made to be loaded both in browser via a <script> tag and in nodejs via require.
Second the templating rules have been exported into a rules array to let developpers create their own rules

## Usage

Use tmpl to generate a templating function that take an Object as argument:

	var greet = tmpl("Some text and <%=thing%>!");
	myDiv.innerHTML = greet({thing: 'that\'s it'});

The references in template tokens resolves to the properties of Object passed .

You can also pass the Object directly to tmpl function as 2nd argument:

	myDiv.innerHTML = tmpl("Some text and <%=thing%>!", {thing: 'that\'s it'});


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
buggy cause we need,

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