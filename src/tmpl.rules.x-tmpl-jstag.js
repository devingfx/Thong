/*!
The MIT License (MIT)

Copyright (c) 2014 DI GREGORIO Thomas and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var tmpl;
if(typeof tmpl == 'undefined') // If in nodejs
	tmpl = require('./tmpl').tmpl;

/**
 * tmpl Plugin <js tag>
 */
if(typeof tmpl != 'undefined')
{
	var name = 'text/x-tmpl-jstag';
	
	// Add new rules
	var rules = tmpl.rules[name] = [
		
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
		
	];
	
	// If required
	if(typeof exports != 'undefined')
	{
		exports.name = name;
		exports.rules = rules;
	}
}