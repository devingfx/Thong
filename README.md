
Simple JavaScript Templating for both nodejs and browsers - Thomas Di Grégorio
https://bitbucket.org/tdigregorio/tmpl/src - derived from
JavaScript micro templating - Jhon Resig - MIT Licensed
http://ejohn.org/blog/javascript-micro-templating/


# tmpl - Simple templating

tmpl is a portage and optimization of the great JavaScript micro templating from
Jhon Resig (http://ejohn.org/blog/javascript-micro-templating/).
First the code is made to be loaded both in browser via a `<script>` tag or in 
nodejs via require.
Second the templating rules have been exported into a rules array to let 
developpers create their own rules.



## Install

To use tmpl you have to load tmpl itself, plus some template rules. Some rules 
sets are bundled in the tmpl repo to help people understanding the rules syntax.

Pre made rules sets are:

- jstag (src/tmpl.x-tmpl-jstag.js) : Rules looking like 
  `Hello <:varName/>`
- jresig (src/tmpl.x-tmpl-jresig.js) : The original rules from John Resig's blog post, looking like 
  `Hello <%=varName%>`
- php-like (src/tmpl.x-php-like.js) : Rules looking like php's : 
  `Hello <?=varName?>`
- tjs (src/tmpl.x-tmpl-tjs.js) : Rules looking like tjs, looks like 
  `Hello {{=varName}}`

Or you create your ow rules (see [how to create templating rules](#create)).

	<script src="js/tmpl.js"></script>
	<script src="js/tmpl.x-tmpl-jresig.js"></script>
	<script src="js/tmpl.x-tmpl-jstag.js"></script>

You can load several rules sets if needed, the rules will be store separately so
you'll be able to use the ones needed for each templates you wrote.



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

(notice the lack of rules sets name as a default one has been set see [default rules set](#default))

This syntax is not optimized if the template have to be resolved several times 
(like in a for loop), because the parsing of rules and tpl function 
creation are executed each time. You better have to save the templating function
in a variable (like a global one) and use it against your data each time needed.

>Tips:
>
>- You can write a multiline string in javascript using the backslash (\\) hack:

	var myArticleTpl = tmpl( 
							'<article class="catalog-item cat-<:category.id/>">\
								<span class="title"><:title/></span>\
							</article>'
							);

>Using this syntax is correct in javascript cause you escaped the newline char so
>the javascript virtual machine wont save this unknown char in the string. The 
>caveat is that the newline chars are lost. If you need to the newline chars to 
>be present in the final string you'll have explicitly write it:

	var myArticleTpl = tmpl( 
							'<article class="catalog-item cat-<:category.id/>">\n\
								<span class="title"><:title/></span>\n\
							</article>'
							);

>- You can access global objects in the template tokens has you will in a normal function:

	window.admin = true;
	var myArticleTpl = tmpl( 
							'<article class="catalog-item cat-<:category.id/>">\
								<span class="title"><:title/></span>\
								<admin?>\
									<button class="editor">Edit</button>\
								</if>\
							</article>'
							);
	
	for( var i = 0, item; item = myDatas[i++]; )
		myBlog.innerHTML = myArticleTpl( item );
			
>
>
>
>- Vanilla javascript Arrays work like a charm with tpl functions! As tpl functions take one object 
> as argument,`Array.map` or `Array.forEach` have the good signature for their callback:

	myBlog.innerHTML = myArticlesDatas.map( myArticleTpl ).join('');  // Notice Array.join usage
>
>
>
>- Embed template in your HTML markup within a `<script>` tags! Every `<script>` with a type attribute different of `"text/javascript"` wont be executed. Use this feature to embbed your template with the type corresponding to the rules set to use:

	<script id="myTaxonomyTpl" type="text/x-php-like">
		<span class="taxonomy-<?= tax ?>"><?= tax ?></span>
		<? if( admin ) { ?>
			<button>Edit</button>
		<? } ?>
	</script>
>
>
>
> Then select the `<script>` tag's innerHTML to get your template as a string:

	myTaxonomyTpl = tmpl( $('#myTaxonomyTpl').html(), $('#myTaxonomyTpl').attr('type') );



## Declare one rules set as default one
<a name="default"></a>

You can say to tmpl to use one rules set as the default one, to avoid giving the 
name each time you create a template function.

	tmpl.defaultRules = 'x-tmpl-jstag';

This is especially usefull if you loaded only one rules set.










<a name="create"></a>
## Create a templating rule

Simply add to the `tmpl.rules` Array a hash with 's' (search) and 'r' (replace) props :

	var rule = {s:<RegExp>, r:<string or function>};
	tmpl.rules.push(rule);

A rule consist in a RegExp that will be used in a **String.replace** to replace by the replace value.
The replace string will be part of the final function code generated, so you are in a middle of 
a javacript string declaration named 'o' (as output) ex : 

	var o = "<result of template here>"; return o;

So imagine your template is `"Doctor @who@ ?"` the function code without any rules
will be:

	var o = "Doctor @who@ !"; return o;

Now we want to insert the value of a the `who` variable, the final js code should be:

	var o = "Doctor " + (who) + " !"; return o;

**Exemple**: Find a var token of form `text @varname@ text` and replace by the value of the given variable name.

	{
		s: /@(.*?)@/g , 	// Search char '@' then capture everything until another '@' (don't forget the global modifier /./g)
		r: '" + ($1) + "'	// Now after our rule is replaced the js code will be: var o = "Doctor " + (who) + " !"; return o;
	}




## What is the rest of the tpl function declaration ?

The astuce for passing an object as first argument, and don't having to name the argument for accessing properties (aka : `var o = "Doctor " + (data.who) + " !"; return o;`) resides in using the
javascript `with( ... )` statement:

	function( data )
	{
		with( data )
		{
			var o = "<result of template here>";
			return o;
		}
	}




## A more complex ex now! 

Imagine a conditional block of form `lorem @IF::expression@ ipsum @STOP::IF dolor sit amet` ,
we need 2 rules: 1 for opening tag and one for the closing one.

Here the code without any rule will be: 

	var o = "lorem @IF::expression@ ipsum @STOP::IF dolor sit amet"; return o;

The **openning token** rule will have to capture the `expression` and replace by a js `if( ... )` statement:

	{	
		s: /@IF::(.*?)@/g , 		// Search chars '@IF::' then capture everything until another '@'
		r: '"; if( $1 ) { o+="'		// Replace by a javascript if
	}

and with this rule replaced the js code will be: 

	var o = "lorem "; if(expression) { o+=" ipsum @STOP::IF dolor sit amet"; return o;

this code is buggy cause we need the **close token** rule:

	{
		s: /@STOP::IF/g , 			// Search chars '@STOP::IF'
		r: '"; } o+="'				// close the if statement
	}

Here the final code is: 

	var o = "lorem "; if(expression) { o+=" ipsum "; } o+=" dolor sit amet"; return o;`




## Unescaping:

A common use case is to first create a rules to escape " double quote char to be able to paste a quote in the resulting code
otherwise the quote should close the string declaration in js code. Imagine a simple HTML template string as `<div class="item">foo</div>` would breaks the parsing:

	var o = "<div class="item">foo</div>"; return o;

Here the quotes surrounding "item" breaks the js string declaration.
A simple rule to escape all quotes would be:

	{	s: /"/g ,	r: '\\"'	}			// Replace " by \"

So after escape no more problems with html attributes: 

	var o = "<div class=\"item\">foo</div>"; return o;

> Tip: this rule is the `tmpl.rules.default` rules set added every time before custom rules.

The problem is that escaping all the template's quotes will also escape the one in the parts you want to use as js statements. Ex with the form `<div class="item">{{if bar == "foo"}}foo{{/if}}</div>`:

	{	s: /"/g ,	r: '\\"'	},			// Escape all quotes (")
	{
		s: /\{\{if(.*?)\}\}/g , 			// Search chars '{{if' then capture everything until '}}' are found
		r: '"; if( $1 ) { o+="'				// Replace by if statement with 1st capture
	}
	
The broken code will be:

	var o = "<div class=\"item\">"; if( bar == \"foo\" ) { o+="foo"; } o+="</div>"; return o;

Here our js code will break because of escaped quotes surrounding foo: `if( bar == \"foo\" )`
You should instead use here a replacement function to first unescape the quotes in captured string before concatenate
it to the final js code like:

	{
		// Search chars '{{if' then capture everything until '}}' are found
		s: /\{\{if(.*?)\}\}/g ,
		
		// Normal String.replace signature: function(<part of string match all rexexp> , <1st capture> , <2nd capture>, etc ...)
		r: function(found, $1, $2, ...)
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



## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D
