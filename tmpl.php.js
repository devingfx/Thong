/**
 * tmpl Plugin <? ?> php like syntax
 */
if(typeof tmpl != 'undefined')
{
	// Add new rules
	tmpl.rules['text/x-php-like'] = [
		{s: /<\?=(.*?)\?>/g, r: tmpl.unescapeCode('"+(typeof $1!="undefined"?$1:"")+"')},	// Templating part: replace vars <?=var?> 
		{s: /<\?(.*?)\?>/g, r: tmpl.unescapeCode('";\n$1;\no+="')}							// Templating part: replace js statements <? while(...) { ?> text <? } ?> 
	];
}