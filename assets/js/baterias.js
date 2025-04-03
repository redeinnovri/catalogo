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
	const filterTerminal = document.getElementById('filter-terminal');
	const filterWh = document.getElementById('filter-wh');
	const filterCapAh = document.getElementById('filter-capah');
	const filterCCAaEN = document.getElementById('filter-ccaaen');
	const filterComprimento = document.getElementById('filter-comprimento');
	const filterLargura = document.getElementById('filter-largura');
	const filterAltura = document.getElementById('filter-altura');
	const resetFilters = document.getElementById('reset-filters');
	const productGrid = document.getElementById('product-grid');
	const noResults = document.getElementById('no-results');

	let products = [];

	// Fetch JSON data
	fetch('https://ruifgcosta.github.io/ecommerceapi/baterias.json')
		.then(response => response.json())
		.then(data => {
			products = data;
			populateFilters(products);
			displayGroupedProducts(products);
		})
		.catch(error => console.error('Erro ao carregar produtos:', error));

	// Popula os filtros com checkboxes
	function populateFilters(products) {
		const gamas = [...new Set(products.flatMap(p => (p.Segmento ? p.Segmento.split(';') : [])))].sort();

		const viscosidades = [...new Set(products.map(p => String(p.Tecnologia).trim()))].sort();
		const aceas = [...new Set(products.map(p => String(p.Bloco).trim()))].sort();
		const marcas = [...new Set(products.map(p => String(p.Marca).trim()))].sort();

		const aprovacoes = [...new Set(products.map(p => String(p.EsqLigacao).trim()))].sort();
		const terminal = [...new Set(products.map(p => String(p.Terminal).trim()))].sort();
		const wh = [...new Set(products.map(p => String(p.Wh).trim()))].sort();
		const capah = [...new Set(products.map(p => String(p.CapAh).trim()))].sort();
		const ccaaen = [...new Set(products.map(p => String(p.CCAaEN).trim()))].sort();
		const comprimento = [...new Set(products.map(p => String(p.Comprimento).trim()))].sort();
		const largura = [...new Set(products.map(p => String(p.Largura).trim()))].sort();
		const altura = [...new Set(products.map(p => String(p.Altura).trim()))].sort();

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
		populateDropdown(
			filterTerminal,
			terminal.filter(a => a !== ''),
			'terminalSearch',
		);
		populateDropdown(
			filterWh,
			wh.filter(a => a !== ''),
			'whSearch',
		);
		populateDropdown(
			filterCapAh,
			capah.filter(a => a !== ''),
			'capahSearch',
		);
		populateDropdown(
			filterCCAaEN,
			ccaaen.filter(a => a !== ''),
			'ccaaenSearch',
		);
		populateDropdown(
			filterComprimento,
			comprimento.filter(a => a !== ''),
			'comprimentoSearch',
		);
		populateDropdown(
			filterLargura,
			largura.filter(a => a !== ''),
			'larguraSearch',
		);
		populateDropdown(
			filterAltura,
			altura.filter(a => a !== ''),
			'alturaSearch',
		);
	}

	function populateDropdown(container, options, inputId) {
		// Filtra valores em branco antes de popular o filtro
		options = options.filter(option => option !== 'undefined' && option.trim() !== '');

		// Assumindo que o botão do dropdown tem o mesmo id que o container, mas com um sufixo diferente, por exemplo 'filter-gama-button'
		const dropdownButton = document.getElementById(`${container.id}-button`);

		// Adiciona botão de reset ao topo de cada filtro, logo abaixo da barra de pesquisa
		const resetButton = document.createElement('button');
		resetButton.textContent = 'Limpar Filtros';
		resetButton.classList.add('btn', 'btn-reset-filters-dropdown', 'w-100', 'mb-3');
		resetButton.addEventListener('click', () => {
			resetFilterCheckboxes(container); // Limpa os checkboxes desse filtro
			updateDropdownButton(dropdownButton, container); // Atualiza a cor do botão após resetar
		});

		container.appendChild(resetButton); // Adiciona o botão antes das opções

		options.forEach(option => {
			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.value = option;
			checkbox.addEventListener('change', () => {
				filterAndSearch(); // Filtra ao selecionar/deselecionar
				updateDropdownButton(dropdownButton, container); // Atualiza a cor do botão ao marcar/desmarcar
			});
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

	// Função para atualizar o background do botão do dropdown
	function updateDropdownButton(button, container) {
		const checkboxes = container.querySelectorAll('input[type="checkbox"]');
		const isAnyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

		// Se algum checkbox estiver marcado, aplica a classe 'active-filter' ao botão do dropdown
		if (isAnyChecked) {
			button.classList.add('active-filter-button');
		} else {
			button.classList.remove('active-filter-button');
		}
	}

	function resetFilterCheckboxes(container) {
		const checkboxes = container.querySelectorAll('input[type="checkbox"]');
		checkboxes.forEach(checkbox => {
			checkbox.checked = false; // Desmarca todos os checkboxes
		});

		const dropdownButton = document.getElementById(`${container.id}-button`);
		updateDropdownButton(dropdownButton, container); // Atualiza a cor do botão após limpar os filtros
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
		const selectedTerminal = getSelectedCheckboxes(filterTerminal);
		const selectedWh = getSelectedCheckboxes(filterWh);
		const selectedCapAh = getSelectedCheckboxes(filterCapAh);
		const selectedCCAaEN = getSelectedCheckboxes(filterCCAaEN);
		const selectedComprimento = getSelectedCheckboxes(filterComprimento);
		const selectedLargura = getSelectedCheckboxes(filterLargura);
		const selectedAltura = getSelectedCheckboxes(filterAltura);

		const filteredProducts = products.filter(product => {
			const matchesSearch =
				product.Referencia.toLowerCase().includes(searchTerm) ||
				product.Descricao.toLowerCase().includes(searchTerm) ||
				(product.Referencia && product.Referencia.toString().toLowerCase().includes(searchTerm));
			// const matchesGama1 = selectedGamas.length > 0 ? selectedGamas.includes(product.Segmento) : true;
			const matchesGama = selectedGamas.length > 0 ? selectedGamas.some(segmento => (product.Segmento || '').includes(segmento)) : true;
			const matchesViscosidade = selectedViscosidades.length > 0 ? selectedViscosidades.includes((product.Tecnologia || '').toString().trim()) : true;
			const matchesAcea = selectedAceas.length > 0 ? selectedAceas.includes((product.Bloco || '').toString().trim()) : true;
			const matchesMarcas = selectedMarcas.length > 0 ? selectedMarcas.includes(product.Marca) : true;
			const matchesAprovacoes = selectedAprovacoes.length > 0 ? selectedAprovacoes.includes((product.EsqLigacao || '').toString().trim()) : true;
			const matchesTerminal = selectedTerminal.length > 0 ? selectedTerminal.includes((product.Terminal || '').toString().trim()) : true;
			const matchesWh = selectedWh.length > 0 ? selectedWh.includes((product.Wh || '').toString().trim()) : true;
			const matchesCapAh = selectedCapAh.length > 0 ? selectedCapAh.includes((product.CapAh || '').toString().trim()) : true;
			const matchesCCAaEN = selectedCCAaEN.length > 0 ? selectedCCAaEN.includes((product.CCAaEN || '').toString().trim()) : true;

			const matchesComprimento = selectedComprimento.length > 0 ? selectedComprimento.includes((product.Comprimento || '').toString().trim()) : true;
			const matchesLargura = selectedLargura.length > 0 ? selectedLargura.includes((product.Largura || '').toString().trim()) : true;
			const matchesAltura = selectedAltura.length > 0 ? selectedAltura.includes((product.Altura || '').toString().trim()) : true;

			return (
				matchesSearch &&
				matchesGama &&
				matchesViscosidade &&
				matchesAcea &&
				matchesMarcas &&
				matchesAprovacoes &&
				matchesTerminal &&
				matchesWh &&
				matchesCapAh &&
				matchesCCAaEN &&
				matchesComprimento &&
				matchesLargura &&
				matchesAltura
			);
		});

		// Função já existente para exibir os produtos filtrados
		displayGroupedProducts(filteredProducts);

		// Aqui chamamos a função para atualizar o estado dos filtros
		updateFilterStates(filteredProducts);
	}

	function updateFilterStates(filteredProducts) {
		const filterContainers = [
			{ container: filterGama, prop: 'Segmento' },
			{ container: filterViscosidade, prop: 'Tecnologia' },
			{ container: filterAcea, prop: 'Bloco' },
			{ container: filterMarca, prop: 'Marca' },
			{ container: filterAprovacao, prop: ['EsqLigacao'] },
			{ container: filterTerminal, prop: ['Terminal'] },
			{ container: filterWh, prop: ['Wh'] },
			{ container: filterCapAh, prop: ['CapAh'] },
			{ container: filterCCAaEN, prop: ['CCAaEN'] },
			{ container: filterComprimento, prop: ['Comprimento'] },
			{ container: filterLargura, prop: ['Largura'] },
			{ container: filterAltura, prop: ['Altura'] },
		];

		filterContainers.forEach(({ container, prop }) => {
			const checkboxes = container.querySelectorAll('input[type="checkbox"]');

			checkboxes.forEach(checkbox => {
				const filterValue = checkbox.value.trim().toUpperCase(); // Normaliza para maiúsculas
				const filteredCount = filteredProducts.filter(product => {
					if (Array.isArray(prop)) {
						// Para arrays (ex: AprovacaoFabricante e RecomendacaoFabricanteOleo), verifica em ambos
						return prop.some(p => {
							const productValue = (product[p] || '').toString().toUpperCase();
							return productValue.includes(filterValue);
						});
					} else {
						let productValue = (product[prop] || '').toString().toUpperCase();
						if (prop === 'Segmento') {
							// Para Segmento, divide os valores separados por ';' e verifica individualmente
							const segments = productValue.split(';').map(val => val.trim());
							return segments.includes(filterValue); // Verifica se o filtro está na lista de segmentos
						}
						return productValue === filterValue;
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

		products.sort((a, b) => b.IdArtigo - a.IdArtigo);
		// Agrupar produtos por DesignacaoComercial
		const groupedProducts = groupBy(products, 'Referencia');

		if (Object.keys(groupedProducts).length === 0) {
			noResults.style.display = 'block';
		} else {
			noResults.style.display = 'none';
			for (const [designacaoComercial, group] of Object.entries(groupedProducts)) {
				const product = group[0]; // Usa o primeiro produto do grupo para exibir

				const productCard = document.createElement('div');
				productCard.className = 'col-xl-3 col-sm-6';

				// Verifica se existe uma DesignacaoComercialSubstituta
				const substitutoAlert = product.RefSubstituta
					? `<div class="alert border-warning p-0" role="alert" style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0; border-radius: 0px 0px 0.55rem 0px;">
                      <div class="bg-warning" style="padding: 1.6rem 1rem;"><i class="icon-exchange-vertical text-dark"></i></div>
                      <p>Substituído por: <strong class="txt-dark designacao-comercial-substituta" style="cursor: pointer;">${product.RefSubstituta}</strong></p>
                   </div>`
					: `<div class="alert p-0" style="visibility: hidden;"><p>&nbsp;</p></div>`;

				// Card original com visual restaurado
				productCard.innerHTML = `
                <div class="card">
                    <div class="product-box">
                        <div class="product-img" style="text-align: center; text-align: -webkit-center">
                            <img class="img-fluid" src="${product.imgUrl || '../assets/images/dashboard-3/product/semimagem.gif'}" alt="${
					product.Descricao
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
                                <h6 class="blog-bottom-details mb-0">${product.Referencia} - ${product.Descricao}</h6>
                            </div>
                        </div>
                        <ul class="list-group p-10">
                            <li class="list-group-item d-flex align-items-start flex-wrap">
                                <div class="ms-2 me-auto">CAP. AH</div>
                                <span class="badge bg-light text-dark p-2" style="font-weight: 700">${product.CapAh || 'N/D'}</span>
                            </li>
                            <li class="list-group-item d-flex align-items-start flex-wrap">
                                <div class="ms-2 me-auto">CCA A(EN)</div>
                                <span class="badge bg-light text-dark p-2" style="font-weight: 700">${product.CCAaEN || 'N/D'}</span>
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
						copyToClipboard(product.RefSubstituta);
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
		const terminalFilter = document.getElementById('filter-terminal');
		const whFilter = document.getElementById('filter-wh');
		const capAhFilter = document.getElementById('filter-capah');
		const ccaAeNFilter = document.getElementById('filter-ccaaen');
		const comprimentoFilter = document.getElementById('filter-comprimento');
		const larguraFilter = document.getElementById('filter-largura');
		const alturaFilter = document.getElementById('filter-altura');

		// Limpa o conteúdo anterior dos filtros para evitar duplicações
		gamaFilter.innerHTML = '';
		viscosidadeFilter.innerHTML = '';
		aceaFilter.innerHTML = '';
		marcaFilter.innerHTML = '';
		aprovacaoFilter.innerHTML = '';
		terminalFilter.innerHTML = '';
		whFilter.innerHTML = '';
		capAhFilter.innerHTML = '';
		ccaAeNFilter.innerHTML = '';
		comprimentoFilter.innerHTML = '';
		larguraFilter.innerHTML = '';
		alturaFilter.innerHTML = '';

		// Desmarca os checkboxes e reseta os inputs
		checkboxes.forEach(checkbox => (checkbox.checked = false));
		inputquery.forEach(input => (input.value = ''));
		searchbar.value = '';

		// Chama a função para repopular os filtros
		populateFilters(products);

		// Obtém e reseta o estilo de todos os botões dos dropdowns correspondentes
		const dropdownButtons = [
			'filter-gama-button',
			'filter-viscosidade-button',
			'filter-acea-button',
			'filter-marca-button',
			'filter-aprovacao-button',
			'filter-terminal-button',
			'filter-wh-button',
			'filter-capah-button',
			'filter-ccaaen-button',
			'filter-comprimento-button',
			'filter-largura-button',
			'filter-altura-button',
		];

		// Atualiza a cor de fundo dos botões de dropdown para o estilo padrão
		dropdownButtons.forEach(buttonId => {
			const dropdownButton = document.getElementById(buttonId);
			if (dropdownButton) {
				dropdownButton.classList.remove('active-filter-button');
			}
		});

		// Reexibe os produtos após limpar os filtros
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
			button.textContent = `${product.Referencia}`;
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
		const modalDispPolos = exampleModalCenter.querySelector('.disppolos');
		const modalTerminal = exampleModalCenter.querySelector('.terminal');
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
		modalACEA.innerHTML = `<span style="font-weight: 600;color: #000;">Segmento:</span> ${product.Segmento || ''}`;
		modalSEA.innerHTML = `<span style="font-weight: 600;color: #000;">Tecnologia:</span> ${product.Tecnologia || ''}`;
		modalEspec.innerHTML = `<span style="font-weight: 600;color: #000;">Bloco:</span> ${product.Bloco || ''}`;
		modalAprov.innerHTML = `<span style="font-weight: 600;color: #000;">Medidas (CxLxA):</span> ${product.Comprimento}x${product.Largura}x${product.Altura}`;
		modalRecom.innerHTML = `<span style="font-weight: 600;color: #000;">Esp. Elétricas:</span> ${product.Wh ? product.Wh + 'Wh' : ''} ${product.CapAh ? product.CapAh + 'CapAh' : ''} ${
			product.CCAaEN ? product.CCAaEN + 'CCAaEN' : ''
		}`;
		modalDispPolos.innerHTML = `<span style="font-weight: 600;color: #000;">Disp. Polos:</span> ${product.EsqLigacao || ''}`;
		modalTerminal.innerHTML = `<span style="font-weight: 600;color: #000;">Terminal:</span> ${product.Terminal || ''}`;

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
		if (product.FichaSeguranca) {
			modalFichaSeguranca.href = product.FichaSeguranca; // Define o link
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
