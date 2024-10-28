const style = document.createElement('style');
style.textContent = `
    .no-results {
        opacity: 0.3;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
	const searchBar = document.getElementById('search-bar');
	const filterGama = document.getElementById('filter-produto');
	const filterViscosidade = document.getElementById('filter-gas');
	const filterAcea = document.getElementById('filter-funcionamento');
	const filterMarca = document.getElementById('filter-marca');
	const filterAprovacao = document.getElementById('filter-relacionado');
	const resetFilters = document.getElementById('reset-filters');
	const productGrid = document.getElementById('product-grid');
	const noResults = document.getElementById('no-results');

	let products = [];

	// Fetch JSON data
	fetch('https://ruifgcosta.github.io/ecommerceapi/diagnostico.json')
		.then(response => response.json())
		.then(data => {
			products = data;
			populateFilters(products);
			displayGroupedProducts(products);
		})
		.catch(error => console.error('Erro ao carregar produtos:', error));

	// Popula os filtros com checkboxes
	function populateFilters(products) {
		const gamas = [...new Set(products.map(p => String(p.Produto).trim()))].sort();
		const viscosidades = [...new Set(products.flatMap(p => (p.Construtor ? p.Construtor.split(';') : [])))].sort();
		const aceas = [...new Set(products.flatMap(p => (p.Funcionamento ? p.Funcionamento.split(';') : [])))].sort();
		const marcas = [...new Set(products.map(p => String(p.Marca).trim()))].sort();
		// const aprovacoes = [...new Set(products.flatMap(p => (p.ArtigoRelacionado ? p.ArtigoRelacionado : [])))].sort();
		const aprovacoes = [...new Set(products.flatMap(p => (p.ArtigoRelacionado ? p.ArtigoRelacionado.replace(/£/g, ' - ').split(';') : [])))].sort();

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
		const selectedAprovacoes = getSelectedCheckboxes(filterAprovacao); // Artigos Relacionados

		const filteredProducts = products.filter(product => {
			const matchesSearch =
				product.NomeComercial.toLowerCase().includes(searchTerm) ||
				product.Descricao.toLowerCase().includes(searchTerm) ||
				(product.Referencia && product.Referencia.toString().toLowerCase().includes(searchTerm));
			const matchesGama = selectedGamas.length > 0 ? selectedGamas.includes(product.Produto) : true;
			const matchesViscosidade = selectedViscosidades.length > 0 ? selectedViscosidades.some(construtor => (product.Construtor || '').includes(construtor)) : true;
			const matchesAcea = selectedAceas.length > 0 ? selectedAceas.some(acea => (product.Funcionamento || '').includes(acea)) : true;
			const matchesMarcas = selectedMarcas.length > 0 ? selectedMarcas.includes(product.Marca) : true;

			// Filtragem ajustada de Artigos Relacionados
			const matchesAprovacoes =
				selectedAprovacoes.length > 0
					? selectedAprovacoes.some(aprovacao => {
							const relacionados = product.ArtigoRelacionado ? product.ArtigoRelacionado.replace(/£/g, ' - ').split(';') : [];
							return relacionados.some(artigo => artigo.trim().toUpperCase() === aprovacao.toUpperCase());
					  })
					: true;

			return matchesSearch && matchesGama && matchesViscosidade && matchesAcea && matchesMarcas && matchesAprovacoes;
		});

		displayGroupedProducts(filteredProducts);
		updateFilterStates(filteredProducts);
	}

	function updateFilterStates(filteredProducts) {
		const filterContainers = [
			{ container: filterGama, prop: 'Produto' },
			{ container: filterViscosidade, prop: 'Construtor' },
			{ container: filterAcea, prop: 'Funcionamento' },
			{ container: filterMarca, prop: 'Marca' },
			{ container: filterAprovacao, prop: 'ArtigoRelacionado' },
		];

		filterContainers.forEach(({ container, prop }) => {
			const checkboxes = container.querySelectorAll('input[type="checkbox"]');

			checkboxes.forEach(checkbox => {
				const filterValue = checkbox.value.trim(); // Garantir que não há espaços em branco
				const filteredCount = filteredProducts.filter(product => {
					if (Array.isArray(prop)) {
						// Para arrays (ex: AprovacaoFabricante e RecomendacaoFabricanteOleo), verifica em ambos
						return prop.some(p => {
							let productValue = (product[p] || '').toString().toUpperCase(); // Normaliza para string e uppercase

							// Substitui o símbolo "£" por " - " no valor do produto
							productValue = productValue.replace(/£/g, ' - ');

							// Verifica se o valor contém um ";", aplicando a verificação extra
							if (productValue.includes(';')) {
								// Dividir valores separados por ";" e verificar se algum coincide
								return productValue.split(';').some(value => value.trim().toUpperCase() === filterValue.toUpperCase());
							} else {
								// Verificação original sem separação por ";"
								return productValue.includes(filterValue.toUpperCase());
							}
						});
					} else {
						// Para propriedades simples, aplica a mesma lógica
						let productValue = (product[prop] || '').toString().toUpperCase(); // Normaliza para string e uppercase

						// Substitui o símbolo "£" por " - " no valor do produto
						productValue = productValue.replace(/£/g, ' - ');

						// Verifica se o valor contém um ";", aplicando a verificação extra
						if (productValue.includes(';')) {
							// Dividir valores separados por ";" e verificar se algum coincide
							return productValue.split(';').some(value => value.trim().toUpperCase() === filterValue.toUpperCase());
						} else {
							// Verificação original sem separação por ";"
							return productValue.includes(filterValue.toUpperCase());
						}
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
		const groupedProducts = groupBy(products, 'NomeComercial');

		if (Object.keys(groupedProducts).length === 0) {
			noResults.style.display = 'block';
		} else {
			noResults.style.display = 'none';
			for (const [NomeComercial, group] of Object.entries(groupedProducts)) {
				const product = group[0]; // Usa o primeiro produto do grupo para exibir

				// Obter a data atual
				const currentDate = new Date();

				// Verificar se o produto está em campanha
				const campanhaInicio = new Date(product.CampanhaInicio);
				const campanhaFim = new Date(product.CampanhaFim);
				const isEmCampanha = currentDate >= campanhaInicio && currentDate <= campanhaFim;
				let ribbonEmCampanha = '';

				if (product.Expomecanica === 1) {
					ribbonEmCampanha = isEmCampanha
						? `<div style="position: absolute; top: 0; right: 0; background-color: #ffaa00; color: white; padding: 5px 10px; font-weight: bold; z-index: 1; max-width: 50%; text-align: end;">Campanha Especial Expomecânica</div>`
						: '';
				} else {
					// Ribbon HTML (adiciona se estiver em campanha)
					ribbonEmCampanha = isEmCampanha
						? `<div style="position: absolute; top: 0; right: 0; background-color: #006666; color: white; padding: 5px 10px; font-weight: bold; z-index: 1;">Em Campanha</div>`
						: '';
				}

				const productCard = document.createElement('div');
				productCard.className = 'col-xl-3 col-sm-6';

				const nomeComercialLimitado = product.NomeComercial.length > 40 ? product.NomeComercial.substring(0, 37) + '...' : product.NomeComercial;

				// Card original com visual restaurado
				productCard.innerHTML = `
                    <div class="card">
					${ribbonEmCampanha}
                        <div class="product-box">
                            <div class="product-img" style="text-align: center; text-align: -webkit-center">
                                <img class="img-fluid" src="${product.imgUrl || '../assets/images/dashboard-3/product/semimagem.gif'}" alt="${
					product.NomeComercial
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
                                    <h6 class="blog-bottom-details mb-0">${nomeComercialLimitado}</h6>
                                </div>
                            </div>
                            <ul class="list-group p-10">
                                <li class="list-group-item d-flex align-items-start flex-wrap">
                                    <div class="ms-2 me-auto">Construtor</div>
                                    <span class="badge bg-light text-dark p-2" style="font-weight: 700">${product.Construtor || 'N/D'}</span>
                                </li>
                                <li class="list-group-item d-flex align-items-start flex-wrap">
                                    <div class="ms-2 me-auto">Marca</div>
                                    <span class="badge bg-light text-dark p-2" style="font-weight: 700">${product.Marca || 'N/D'}</span>
                                </li>
                            </ul>
                        </div>
                    </div>`;

				productGrid.appendChild(productCard);
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
		const gamaFilter = document.getElementById('filter-produto');
		const viscosidadeFilter = document.getElementById('filter-gas');
		const aceaFilter = document.getElementById('filter-funcionamento');
		const marcaFilter = document.getElementById('filter-marca');
		const aprovacaoFilter = document.getElementById('filter-relacionado');

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
		group.sort((a, b) => parseFloat(a.IdArtigo) - parseFloat(b.IdArtigo));

		group.forEach(product => {
			if (product.Produto !== 'Acessórios') {
				const button = document.createElement('button');
				button.className = 'btn btn-outline-primary';
				button.type = 'button';
				button.style = 'padding: 5px 10px; margin: 0.1rem;';
				button.textContent = truncateString(product.Descricao || product.Referencia, 40); // Aqui 40 é o limite de caracteres

				button.addEventListener('click', () => {
					populateModal(product);
					highlightButton(button);
				});
				modalBody.appendChild(button);
			} else {
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
			}
		});

		function truncateString(str, maxLength) {
			if (str.length <= maxLength) return str;

			const partLength = Math.floor((maxLength - 3) / 2); // -3 para as reticências
			const start = str.slice(0, partLength); // Pega o início da string
			const end = str.slice(-partLength); // Pega o final da string

			return `${start}...${end}`;
		}

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
		const copyPriceBtn = exampleModalCenter.querySelector('#copy-price-btn');
		const modalFichaSeguranca = exampleModalCenter.querySelector('#fichaseguranca'); // Botão da ficha de segurança

		// Atualiza o conteúdo do modal
		modalPrice.innerHTML = `${product.Referencia}`;
		modalDescricao.innerHTML = `${product.Descricao}`;
		// Destaca as palavras e deixa o texto à frente com estilo normal
		modalACEA.innerHTML = `<span style="font-weight: 600;color: #000;">Construtor:</span> ${product.Construtor || 'N/D'}`;
		modalSEA.innerHTML = `<span style="font-weight: 600;color: #000;">Marca:</span> ${product.Marca || 'N/D'}`;
		modalEspec.innerHTML = `<span style="font-weight: 600;color: #000;">Artigo Relacionado:</span>`;

		modalImage.src = product.imgUrl || '../assets/images/dashboard-3/product/semimagem.gif';
		modalImage.alt = product.DesignacaoComercial;

		const artigosRelacionados = product.ArtigoRelacionado ? product.ArtigoRelacionado.split(';') : ['N/D'];

		// Limpa o conteúdo anterior para evitar duplicação
		modalEspec.innerHTML = `<span style="font-weight: 600;color: #000;">Artigo Relacionado:</span>`;

		artigosRelacionados.forEach(artigo => {
			const p = document.createElement('p');
			// Divide o artigo em antes e depois do símbolo "£"
			const partesArtigo = artigo.trim().split('£');
			const artigoAntes = partesArtigo[0]; // Parte antes do "£"
			const artigoDepois = partesArtigo[1] ? ` - ${partesArtigo[1].trim()}` : ''; // Parte depois do "£"

			// Texto completo com " - " no lugar de "£"
			p.textContent = artigoAntes + artigoDepois;

			// Verifica se o artigo não é "N/D" antes de adicionar a classe
			if (artigo.trim() !== 'N/D') {
				// Adiciona a classe para estilo se não for "N/D"
				p.classList.add('artigo-relacionado');

				// Adiciona um event listener para copiar o texto antes do "£" ao clicar
				p.addEventListener('click', () => {
					copyToClipboard(artigoAntes); // Função para copiar o texto antes do "£"
				});
			}

			modalEspec.appendChild(p);
		});

		// Verifica se há um link de Ficha de Segurança
		if (product.FichaTecnica) {
			modalFichaSeguranca.href = product.FichaTecnica; // Define o link
			modalFichaSeguranca.target = '_blank'; // Abre em uma nova aba
			modalFichaSeguranca.rel = 'noopener noreferrer'; // Boa prática de segurança
			modalFichaSeguranca.style.pointerEvents = 'auto'; // Reativa o botão
			modalFichaSeguranca.classList.remove('disabled'); // Remove a classe desativada
		} else {
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

		// Função para copiar para o clipboard
		function copyToClipboard(text) {
			if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
				// Se o método writeText estiver disponível, copia o texto
				navigator.clipboard
					.writeText(text)
					.then(() => {
						console.log('Texto copiado com sucesso!');
					})
					.catch(err => {
						console.error('Falha ao copiar o texto: ', err);
					});
			} else {
				// Caso o Clipboard API não esteja disponível, use um fallback
				const textArea = document.createElement('textarea');
				textArea.value = text;
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				try {
					document.execCommand('copy');
					console.log('Texto copiado (fallback)!');
				} catch (err) {
					console.error('Falha ao copiar o texto (fallback): ', err);
				}
				document.body.removeChild(textArea);
			}
		}
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
