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
/**
 * tmpl Plugin t.js like tag
 */

// if(typeof require == 'function')
	// tmpl = require('./tmpl').tmpl;

if(typeof tmpl != 'undefined')
{
	// Add new rules
	tmpl.rules['text/x-tmpl-tjs'] = [
		// Addon free javascript
		{s: /\{\{\{(.*?)\}\}\}/g ,r: tmpl.unescapeCode('"; try{ $1 } catch(e){} o+="')},

		// t.js template style (https://github.com/jasonmoo/t.js)
		// {s: /\{\{=(.*?)\}\}/g, r: '" + $1 + "'}, // Simple variable {{=value}} {{=User.address.city}}
		{s: /\{\{=(.*?)\}\}/g, r: tmpl.unescapeCode('"+ (typeof $1!="undefined"?$1:"")+ "')}, // Simple variable {{=value}} {{=User.address.city}}
		{s: /\{\{%(.*?)\}\}/g, r: tmpl.unescapeCode('"+ new Option($1).innerHTML.replace(/"/g,"&quot;") +"')}, // Escaped for html variable {{%unsafe_value}}

		// If not blocks: {{!value}} <<markup>> {{/!value}}
		{s: /\{\{!(.*?)\}\}/g, r: tmpl.unescapeCode('"; if(!($1)) { o+="')}, // if not block
		{s: /\{\{\/!(.*?)\}\}/g, r: '"; } o+="'}, // End of if not block

		// Object/Array iteration: {{@object_value}} {{=_key}}:{{=_val}} {{/@object_value}}
		{s: /\{\{@(.*?)\}\}/g, r: tmpl.unescapeCode('"; for(var i in $1) if($1.hasOwnProperty(i)) { var _key = i, _val = $1[i]; o+="')},
		{s: /\{\{\/@(.*?)\}\}/g, r: '"; } o+="'}, // End Object/Array iteration

		// If/else blocks: {{value}} <<markup>> {{:value}} <<alternate markup>> {{/value}}
		{s: /\{\{\/(.*?)\}\}/g, r: '"; } } catch(e){} o+="'}, // End if block
		{s: /\{\{:(.*?)\}\}/g, r: '"; }else{ o+="'}, // else block
		{s: /\{\{(.*?)\}\}/g, r: tmpl.unescapeCode('"; try{ if($1) { o+="')} // If block
	];
}