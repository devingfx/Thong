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
 * Plugin loading template in place
 * 
 */
if(window && document) // avoid executing out of a browser
{
	(function(window, document)
	{
		if(typeof tmpl != 'undefined')
		{
			tmpl.exports = function (tpl, type)
			{
				var ss = document.getElementsByTagName('script');
				var script = ss[ss.length - 1];
				script.type = type;
				script.innerHTML = tpl;
				
			};
			tmpl.currentScript = function ()
			{
				return 	ss = document.getElementsByTagName('script'),
						ss[ss.length - 1];
			};
			tmpl.convert = function (script)
			{
				console.warn('\n\n\n\t\t\t\tTEMPLATE CONVERTER\n\n\nCopy/paste following console.log text into a file, and replace template in your DOM by the 2nd console.log text.\n\n');
				console.log('tmpl.exports(\'' + script._tpl.replace(/\n/g,'\\n\\\n') + '\', "'+script.type+'");');
				console.log('<script' + (script.id != '' ? ' id="'+script.id+'"' : '') + ' src="<enter filename here>"' + (script.data ? ' data="'+JSON.stringify(script.data).replace(/"/g, "'")+'"' : '') + '></script>');
			};
			// tmpl.convert($('#xmlRenderer'))
			tmpl.load = function (sUrl, fSuccess, fError, sMethod, oData)
			{
				var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : (window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : null);
				if(xhr)
				{
					xhr.open(sMethod || "GET", sUrl, true);
					xhr.onreadystatechange = function()
					{
						if ( xhr.readyState == 4 )
							(fSuccess || function(){})(xhr.responseText);
						else
							(fError || function(){})();
					}
					xhr.send(oData || null);
				}
				else
					(fError || function(){})();
			};
		}
	})(window, document);
}