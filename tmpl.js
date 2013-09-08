// Simple JavaScript Templating for both nodejs and browsers - Thomas Di Grégorio - http://www.devingfx.com/ - derived from
// Simple JavaScript Templating - John Resig - http://ejohn.org/ - MIT Licensed
if(typeof tmpl == 'undefined')
{
	(function(exports, document){
		var cache = {},
			fs = typeof require == 'function' ? require('fs') : null;

		var tmpl = exports.tmpl = function (str, data)
		{
			// Figure out if we're getting a template, or if we need to
			// load the template - and be sure to cache the result.

			var fn = cache[str] = cache[str] || 									// First try if we have a cached fn or
					(fs && fs.existsSync(str) ? 									// try if we are in node env and file exists
						tmpl(fs.readFileSync(str, 'utf-8')) 						// to load it
						:															// or
						document && document.getElementById(str) ? 					// try if we are in window and the node exists
							tmpl(document.getElementById(str).innerHTML) 			// to get the content
							:
																					// or create the function
							(function(){
								// Apply rules
								for(var i = 0, rule; rule = tmpl.rules[i++];)
									str = str.replace(rule.s, rule.r);
								// console.log('var o="";\nwith(data){\no+="' + str + '";\n}\nreturn o;');
								// Convert the template into pure JavaScript
								return new Function('data', 'var o="";with(data){o+="' + str + '";}return o;');
							})()
					)

			// Provide some basic currying to the user
			return data ? fn( data ) : fn;
		};
		
		tmpl.unescapeCode = function(pattern)
		{
			return function(s)
			{
				var args = arguments;
				return pattern.replace(/\$(\d)/g, function(ref, id)
					{
						return args[parseInt(id)]
									.replace(/\\"/g, '"')
									.replace(/\\n/g, '\n');
					});
			}
			return str.replace(/\\"/g, '"');
		};
		// tmpl._savedScripts = [];
		tmpl.rules = [
			{s/*earch*/: /\\/g, r/*eplace*/: '\\\\'},											// Escape '\' so that output string will still have char escaped (needed when processing js code string)
			{s: /"/g, r: '\\"'},																// Escape '"' same has above
			{s: /[\n]/g, r: '\\n'},																// Escape '\n' same has above
			{s: /[\r]/g, r: '\\r'},																// Escape '\n' same has above
			{s: /<%=(.*?)%>/g, r: tmpl.unescapeCode('"+(typeof $1!="undefined"?$1:"")+"')},		// Templating part: replace vars <%=var%> 
			{s: /<%(.*?)%>/g, r: tmpl.unescapeCode('";\n$1;\no+="')}							// Templating part: replace js statements <% while(...) { %> text <% } %> 
			
			/* You can add additional rules here ...
			Syntax: a hash with 's' (search) and 'r' (replace) props : {s:<RegExp>, r:<string or function>}
			Ex: 
			Find a var tag of form 'text @varname@ text' and replace by the value
				{
					s: /@(.*?)@/g , 			// Search char '@' then capture everything until another '@' (don't forget the global modifier /./g)
					r: '" + ($1) + "'			// The replace string will be part of the final function code, so you are in a middle of 
				}
												// a javacript string declaration named 'o' ex : var o = "<result of template here>"; return o;
												// So imagine your template is "Doctor @who@ ?" the function code without any replacement
												// will be: var o = "Doctor @who@ !"; return o;
												// Now after our rule is replaced the js code will be: var o = "Doctor " + (who) + " !"; return o;
			More complex ex now:
			A conditional block of form 'text @IF::expression@ Some text @STOP::IF text' , we need 2 rules: 1 for opening tag and one for close.
				{	
					s: /@IF::(.*?)@/g , 		// Search chars '@IF::' then capture everything until another '@'
					r: '"; if( $1 ) { o+="'		// Here the code without replacement will be: var o = "text @IF::expression@ Some text @STOP::IF text"; return o;
				}	
				 								// and with the replacement: var o = "text "; if(expression) { o+=" Some text @STOP::IF text"; return o;
				 								// buggy cause we need the close tag rule:
				{
					s: /@STOP::IF/g , 			// Search chars '@STOP::IF'
					r: '"; } o+="'				// Here the final code is: var o = "text "; if(expression) { o+=" Some text "; } o+=" text"; return o;
				}

			Unescaping:
				A common use case is to first create a rules to escape " double quote char to be able to paste a quote in the resulting code
				otherwise the quote should close the string declaration in js code: 
				Ex: '<div class="item">foo</div>' >> var o = "<div class="item">foo</div>"; return o;
				Here the quotes surrounding "item" breaks the js string declaration
				So after escape no more problems : var o = "<div class=\"item\">foo</div>"; return o;
				
				The problem is that escaping all the template's quotes will also escape the one in js parts that rules will use ex:
				{	s: /"/g ,	r: '\\"'	},			// Escape all "
				{
					s: /\{\{if(.*?)\}\}/g , 			// Search chars '{{if' then capture everything until '}}' are found
					r: '"; if( $1 ) { o+="'				// Replace by if statement with 1st capture
				}
				'<div class="item">{{if bar == "foo"}}foo{{/if}}</div>' >>> var o = "<div class=\"item\">"; if( bar == \"foo\" ) { o+="foo"; } o+="</div>"; return o;
				Here our js code will break because of escaped quotes surrounding foo: bar == \"foo\" 
				You should instead use here a function replacement to first unescape the quotes in captured string before concatenate it to the final js code like:
				{
					s: /\{\{if(.*?)\}\}/g , 					// Search chars '{{if' then capture everything until '}}' are found
					r: function(found, $1, $2, ...)				// Normal String.replace signature: function(<part of string match all rexexp> , <1st capture> , <2nd capture>, etc ...)
					{
						var code = $1.replace(/\\"/g, '"');		// Replace '\"' by '"'
						return '"; if( ' + code + ' ) { o+="';	// Return the good js code
					}				
				}
				Quite ugly! It's why the tmpl.unescapeCode(<string>) static maethod exists ! It's doing the unescape for you before resolving the mask passed to it!
				Ex:
				{
					s: /\{\{if(.*?)\}\}/g , 						// Search chars '{{if' then capture everything until '}}' are found
					r: tmpl.unescapeCode('"; if( $1 ) { o+="')		// $1 is unescaped to be js code!!
				}

			*/
		];
	})(window || exports, document);
}



/**
 * Plugin <? ?> php like tag
 */
if(typeof tmpl != 'undefined')
{
	// Get rid of <%%> rules
	tmpl.rules.splice(4);
	// Add new rules
	tmpl.rules = tmpl.rules.concat([
		{s: /<\?=(.*?)\?>/g, r: tmpl.unescapeCode('"+(typeof $1!="undefined"?$1:"")+"')},	// Templating part: replace vars <?=var?> 
		{s: /<\?(.*?)\?>/g, r: tmpl.unescapeCode('";\n$1;\no+="')}							// Templating part: replace js statements <? while(...) { ?> text <? } ?> 
	]);
}


/**
 * Plugin <js tag>
 */
if(typeof tmpl != 'undefined')
{
	// Add new rules
	tmpl.rules = tmpl.rules.concat([
		// {s: /<script(.*?)<\/\sscript>/g, r: function(found){
		// 	var id = tmpl._savedScripts.push(found);
		// 	return '[script['+id+']]';
		// }},
		{s: /<:(.*?)\/>/g, r: tmpl.unescapeCode('"+(typeof $1!="undefined"?$1:"")+"')},					// Replace vars <:foo/> , <:myObj.myProperty/> or <:myFunction(foo)/>
		{s: /<([^>]*?)\?>/g, r: tmpl.unescapeCode('";\nif(typeof $1!="undefined")\n{\no+="')},			// Test if expression exists ex: <foo?> exists! </> => if(typeof foo =! "undefined") { o+=" exists! "; }
		{s: /<js\s+(.*?)>/g, r: tmpl.unescapeCode('";\n$1\no+="')},										// Replace pure js statements (don't forget the ending ';') ex: <js while(...) {> text </> => while(...) { o+=" text "; }
		{s: /<var\s+(.*?)>/g, r: tmpl.unescapeCode('";\nvar $1;\no+="')},								// Replace pure js var declaration (the ending ';' is added) ex: <var bar = 'foo', isFoo = bar == 'foo'> => var bar = 'foo', isFoo = bar == 'foo';
		{s: /<if\s+(.*?)>/g, r: tmpl.unescapeCode('";\nif($1)\n{\no+="')},								// Replace if statement ex: <if partsToShow.indexOf(id) != -1> Part <:id/> here! </> => if(partToShow.indexOf(id) != -1){ ... }
		{s: /<else>/g, r: '";\n}\nelse\n{\no+="'},														// Replace a else with accolades ex: <if connected> Hello! <else> Please connect! </> => ... }else{ ...
		{s: /<\/(with|for|foreach|if)*>/g, r: '";\n}\no+="'},											// The loop close part </> = }
		{s: /<for\s+(.*?)>/g, r: tmpl.unescapeCode('";\nfor($1)\n{\no+="')},							// Replace a normal for loop ex: <for i=0; i<nb; i++> <:i/></> => for(i=0; i<nb; i++){ o+=""+(i)+""; }
		// {s: /<for\s+(.*?)>/g, r: function(found, $1){
		// 	var parts = $1.split(' ');
		// 	console.log(parts);
		// 	// parts[0] = parts[0] != '' ? 'var '+parts[0] : '';
		// 	return '";\nfor('+parts.join(';')+')\n{\no+="';
		// }},
		{s: /<foreach\s+(.*?)\s+in\s+(.*?)\s*>/g, r: tmpl.unescapeCode('";\nfor(var n in $2)\n{\nvar $1=$2[n];\no+="')},	// Replace a for in statement (set the iterated var as the value not the name of property) ex: <foreach item in arr>(<:item/>)</> => for(var n in arr){var item=arr[n]; ... }
		{s: /<with\s+(.*?)\s*>/g, r: tmpl.unescapeCode('";\nwith($1)\n{\no+="')}											// Replace a with statement to create a scope ex: data = {aze:42,obj:{name:'foo'}} >>> <span>The magic number is <:aze/><with obj> and obj is called <:name/></>

		// {s: /\[script\[(.*?)\]\]/g, r: function(found, $1){
		// 	// console.log(found, $1, parseInt($1), tmpl._savedScripts, tmpl._savedScripts[parseInt($1)-1]);
		// 	return tmpl._savedScripts[parseInt($1) - 1].replace();
		// }}
	]);
}

/**
 * Plugin active template nodes
 * 
 * Replace the tagName of script tags with src="tmpl.js" by a span instead and
 * adds a render method to it that return the innerHTML template rendered with given object:
 * 		var renderedHTML = document.getElementById('myTemplate').render(myDatas);
 * It also save the same render fonction in window global object with the script's id as name:
 * 		var renderedHTML = myTemplate(myDatas);
 * And then you can add a 'data' attribute to the script tag or later to the resulting span to set its innerHTML as the renderedHTML:
 * 		<script id="myTemplate" type="text/javascript" src="tmpl.js" data="myDatas">
 * 	or
 * 		document.getElementById('myTemplate').setAttribute('data', 'myDatas');
 * 	or
 * 		document.getElementById('myTemplate').setAttribute('data', myDatas);
 * 	or
 * 		document.getElementById('myTemplate').data = myDatas; // In browsers supporting getters/setters
 */
if(window && document)
{
	(function(window, document){

		// Get the current script tag
		var ss= document.getElementsByTagName('script'),
			s = ss[ss.length-1], dataAttr = s.getAttribute('data');
		
		if(s.innerHTML != '')// && s.id != '')
		{
			console.log(s);
			var render = tmpl(s.innerHTML);
			if(s.id != '')
				window[s.id] = render;
		
			// Not yet transformed
			s.innerHTML = '';
			var div = document.createElement('div');
			div.innerHTML = s.outerHTML.replace(/script/g,'span');
			var span = div.firstChild;
			span.render = render;
			s.parentNode.replaceChild(span, s);
			s = span;

			var _superSetAtt = s.setAttribute.bind(s);
			s.setAttribute = function(name, v)
			{
				// console.log('setAttribute');
				if(name == 'data')
					s.data = v;
				_superSetAtt.apply(s, arguments);
			}
			Object.defineProperty(s, 'data', {
				set: function(v)
				{
					try{
						s.innerHTML = render.call(s, typeof v == 'string' ? eval(v) : v);
					}catch(e){}
				}
			});

			if(dataAttr)
				s.data = dataAttr;
		}
		
	})(window, document);

}






/* TODO: Implement popular templating library support: EJS doT.js Handlerbar.js Mustache */

/* Handlebar.js *
tmpl.rules.concat([
	{s: /\{\{(.*?)\}\}/g, r: '",$1,"'}			// Templating part: replace vars {{var}}
	// You can add additional rules here ...
]);






/* Original browser
// Simple JavaScript Templating - John Resig - http://ejohn.org/ - MIT Licensed
(function(){
	var cache = {};

	this.tmpl = function tmpl(str, data){
		// Figure out if we're getting a template, or if we need to
		// load the template - and be sure to cache the result.
		var fn = !/\W/.test(str) ?
			cache[str] = cache[str] ||
				tmpl(document.getElementById(str).innerHTML) :
		
			// Generate a reusable function that will serve as a template
			// generator (and which will be cached).
			new Function("obj",
				"var p=[],print=function(){p.push.apply(p,arguments);};" +
			
				// Introduce the data as local variables using with(){}
				"with(obj){p.push('" +
			
				// Convert the template into pure JavaScript
				str
					.replace(/[\r\t\n]/g, " ")
					.split("<%").join("\t")
					.replace(/((^|%>)[^\t]*)'/g, "$1\r")
					.replace(/\t=(.*?)%>/g, "',$1,'")
					.split("\t").join("');")
					.split("%>").join("p.push('")
					.split("\r").join("\\'")
			+ "');}return p.join('');");
		
		// Provide some basic currying to the user
		return data ? fn( data ) : fn;
	};
})();
*/