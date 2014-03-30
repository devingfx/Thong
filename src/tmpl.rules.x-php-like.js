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
 * tmpl Plugin <? ?> php like syntax
 */
if(typeof tmpl != 'undefined') // Should be in window otherwise
{
	var name = 'text/x-php-like';
	
	// Add new rules
	var rules = tmpl.rules[name] = [
	
		{s: /<\?=(.*?)\?>/g, r: tmpl.unescapeCode('"+(typeof $1!="undefined"?$1:"")+"')},	// Templating part: replace vars <?=var?> 
		{s: /<\?(.*?)\?>/g, r: tmpl.unescapeCode('";\n$1;\no+="')}							// Templating part: replace js statements <? while(...) { ?> text <? } ?> 
	
	];
	
	// If required
	if(typeof exports != 'undefined')
	{
		exports.name = name;
		exports.rules = rules;
	}
}
