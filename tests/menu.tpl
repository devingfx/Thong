tmpl.exports('\n\
	<? for(var m = 0, menu; menu = data[m++];) { ?>\n\
		<? with(menu) { ?>\n\
			<menu>\n\
				<span><?=header?></span>\n\
				<ul>\n\
					<? for(var i = 0, item; item = items[i++];) { ?>\n\
						<? if(item.id == "separator") { ?>\n\
							<hr/>\n\
						<? } else { ?>\n\
							<li onClick="doMenuAction(\'<?=item.id?>\')"><?=item.label||item.id?></li>\n\
						<? } ?>\n\
					<? } ?>\n\
				</ul>\n\
			</menu>\n\
		<? } ?>\n\
	<? } ?>\n\
	', "text/x-php-like"
)