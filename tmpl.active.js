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