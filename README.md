Simple JavaScript Templating for both nodejs and browsers - Thomas Di Grégorio - http://www.devingfx.com/ - derived from
Simple JavaScript Templating - John Resig - http://ejohn.org/ - MIT Licensed

# tmpl - Simple templating

tmpl is a portage and optimization of the great Simple JavaScript Templating from Jhon Resig.
First the code is made to be loaded both in browser via a <script> tag and in nodejs via require.
Second the templating rules have been exported into a rules array to let developpers create their own rules

## Usage

	var greet = tmpl("Some text and <%=thing%>!");
	myDiv.innerHTML = greet({thing: 'that\'s it'});


## Add a templating rule

Simply add to the `tmpl.rules` Array a hash with 's' (search) and 'r' (replace) props :

	var rule = {s:<RegExp>, r:<string or function>};
	tmpl.rules.push(rule);

Exemple: Find a var tag of form 'text @varname@ text' and replace by the value.

	{
		s: /@(.*?)@/g , 	// Search char '@' then capture everything until another '@' (don't forget the global modifier /./g)
		r: '" + ($1) + "'	// The replace string will be part of the final function code, so you are in a middle of 
	}
							// a javacript string declaration named 'o' ex : var o = "<result of template here>"; return o;
							// So imagine your template is "Doctor @who@ ?" the function code without any replacement
							// will be: var o = "Doctor @who@ !"; return o;
							// Now after our rule is replaced the js code will be: var o = "Doctor " + (who) + " !"; return o;
