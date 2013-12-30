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
			script= script || document.createElement('script');
			return script;
		}
		
		ActiveTmpl.prototype = {
			initialize: function()
			{
				console.log('ActiveTmpl('+script+' ID:'+script.id+');');
				script._rendered = [];
				script.render = tmpl(script.innerHTML, script.type);
				if(script.id != '')
					window[script.id] = script.render;
				
				
				var _dataProvider;
				Object.defineProperty(this,'dataProvider', {
					set: function(v)
					{
						_dataProvider = v;
						script.repeat(v);
					},
					get: function()
					{
						return _dataProvider;
					}
				});
				
		
				var _superSetAtt = script.setAttribute.bind(script);
				script.setAttribute = function(name, v)
				{
					// console.log('setAttribute');
					if(name == 'data')
						script.data = v;
					_superSetAtt.apply(script, arguments);
				}
				Object.defineProperty(this, 'data', {
					set: function(v)
					{
						try{
							script.innerHTML = script.render.call(script, typeof v == 'string' ? eval(v) : v);
						}catch(e){}
					}
				});
		
				if(script.getAttribute('data'))
					script.data = script.getAttribute('data');
			},
			_eventAttribute = function(name, data, i)
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
				
				this._eventAttribute('onBeforeRepeat', data);
				
				if(!(this.hasAttribute('appends') && (this.getAttribute('appends') == '' || this.getAttribute('appends') == 'true')))
				{
					// this.innerHTML = "";
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
						
						this._eventAttribute('onRepeat', data, index);
					}
				}
				else
				{
					for(var index in data)
					{
						div.innerHTML = this.render(data[index]);
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
		
		
		function activeTmpls(root)
		{
			//console.log('ok')
			
			// Get the script tags
			var ss = (root || document).getElementsByTagName('script');
			//console.log(ss.length)
			// var	s = ss[ss.length-1], dataAttr = s.getAttribute('data');
			for(var i = 0, script; script = ss[i++];){
				console.log(script.type);
			
				if(tmpl.rules.hasOwnProperty(script.type) && script.innerHTML != '')
				{
					console.log("azzz"+(typeof script.mixin));
					script.mixin(ActiveTmpl).initialize();
					
				}
				}
		}
		
		window.addEventListener('DOMContentLoaded', activateTmpls);
		
		$(function()
		{
			console.log('ok');
			activeTmpls();
		});
		
		
	})(window, document);

}