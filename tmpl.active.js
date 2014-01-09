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
		
		function ActiveTmpl(script)
		{
			if(this instanceof ActiveTmpl) // called with new
			{
				script = document.createElement('script');
				for(var n in this)
					script[n] = this[n];
			}
			script = this instanceof HTMLScriptElement ? this : script;
			return script;
		}
		
		
		ActiveTmpl.prototype = {
			_rendered: [],
			initialize: function()
			{
				var script = this;
				//alert('ActiveTmpl('+this+' ID:'+this.id+');');
				
				this.render = tmpl(this.innerHTML, this.type);
				if(this.id != '')
					window[this.id] = this.render;
				
				
				var _dataProvider;
				Object.defineProperty(this,'data', {
					set: function(v)
					{
						if(typeof v != 'string')
							try{
								v = eval(v);
							}catch(e){}
						if(v)
						{
							_dataProvider = v;
							script.repeat(_dataProvider);
						}
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
						script.data = v;
					_superSetAtt.apply(script, arguments);
				}
				
		
				if(this.getAttribute('data') && this.getAttribute('data') != '')
					this.data = this.getAttribute('data');
			},
			_eventAttribute: function(name, data, i)
			{
				var event = new Event(name);
				event.data = data;
				if(this.getAttribute(name))
				{
					var item = data[i];
					eval('(function(){' + this.getAttribute(name) + '})').call(script, event);
				}
				this.dispatchEvent && this.dispatchEvent(event);
				
			},
			appendChild: function(child)
			{
				// If some node are already rendered, take last, this otherwise
				var prec = this._rendered.length > 0 ? this._rendered[this._rendered.length - 1] : this;
				
				this._rendered.push(child);
				
				if(prec.nextSibling) // if prec is not the last node
					this.parentNode.insertBefore(child, prec.nextSibling); // insert after prec
				else
					this.parentNode.appendChild(child); // otherwise append
			},
			repeat: function(data)
			{
				var div = document.createElement('div'); // needed to parse HTML strings

				//this._eventAttribute('onBeforeRepeat', data);
				if(!(this.hasAttribute('appends') && (this.getAttribute('appends') == '' || this.getAttribute('appends') == 'true')))
				{
					// this.innerHTML = "";
					// alert(this._rendered);
					this._rendered.forEach(function(item){item.parentNode.removeChild(item);})
					this._rendered = [];
				}
				
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
						//this._eventAttribute('onRepeat', data, index);
					}
				}
				else
				{
					for(var index in data)
					{
						div.innerHTML = this.render(data[index]);
						// The template can render several nodes
						var childs = Array.prototype.slice.call(div.childNodes);
						for(var ic = 0, child; child = childs[ic++];)
							this.appendChild(child);
						
						//this._eventAttribute('onRepeat', data, index);
					}
				}
				
				//this._eventAttribute('onRepeatEnd', data, index);
				
				return this;
			}
		};
		//alert('4');
		
		function activateTmpls(root)
		{
			//alert('ok')
			
			// Get the script tags
			var ss = ((root instanceof Event ? false : root) || document).getElementsByTagName('script');
			//alert(ss.length)
			// var	s = ss[ss.length-1], dataAttr = s.getAttribute('data');
			for(var i = 0, script; script = ss[i++];){
				//alert(script.type);
			
				if(tmpl.rules.hasOwnProperty(script.type) && script.innerHTML != '')
				{
					// alert("extendWithClass? "+(typeof script.extendWithClass));
					script.extendWithClass(ActiveTmpl);
					script.initialize();
					
				}
			}
		}
		// alert(document);
		document.addEventListener('DOMContentLoaded', activateTmpls);
		/*$(function()
		{
			alert('ok');
			activeTmpls();
		});
		*/
		
	})(window, document);

}
