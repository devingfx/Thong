Simple JavaScript Templating for both nodejs and browsers - Thomas Di Grégorio - http://www.devingfx.com/ - derived from
Simple JavaScript Templating - John Resig - http://ejohn.org/ - MIT Licensed

# tmpl - Simple templating

tmpl is a portage and optimization of the great Simple JavaScript Templating from Jhon Resig.
First the code is made to be loaded both in browser via a <script> tag and in nodejs via require.
Second the templating rules have been exported into a rules array to let developpers create their own rules

## Usage

	var greet = tmpl("Some text and <%=thing%>!");
	myDiv.innerHTML = greet({thing: 'that\'s it'});`


## Add a templating rule

`var rule = {];
tmpl.rules.push(rule)`