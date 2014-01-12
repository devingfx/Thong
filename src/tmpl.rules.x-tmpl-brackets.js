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
 * tmpl Plugin brackets matching flex like ruleset
 */
if(typeof tmpl != 'undefined')
{
	// Add new rules
	// tmpl.nested('\\{','\\}')
	tmpl.nested = function(open, close, inCallback, outCallback)
	{
		var openSans = open.replace(/\\/, ''),
			closeSans = close.replace(/\\/, '');
		return {
			s: new RegExp(open+'(.*)'+close, 'g'),
			r:function(found, $1, index, all)
			{
				console.log(all);
				var lvl = 1,
					open = openSans,
					close = closeSans,
					parts = [''],
					iRes = 0;
				
				for(var i = 0, s; s = $1[i]; i++)
				{
					var was0 = lvl == 0;
					if(s==open)
						lvl ++;
					else if(s==close)
						lvl --;
					if((was0 && lvl > 0) || (!was0 && lvl <= 0))
					{
						parts[++iRes] = '';
					}
					if([open,close].indexOf(s) == -1 || lvl > (was0?1:0))
						parts[iRes] += s;
					console.log(s, lvl, parts);
				}
				
				console.log(parts);
				parts = parts.map(function(part, i)
									{
										if(i%2 == 1)
											return '"' + ((outCallback && outCallback(part)) || part) + '"';
										
										var res = (inCallback && inCallback(part)) || part;
										res = typeof res == 'string' ? res.replace(/\\"/g, '"') : res;
										return '(' + res + ')';
									});
				console.log(parts);
				var s = '"+' + parts.join('+') + '+"';
			
				console.log(s);
				return s;
			}
		}
	};
	tmpl.rules['text/x-tmpl-brackets'] = [
		tmpl.nested('\\{', '\\}', function(part)
		{
			console.log("add listener on ", part);
			return part;
		})
		// {
			// s: /\{(.*)\}/g ,
			// r: function(found, $1, index, all)
			// {
				// console.log(all);
				// var open = '{', close = '}', lvl = 1, res = [''], iRes = 0;
				// for(var i = 0, s; s = $1[i]; i++)
				// {
					// var was0 = lvl == 0;
					// if(s==open)
						// lvl ++;
					// else if(s==close)
						// lvl --;
					// if((was0 && lvl > 0) || (!was0 && lvl <= 0))
					// {
						// res[++iRes] = '';
					// }
					// if([open,close].indexOf(s) == -1 || lvl > (was0?1:0))
						// res[iRes] += s;
					// console.log(s, lvl, res);
				// }
				// console.log(res);
				// res = res.map(function(o, i)
					// {
						// return i%2 == 1 ? '"' + o + '"' : '(' + o.replace(/\\"/g, '"') + ')';
					// });
				// console.log(res);
				// var s = '"+' + res.join('+')+'+"';
				
				// console.log(s);
				// return s;
			// }
		// }
	];
}


var rule = tmpl.nested('x','X', function(part)
{
	console.log("add listener on ", part);
	return part;
});
var coucou = "Coucou", qsd = 42;
console.log("aze xcoucouX qsd: xqsdX text".replace(rule.s, rule.r))



function cutOpenClose(str, open, close, inCallback, outCallback)
{
	var lvl = 0,
		parts = [''],
		iRes = 0;
	
	for(var i = 0, s; s = str[i]; i++)
	{
		var was0 = lvl == 0;
		if(s==open)
			lvl ++;
		else if(s==close)
			lvl --;
		if((was0 && lvl > 0) || (!was0 && lvl <= 0))
		{
			parts[++iRes] = '';
		}
		if([open,close].indexOf(s) == -1 || lvl > (was0?1:0))
			parts[iRes] += s;
		// console.log(s, lvl, parts);
	}
	console.log(parts);
	parts = parts.map(function(part, i)
						{
							if(i%2 == 0)
								return (outCallback && outCallback(part)) || part;
							
							return (inCallback && inCallback(part)) || part;
						});
	console.log(parts);
	// var s = '"+' + parts.join('+') + '+"';

	// console.log(s);
	// return s;
	return parts;
}
function Binding(attr)
{
	var node = attr.ownerElement, prop = attr.nodeName, tpl = attr.nodeValue;
	var code = cutOpenClose(tpl, '{', '}', function(part)
	{
		target = part;
		console.log('add listener on', part);
		return '('+part+')';
	},
	function(part)
	{
		return '"'+part+'"';
	}).join(' + ');
	
	attr._executeBinding = function()
	{
		// try {
		
		var js = 'node.style[prop] = ('+code+');';
		console.log(js);
		eval(js);
		// }catch(e){}
	}
	
	return attr;
}