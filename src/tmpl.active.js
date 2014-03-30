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
if(window && document) // avoid executing out of a browser
{
	(function(window, document)
	{
		function extendWith(target, o)
		{
			if(typeof o == 'function')
			{
				for(var n in o.prototype)
					target[n] = o.prototype[n];
				o.call(target);
			}
			else if(typeof o == 'object')
				for(var n in o)
					target[n] = o[n];
		}
		
		function ActiveTmpl(script)
		{
			script= script || document.createElement('script');
			return script;
		}
		
		ActiveTmpl.prototype = {
			initialize: function()
			{
				console.log('ActiveTmpl('+this+' ID:'+this.id+');');
				this._rendered = [];
				this._tpl = this.innerHTML;
				this._render = tmpl(this.innerHTML, this.type);
				this.innerHTML = '';
				if(this.id != '')
					window[this.id] = this._render;
				
				
				var _dataProvider;
				Object.defineProperty(this,'data', {
					set: function(v)
					{
						_dataProvider = v;
						this.render();
					},
					get: function()
					{
						return _dataProvider;
					}
				});
				
		
				var _superSetAtt = this.setAttribute.bind(this);
				this.setAttribute = function(name, v)
				{
					// console.log('setAttribute');
					if(name == 'data')
						this.data = typeof v == 'string' ? eval('(' + v + ')') : v;
					_superSetAtt.apply(this, arguments);
				}
				// Object.defineProperty(this, 'data', {
					// set: function(v)
					// {
						// try{
							// this.innerHTML = this.render.call(this, typeof v == 'string' ? eval(v) : v);
						// }catch(e){}
					// }
				// });
		
				if(this.getAttribute('data'))
					this.setAttribute('data', this.getAttribute('data'));
			},
			_eventAttribute: function(name, data, i)
			{
				var event = new Event(name);
				event.data = data;
				if(this.getAttribute(name))
				{
					var item = data[i];
					eval('(function(){' + this.getAttribute(name) + '})').call(this, event);
				}
				this.dispatchEvent && this.dispatchEvent(event);
			},
			// appendChild: function(child)
			// {
				// If some node are already rendered, take last, this otherwise
				// var prec = this._rendered.length > 0 ? this._rendered[this._rendered.length - 1] : this;
				
				// this._rendered.push(child);
				
				// if(prec.nextSibling) // if prec is not the last node
					// this.parentNode.insertBefore(child, prec.nextSibling); // insert after prec
				// else
					// this.parentNode.appendChild(child); // otherwise append
			// },
			render: function(data, appends)
			{
				data = data || this.data;
				appends = typeof appends != 'undefined' ? appends : (this.hasAttribute('appends') && (this.getAttribute('appends') == '' || this.getAttribute('appends') == 'true'));
				
				this._eventAttribute('onBeforeRender', data);
				
				if(!appends)
				{
					this.innerHTML = "";
					// this._rendered.forEach(function(item)
					// {
						// item.parentNode.removeChild(item);
					// });
					// this._rendered = [];
				}
				if( getComputedStyle(this).display == 'none' )
					this.style.display = 'block';
				
				// this.innerHTML += this.render(data[i], i);
				var div = document.createElement('div'); // needed to parse HTML strings
				div.innerHTML = this._render(data);
				// The template can render several nodes
				var childs = Array.prototype.slice.call(div.childNodes);
				for(var ic = 0, child; child = childs[ic++];)
					this.appendChild(child);
				
				this._eventAttribute('onRender', data);
			},
			repeat: function(data, appends)
			{
				data = data || this.data;
				appends = typeof appends != 'undefined' ? appends : (this.hasAttribute('appends') && (this.getAttribute('appends') == '' || this.getAttribute('appends') == 'true'));
				
				
				var div = document.createElement('div'); // needed to parse HTML strings
				
				this._eventAttribute('onBeforeRepeat', data);
				
				// if(!(this.hasAttribute('appends') && (this.getAttribute('appends') == '' || this.getAttribute('appends') == 'true')))
				// {
					// this.innerHTML = "";
					// this._rendered.forEach(function(item){item.parentNode.removeChild(item);})
					// this._rendered = [];
				// }
				
				if(typeof data.length != 'undefined')// Array like
				{
					for(var index = 0, item; item = data[index]; index++)
					{
						// this.innerHTML += this.render(data[i], i);
						div.innerHTML = this.render(data[index]);
						// The template can render several nodes
						var childs = Array.prototype.slice.call(div.childNodes);
						for(var ic = 0, child; child = childs[ic++];)
							this.appendChild(child);
						
						this._eventAttribute('onRepeat', data, index);
					}
				}
				else
				{
					for(var index in data)
					{
						div.innerHTML = this._render(data[index]);
						// The template can render several nodes
						for(var ic = 0, child; child = div.childNodes[ic++];)
							this.appendChild(child);
						
						this._eventAttribute('onRepeat', data, index);
					}
				}
				
				this._eventAttribute('onRepeatEnd', data, index);
				
				return this;
			}
		};
		
		
		window.activateTmpls = function activateTmpls(root)
		{
			var ss;
			if(root instanceof HTMLScriptElement)
				ss = [root];
			else // Get the script tags
				ss = (root || document).getElementsByTagName('script');
			//console.log(ss.length)
			// var	s = ss[ss.length-1], dataAttr = s.getAttribute('data');
			for(var i = 0, script; script = ss[i++];){
				console.log(script.type);
			
				if(typeof script.render != 'function' && tmpl.rules.hasOwnProperty(script.type) && script.innerHTML != '')
				{
					// console.log("azzz"+(typeof script.extendWith));
					console.log(script.id, script);
					extendWith(script, ActiveTmpl);
					script.initialize();
					
				}
			}
		}
		
		if('addEventListener' in document)
			document.addEventListener('DOMContentLoaded',  function(){activateTmpls();});
		
		if('attachEvent' in document)
			document.attachEvent('onDOMContentLoaded',  function(){activateTmpls();});
		
		// $(function()
		// {
			// console.log('ok');
			// activeTmpls();
		// });
		
		
	})(window, document);

}