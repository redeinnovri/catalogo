const style = document.createElement('style');
style.textContent = `
    .no-results {
        opacity: 0.7;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
	const searchBar = document.getElementById('search-bar');
	const filterGama = document.getElementById('filter-gama');
	const filterViscosidade = document.getElementById('filter-viscosidade');
	const filterAcea = document.getElementById('filter-acea');
	const filterMarca = document.getElementById('filter-marca');
	const filterAprovacao = document.getElementById('filter-aprovacao');
	const resetFilters = document.getElementById('reset-filters');
	const productGrid = document.getElementById('product-grid');
	const noResults = document.getElementById('no-results');

	let products = [];

	// Fetch JSON data
	fetch('https://ruifgcosta.github.io/ecommerceapi/motulapi.json')
		.then(response => response.json())
		.then(data => {
			products = data;
			populateFilters(products);
			displayGroupedProducts(products);
		})
		.catch(error => console.error('Erro ao carregar produtos:', error));

	// Popula os filtros com checkboxes
	function populateFilters(products) {
		const gamas = [...new Set(products.map(p => String(p.Gama).trim()))].sort();
		const viscosidades = [...new Set(products.map(p => String(p.ViscosidadeSAE).trim()))].sort();
		const aceas = [...new Set(products.flatMap(p => (p.EspecificacaoACEA ? p.EspecificacaoACEA.split('; ') : [])))].sort();
		const marcas = [...new Set(products.map(p => String(p.Marca).trim()))].sort();

		const aprovacoes = [
			...new Set(
				products.flatMap(p => {
					const aprovacaoFabricante = p.AprovacaoFabricante ? p.AprovacaoFabricante.split(';').map(a => a.trim().toUpperCase()) : [];
					const recomendacaoFabricanteOleo = p.RecomendacaoFabricanteOleo ? p.RecomendacaoFabricanteOleo.split(';').map(r => r.trim().toUpperCase()) : [];
					return [...aprovacaoFabricante, ...recomendacaoFabricanteOleo];
				}),
			),
		].sort((a, b) => a.localeCompare(b));

		// Remove valores em branco ("" ou strings vazias)
		populateDropdown(
			filterGama,
			gamas.filter(g => g !== ''),
			'gamaSearch',
		);
		populateDropdown(
			filterViscosidade,
			viscosidades.filter(v => v !== ''),
			'viscosidadeSearch',
		);
		populateDropdown(
			filterAcea,
			aceas.filter(a => a !== ''),
			'aceaSearch',
		);
		populateDropdown(
			filterMarca,
			marcas.filter(m => m !== ''),
			'marcaSearch',
		);
		populateDropdown(
			filterAprovacao,
			aprovacoes.filter(a => a !== ''),
			'aprovacaoSearch',
		);
	}

	function populateDropdown(container, options, inputId) {
		// Filtra valores em branco antes de popular o filtro
		options = options.filter(option => option !== 'undefined' && option.trim() !== '');

		// Adiciona botão de reset ao topo de cada filtro, logo abaixo da barra de pesquisa
		const resetButton = document.createElement('button');
		resetButton.textContent = 'Limpar Filtros';
		resetButton.classList.add('btn', 'btn-reset-filters-dropdown', 'w-100', 'mb-3');
		resetButton.addEventListener('click', () => {
			resetFilterCheckboxes(container); // Limpa os checkboxes desse filtro
		});

		container.appendChild(resetButton); // Adiciona o botão antes das opções

		options.forEach(option => {
			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.value = option;
			checkbox.addEventListener('change', filterAndSearch); // Filtra ao selecionar/deselecionar
			checkbox.classList.add('form-check-input');

			const label = document.createElement('label');
			label.textContent = option;
			label.classList.add('form-check-label'); // Classe para estilização

			const div = document.createElement('div');
			div.classList.add('form-check', 'filter-option'); // Classe adicional para estilização

			// Adiciona evento na div para marcar/desmarcar o checkbox ao clicar
			div.addEventListener('click', () => {
				checkbox.checked = !checkbox.checked; // Alterna entre marcado e desmarcado
				checkbox.dispatchEvent(new Event('change')); // Dispara o evento de change manualmente
			});

			div.appendChild(checkbox);
			div.appendChild(label);
			container.appendChild(div); // Adiciona cada opção abaixo do botão de reset
		});

		// Adiciona o evento de filtragem para o input de busca
		setupFilterCheckboxes(inputId, container);
	}

	function resetFilterCheckboxes(container) {
		const checkboxes = container.querySelectorAll('input[type="checkbox"]');
		checkboxes.forEach(checkbox => {
			checkbox.checked = false; // Desmarca todos os checkboxes
		});

		filterAndSearch(); // Atualiza a exibição dos produtos após limpar os filtros
	}

	// Função de filtragem e pesquisa
	function filterAndSearch() {
		const searchTerm = searchBar?.value?.toLowerCase() || '';
		const selectedGamas = getSelectedCheckboxes(filterGama);
		const selectedViscosidades = getSelectedCheckboxes(filterViscosidade);
		const selectedAceas = getSelectedCheckboxes(filterAcea);
		const selectedMarcas = getSelectedCheckboxes(filterMarca);
		const selectedAprovacoes = getSelectedCheckboxes(filterAprovacao);

		const filteredProducts = products.filter(product => {
			const matchesSearch =
				product.DesignacaoComercial.toLowerCase().includes(searchTerm) ||
				product.Descricao.toLowerCase().includes(searchTerm) ||
				(product.Referencia && product.Referencia.toString().toLowerCase().includes(searchTerm));
			const matchesGama = selectedGamas.length > 0 ? selectedGamas.includes(product.Gama) : true;
			const matchesViscosidade = selectedViscosidades.length > 0 ? selectedViscosidades.includes((product.ViscosidadeSAE || '').toString().trim()) : true;
			const matchesAcea = selectedAceas.length > 0 ? selectedAceas.some(acea => (product.EspecificacaoACEA || '').includes(acea)) : true;
			const matchesMarcas = selectedMarcas.length > 0 ? selectedMarcas.includes(product.Marca) : true;
			const matchesAprovacoes =
				selectedAprovacoes.length > 0
					? selectedAprovacoes.some(aprov => (product.AprovacaoFabricante || '').toUpperCase().includes(aprov) || (product.RecomendacaoFabricanteOleo || '').toUpperCase().includes(aprov))
					: true;

			return matchesSearch && matchesGama && matchesViscosidade && matchesAcea && matchesMarcas && matchesAprovacoes;
		});

		// Função já existente para exibir os produtos filtrados
		displayGroupedProducts(filteredProducts);

		// Aqui chamamos a função para atualizar o estado dos filtros
		updateFilterStates(filteredProducts);
	}

	function updateFilterStates(filteredProducts) {
		const filterContainers = [
			{ container: filterGama, prop: 'Gama' },
			{ container: filterViscosidade, prop: 'ViscosidadeSAE' },
			{ container: filterAcea, prop: 'EspecificacaoACEA' },
			{ container: filterMarca, prop: 'Marca' },
			{ container: filterAprovacao, prop: ['AprovacaoFabricante', 'RecomendacaoFabricanteOleo'] },
		];

		filterContainers.forEach(({ container, prop }) => {
			const checkboxes = container.querySelectorAll('input[type="checkbox"]');

			checkboxes.forEach(checkbox => {
				const filterValue = checkbox.value.trim(); // Garantir que não há espaços em branco
				const filteredCount = filteredProducts.filter(product => {
					if (Array.isArray(prop)) {
						// Para arrays (ex: AprovacaoFabricante e RecomendacaoFabricanteOleo), verifica em ambos
						return prop.some(p => {
							const productValue = (product[p] || '').toString().toUpperCase(); // Normaliza para string e uppercase
							return productValue.includes(filterValue.toUpperCase()); // Compara sem distinção de maiúsculas/minúsculas
						});
					} else {
						// Para propriedades simples, compara como string sem distinção de maiúsculas/minúsculas
						const productValue = (product[prop] || '').toString().toUpperCase(); // Normaliza para string e uppercase
						return productValue === filterValue.toUpperCase();
					}
				}).length;

				if (filteredCount === 0) {
					checkbox.parentElement.classList.add('no-results');
					checkbox.disabled = true; // Desativa o checkbox se não houver resultados
					checkbox.parentElement.style.opacity = 0.8; // Reduz a opacidade para dar feedback visual
				} else {
					checkbox.parentElement.classList.remove('no-results');
					checkbox.disabled = false; // Ativa o checkbox se houver resultados
					checkbox.parentElement.style.opacity = 1; // Restaura a opacidade
				}
			});
		});
	}

	function getSelectedCheckboxes(container) {
		const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
		return Array.from(checkboxes).map(checkbox => checkbox.value);
	}

	// Função para agrupar e exibir os produtos
	function displayGroupedProducts(products) {
		productGrid.innerHTML = '';

		// Agrupar produtos por DesignacaoComercial
		const groupedProducts = groupBy(products, 'DesignacaoComercial');

		if (Object.keys(groupedProducts).length === 0) {
			noResults.style.display = 'block';
		} else {
			noResults.style.display = 'none';
			for (const [designacaoComercial, group] of Object.entries(groupedProducts)) {
				const product = group[0]; // Usa o primeiro produto do grupo para exibir

				const productCard = document.createElement('div');
				productCard.className = 'col-xl-3 col-sm-6';

				// Verifica se existe uma DesignacaoComercialSubstituta
				const substitutoAlert = product.DesignacaoComercialSubstituta
					? `<div class="alert border-warning p-0" role="alert" style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0; border-radius: 0px 0px 0.55rem 0px;">
                      <div class="bg-warning" style="padding: 1.6rem 1rem;"><i class="icon-exchange-vertical text-dark"></i></div>
                      <p>Substituído por: <strong class="txt-dark designacao-comercial-substituta" style="cursor: pointer;">${product.DesignacaoComercialSubstituta}</strong></p>
                   </div>`
					: `<div class="alert p-0" style="visibility: hidden;"><p>&nbsp;</p></div>`;

				// Card original com visual restaurado
				productCard.innerHTML = `
                <div class="card">
                    <div class="product-box">
                        <div class="product-img" style="text-align: center; text-align: -webkit-center">
                            <img class="img-fluid" src="${product.imgUrl || '../assets/images/dashboard-3/product/semimagem.gif'}" alt="${
					product.DesignacaoComercial
				}" style="height: 250px; object-fit: contain" />
                        </div>
                        <div class="user-profile">
                            <div class="hovercard">
                                <div class="user-image">
                                    <ul class="share-icons" style="right: 0px; top: -40px">
                                        <li>
                                            <button class="social-icon bg-primary" style="width: 30px; height: 30px" type="button" data-bs-toggle="modal" data-bs-target="#exampleModalCenter" data-group='${JSON.stringify(
																							group,
																						)}'>
                                                <i class="icon-plus" style="font-size: 15px"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="product-details text-center">
                            <div class="blog-details-main" style="min-height: 40px; align-content: center">
                                <h6 class="blog-bottom-details mb-0">${product.DesignacaoComercial}</h6>
                            </div>
                        </div>
                        <ul class="list-group p-10">
                            <li class="list-group-item d-flex align-items-start flex-wrap">
                                <div class="ms-2 me-auto">SAE</div>
                                <span class="badge bg-light text-dark p-2" style="font-weight: 700">${product.ViscosidadeSAE || 'N/D'}</span>
                            </li>
                            <li class="list-group-item d-flex align-items-start flex-wrap">
                                <div class="ms-2 me-auto">ACEA</div>
                                <span class="badge bg-light text-dark p-2" style="font-weight: 700">${product.EspecificacaoACEA || 'N/D'}</span>
                            </li>
                        </ul>
                        <!-- Alert de substituição -->
                        ${substitutoAlert}
                    </div>
                </div>`;

				productGrid.appendChild(productCard);

				// Adicionar evento de clique para copiar o texto da DesignacaoComercialSubstituta
				if (product.DesignacaoComercialSubstituta) {
					const substitutaElement = productCard.querySelector('.designacao-comercial-substituta');
					substitutaElement.addEventListener('click', () => {
						copyToClipboard(product.DesignacaoComercialSubstituta);
					});
				}
			}
		}
	}

	// Função para agrupar objetos por propriedade
	function groupBy(arr, prop) {
		return arr.reduce((acc, obj) => {
			const key = obj[prop];
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(obj);
			return acc;
		}, {});
	}

	// Reseta os filtros
	resetFilters.addEventListener('click', () => {
		const searchbar = document.getElementById('search-bar');
		const checkboxes = document.querySelectorAll('#filters input[type="checkbox"]');
		const inputquery = document.querySelectorAll('#filters input[type="text"]');
		// Obtém os containers dos filtros
		const gamaFilter = document.getElementById('filter-gama');
		const viscosidadeFilter = document.getElementById('filter-viscosidade');
		const aceaFilter = document.getElementById('filter-acea');
		const marcaFilter = document.getElementById('filter-marca');
		const aprovacaoFilter = document.getElementById('filter-aprovacao');

		// Limpa o conteúdo anterior dos filtros para evitar duplicações
		gamaFilter.innerHTML = '';
		viscosidadeFilter.innerHTML = '';
		aceaFilter.innerHTML = '';
		marcaFilter.innerHTML = '';
		aprovacaoFilter.innerHTML = '';

		checkboxes.forEach(checkbox => (checkbox.checked = false));
		inputquery.forEach(input => (input.value = ''));
		searchbar.value = '';
		populateFilters(products);
		displayGroupedProducts(products);
	});

	// Atualiza o modal com os detalhes do grupo de produtos
	// Modal update functionality
	const exampleModalCenter = document.getElementById('exampleModalCenter');
	exampleModalCenter.addEventListener('show.bs.modal', event => {
		const button = event.relatedTarget;
		const group = JSON.parse(button.getAttribute('data-group'));

		const modalTitle = exampleModalCenter.querySelector('.modal-title');
		const modalBody = exampleModalCenter.querySelector('.modal-body');
		const modalPrice = exampleModalCenter.querySelector('.product-price');
		const modalImage = exampleModalCenter.querySelector('.product-img img');
		const modalDescricao = exampleModalCenter.querySelector('.f-w-600');
		const modalACEA = exampleModalCenter.querySelector('.acea');
		const modalSEA = exampleModalCenter.querySelector('.sea');

		modalTitle.textContent = group[0].DesignacaoComercial;
		modalBody.innerHTML = '';

		// Sort group by Capacidade (ascending)
		group.sort((a, b) => parseFloat(a.Capacidade) - parseFloat(b.Capacidade));

		group.forEach(product => {
			const button = document.createElement('button');
			button.className = 'btn btn-outline-primary';
			button.type = 'button';
			button.style = 'padding: 5px 10px; margin: 0.1rem;';
			button.textContent = `${product.Capacidade + product.UnidadeMedida}`;
			button.addEventListener('click', () => {
				populateModal(product);
				highlightButton(button);
			});
			modalBody.appendChild(button);
		});

		// Automatically select and display the product with the lowest Capacidade
		const lowestCapacityProduct = group[0];
		populateModal(lowestCapacityProduct);
		highlightButton(modalBody.querySelector('button'));
	});

	function populateModal(product) {
		const modalPrice = exampleModalCenter.querySelector('.product-price');
		const modalImage = exampleModalCenter.querySelector('.product-img img');
		const modalDescricao = exampleModalCenter.querySelector('.f-w-600');
		const modalACEA = exampleModalCenter.querySelector('.acea');
		const modalSEA = exampleModalCenter.querySelector('.sea');
		const modalEspec = exampleModalCenter.querySelector('.especificacao');
		const modalAprov = exampleModalCenter.querySelector('.aprovacao');
		const modalRecom = exampleModalCenter.querySelector('.recomendacao');
		const modalSubstituta = exampleModalCenter.querySelector('.referencia-substituta'); // Campo para a referência substituta
		const copyPriceBtn = exampleModalCenter.querySelector('#copy-price-btn');
		const modalFichaSeguranca = exampleModalCenter.querySelector('#fichaseguranca'); // Botão da ficha de segurança

		// Atualiza o conteúdo do modal

		// Verifica se há uma referência substituta
		if (product.RefSubstituta) {
			// Exibe a referência atual seguida pela seta e pela nova referência
			modalPrice.innerHTML = `${product.Referencia} &rarr; ${product.RefSubstituta}`;
		} else {
			// Exibe apenas a referência atual
			modalPrice.innerHTML = `${product.Referencia}`;
		}

		modalDescricao.innerHTML = `${product.Descricao}`;
		// Destaca as palavras e deixa o texto à frente com estilo normal
		modalACEA.innerHTML = `<span style="font-weight: 600;color: #000;">ACEA:</span> ${product.EspecificacaoACEA || ''}`;
		modalSEA.innerHTML = `<span style="font-weight: 600;color: #000;">SAE:</span> ${product.ViscosidadeSAE || ''}`;
		modalEspec.innerHTML = `<span style="font-weight: 600;color: #000;">Especificação:</span> ${product.Especificacao || ''}`;
		modalAprov.innerHTML = `<span style="font-weight: 600;color: #000;">Aprovação Fabricante:</span> ${product.AprovacaoFabricante || ''}`;
		modalRecom.innerHTML = `<span style="font-weight: 600;color: #000;">Recomendação Fabricante:</span> ${product.RecomendacaoFabricanteOleo || ''}`;
		modalImage.src = product.imgUrl || '../assets/images/dashboard-3/product/semimagem.gif';
		modalImage.alt = product.DesignacaoComercial;

		// Verifica se há uma referência e designação comercial substitutas
		if (product.RefSubstituta && product.DesignacaoComercialSubstituta) {
			// Exibe o alerta de referência substituta
			modalSubstituta.innerHTML = `
        <div class="alert border-warning alert-dismissible mt-3" role="alert" style="padding: 0.5rem;">
            <p>Substituído por: <strong class="txt-dark">${product.RefSubstituta} - ${product.DesignacaoComercialSubstituta}</strong></p>
            <button id="copy-substituta-btn" class="btn btn-warning btn-sm mt-2 text-dark" style="padding: 0.5rem;">
                <i class="fa fa-copy" style="align-content: center; cursor: pointer"></i>
            </button>
        </div>`;

			// Remove event listeners anteriores para evitar duplicação
			const copySubstitutaBtn = exampleModalCenter.querySelector('#copy-substituta-btn');
			copySubstitutaBtn.removeEventListener('click', copySubstitutaHandler); // Remove o listener antigo
			copySubstitutaBtn.addEventListener('click', copySubstitutaHandler); // Adiciona o novo listener

			// Função para copiar a referência substituta
			function copySubstitutaHandler() {
				copyToClipboard(product.RefSubstituta);
			}
		} else {
			// Limpa o campo se não houver referência substituta
			modalSubstituta.innerHTML = '';
		}

		// Verifica se há um link de Ficha de Segurança
		if (product.FichaTecnica) {
			modalFichaSeguranca.href = product.FichaTecnica; // Define o link
			modalFichaSeguranca.target = '_blank'; // Abre em uma nova aba
			modalFichaSeguranca.rel = 'noopener noreferrer'; // Boa prática de segurança
			modalFichaSeguranca.style.pointerEvents = 'auto'; // Reativa o botão
			modalFichaSeguranca.classList.remove('disabled'); // Remove a classe desativada
		} else {
			// Se não houver link, desativa o botão ou remove o href
			modalFichaSeguranca.removeAttribute('href');
			modalFichaSeguranca.style.pointerEvents = 'none'; // Evita que o botão seja clicável
			modalFichaSeguranca.classList.add('disabled'); // Opcional: adiciona uma classe para indicar desativação
		}

		// Remove qualquer event listener anterior para evitar múltiplos eventos
		copyPriceBtn.removeEventListener('click', copyPriceToClipboard);

		// Event listener para copiar o conteúdo de modalPrice
		copyPriceBtn.addEventListener('click', copyPriceToClipboard);

		// Função separada para copiar o preço
		function copyPriceToClipboard() {
			copyToClipboard(modalPrice.textContent);
		}
	}

	// Função de copiar com feedback de sucesso/erro
	function copyToClipboard(text) {
		if (!navigator.clipboard) {
			// Método de fallback para browsers que não suportam clipboard API
			fallbackCopyTextToClipboard(text);
			console.log('Texto copiado (fallback)!');
			return;
		}
		navigator.clipboard.writeText(text).then(
			function () {
				console.log('Texto copiado com sucesso!');
			},
			function (err) {
				console.error('Erro ao copiar texto: ', err);
				fallbackCopyTextToClipboard(text); // Fallback em caso de falha
			},
		);
	}

	// Método de fallback para copiar
	function fallbackCopyTextToClipboard(text) {
		const textArea = document.createElement('textarea');
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		try {
			document.execCommand('copy');
			console.log('Texto copiado com sucesso (fallback)!');
		} catch (err) {
			console.error('Erro ao copiar texto (fallback): ', err);
		}
		document.body.removeChild(textArea);
	}

	function highlightButton(button) {
		const buttons = button.parentElement.querySelectorAll('button');
		buttons.forEach(btn => {
			btn.classList.remove('btn-primary');
			btn.classList.add('btn-outline-primary');
		});
		button.classList.remove('btn-outline-primary');
		button.classList.add('btn-primary');
	}

	// Exibe os detalhes do produto no modal

	// Função para configurar a pesquisa nos checkboxes
	function setupFilterCheckboxes(inputId, filterContainer) {
		const input = document.getElementById(inputId);
		input.addEventListener('input', () => {
			const filter = input.value.toLowerCase();
			const checkboxes = filterContainer.querySelectorAll('div');

			checkboxes.forEach(checkbox => {
				const label = checkbox.querySelector('label').textContent.toLowerCase();
				checkbox.style.display = label.includes(filter) ? '' : 'none';
			});
		});
	}

	// Filtro por barra de pesquisa principal
	searchBar.addEventListener('input', filterAndSearch);
});

// Impede o dropdown de fechar ao clicar numa checkbox
document.querySelectorAll('.dropdown-menu').forEach(menu => {
	menu.addEventListener('click', function (e) {
		e.stopPropagation(); // Impede que qualquer clique dentro do dropdown feche-o
	});
});
