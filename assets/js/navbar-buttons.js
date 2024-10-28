// Toggle sidebar e ajuste da disposição dos botões
$nav = $('.sidebar-wrapper');
$header = $('.page-header');
$toggle_nav_top = $('.toggle-sidebar');

// Função para ajustar a disposição dos botões
function ajustarDisposicaoBotoes() {
	const botoesContainer = $nav.find('.botoes-container');

	if ($nav.hasClass('close_icon')) {
		// Se a sidebar estiver minimizada
		botoesContainer.css('flex-direction', 'column');
	} else {
		// Se a sidebar estiver expandida
		botoesContainer.css('flex-direction', 'row');
	}
}


// Chamada inicial para ajustar a disposição ao carregar a página
ajustarDisposicaoBotoes();
