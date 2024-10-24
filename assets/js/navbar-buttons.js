document.addEventListener('DOMContentLoaded', () => {
	const sidebar = document.querySelector('.sidebar-wrapper');
	const navbarButtons = document.querySelector('.navbar-buttons');

	// Função para ajustar os botões com base na classe da sidebar
	function toggleButtonLayout() {
		if (sidebar.classList.contains('close-icon')) {
			navbarButtons.classList.add('stacked-buttons');
			console.log('close-icon');
		} else {
			navbarButtons.classList.remove('stacked-buttons');
		}
	}

	// Inicialmente verifica a classe da sidebar
	toggleButtonLayout();

	// MutationObserver para monitorar mudanças na classe da sidebar
	const observer = new MutationObserver(() => {
		toggleButtonLayout();
	});

	// Observa mudanças nos atributos da sidebar
	observer.observe(sidebar, {
		attributes: true, // Monitora mudanças nos atributos
		attributeFilter: ['class'], // Apenas mudanças na classe
	});
});
