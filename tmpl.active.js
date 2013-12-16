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
	(function(window, document){

		// Get the script tags
		var ss = document.getElementsByTagName('script');
		// var	s = ss[ss.length-1], dataAttr = s.getAttribute('data');
		for(var i = 0, script; script = ss[i++];)
			if(tmpl.rules.hasOwProperty(script.type) && script.innerHTML != '')
			{
				console.log(script);
				script._rendered = [];
				script.render = tmpl(script.innerHTML, script.type);
				if(script.id != '')
					window[script.id] = script.render;
				
				script._eventAttribute = function(name, data, i)
				{
					var event = new Event(name);
					event.data = data;
					if(this.getAttribute(name))
					{
						var item = data[i];
						eval('(function(){' + this.getAttribute(name) + '})').call(script, event);
					}
					this.dispatchEvent && this.dispatchEvent(event);
				};
				script.appendChild = function(child)
				{
					// If some node are already rendered, take last, this otherwise
					var prec = this._rendered.length > 0 ? this._rendered[this._rendered.length - 1] : this;
					
					this._rendered.push(child);
					
					if(prec.nextSibling) // if prec is not the last node
						this.parentNode.insertBefore(child, prec.nextSibling); // insert after prec
					else
						this.parentNode.appendChild(child); // otherwise append
				};
				script.repeat = function(data)
				{
					var div = document.createElement('div'); // needed to parse HTML strings
					
					this._eventAttribute('onBeforeRepeat', data);
					
					if(!(this.hasAttribute('appends') && this.hasAttribute('appends') == 'true'))
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
							for(var ic = 0, child; child = div.childNodes[ic++];)
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
				};
				var _dataProvider;
				script.__defineSetter__('dataProvider', function(v)
					{
						_dataProvider = v;
						script.repeat(v);
					});
				script.__defineGetter__('dataProvider', function()
					{
						return _dataProvider;
					});
				

				var _superSetAtt = script.setAttribute.bind(script);
				script.setAttribute = function(name, v)
				{
					// console.log('setAttribute');
					if(name == 'data')
						script.data = v;
					_superSetAtt.apply(script, arguments);
				}
				Object.defineProperty(script, 'data', {
					set: function(v)
					{
						try{
							script.innerHTML = script.render.call(script, typeof v == 'string' ? eval(v) : v);
						}catch(e){}
					}
				});

				if(script.getAttribute('data'))
					script.data = script.getAttribute('data');
			}
		
		
		// if(s.innerHTML != '')// && s.id != '')
		// {
			// console.log(s);
			// var render = tmpl(s.innerHTML, );
			// if(s.id != '')
				// window[s.id] = render;
		
			// // Not yet transformed
			// s.innerHTML = '';
			// var div = document.createElement('div');
			// div.innerHTML = s.outerHTML.replace(/script/g,'span');
			// var span = div.firstChild;
			// span.render = render;
			// s.parentNode.replaceChild(span, s);
			// s = span;

			// var _superSetAtt = s.setAttribute.bind(s);
			// s.setAttribute = function(name, v)
			// {
				// // console.log('setAttribute');
				// if(name == 'data')
					// s.data = v;
				// _superSetAtt.apply(s, arguments);
			// }
			// Object.defineProperty(s, 'data', {
				// set: function(v)
				// {
					// try{
						// s.innerHTML = render.call(s, typeof v == 'string' ? eval(v) : v);
					// }catch(e){}
				// }
			// });

			// if(dataAttr)
				// s.data = dataAttr;
		// }
		
	})(window, document);

}