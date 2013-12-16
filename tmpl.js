// Simple JavaScript Templating for both nodejs and browsers - Thomas Di Grégorio - http://www.devingfx.com/ - derived from
// Simple JavaScript Templating - John Resig - http://ejohn.org/ - MIT Licensed
if(typeof tmpl == 'undefined')
{
	(function(exports, document){
		var cache = {},
			fs = typeof require == 'function' ? require('fs') : null;

		var tmpl = exports.tmpl = function (str, ruleSetName)
		{
			// Figure out if we're getting a template, or if we need to
			// load the template - and be sure to cache the result.

			var fn = (cache[ruleSetName] || {}) [str] = cache[ruleSetName][str] || 		// First try if we have a cached fn or
					(fs && fs.existsSync(str) ? 										// try if we are in node env and file exists
						tmpl(fs.readFileSync(str, 'utf-8')) 							// to load it
						:																// or
						document && document.getElementById(str) ? 						// try if we are in window and the node exists
							tmpl(document.getElementById(str).innerHTML) 				// to get the content
							:
																						// or create the function
							(function(){
								// Apply rules
								var rules = tmpl.rules.defaults.concat(tmpl.rules[ruleSetName] || []);
								for(var i = 0, rule; rule = rules[i++];)
									str = str.replace(rule.s, rule.r);
								// console.log('var o="";\nwith(data){\no+="' + str + '";\n}\nreturn o;');
								// Convert the template into pure JavaScript
								return new Function('data', 'var o="";with(data){o+="' + str + '";}return o;');
							})()
					)

			// Provide some basic currying to the user
			return fn;
		};
		
		tmpl.unescapeCode = function(pattern)
		{
			return function(s)
			{
				var args = arguments;
				return pattern.replace(/\$(\d)/g, function(ref, id)
					{
						return args[parseInt(id)]
									.replace(/\\"/g, '"')
									.replace(/\\n/g, '\n');
					});
			}
			return str.replace(/\\"/g, '"');
		};
		
		tmpl.rules = {};
		tmpl.rules.defauts = [
			{s/*earch*/: /\\/g, r/*eplace*/: '\\\\'},											// Escape '\' so that output string will still have char escaped (needed when processing js code string)
			{s: /"/g, r: '\\"'},																// Escape '"' same has above
			{s: /[\n]/g, r: '\\n'},																// Escape '\n' same has above
			{s: /[\r]/g, r: '\\r'}																// Escape '\n' same has above
			
			/* You can add additional rules here ... */
		];
	})(window || exports, document);
}



/* TODO: Implement popular templating library support: EJS doT.js Handlerbar Mustache t.js ICANHAZ.JS */

/* Handlebar.js *
tmpl.rules['text/x-tmpl-handlebar'] = [
	{s: /\{\{(.*?)\}\}/g, r: '",$1,"'}			// Templating part: replace vars {{var}}
	 ...
];

*/
