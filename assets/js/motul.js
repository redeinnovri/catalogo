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
		const gamas = [...new Set(products.map(p => p.Gama))].sort();
		const viscosidades = [...new Set(products.map(p => p.ViscosidadeSAE))].sort();
		const aceas = [...new Set(products.flatMap(p => (p.EspecificacaoACEA ? p.EspecificacaoACEA.split('; ') : [])))].sort();
		const marcas = [...new Set(products.map(p => p.Marca))].sort();

		// Combina as opções de AprovacaoFabricante e RecomendacaoFabricanteOleo, removendo duplicatas
		const aprovacoes = [
			...new Set(
				products.flatMap(p => {
					const aprovacaoFabricante = p.AprovacaoFabricante ? p.AprovacaoFabricante.split(';') : [];
					const recomendacaoFabricanteOleo = p.RecomendacaoFrabricanteOleo ? p.RecomendacaoFrabricanteOleo.split(';') : [];
					return [...aprovacaoFabricante, ...recomendacaoFabricanteOleo];
				}),
			),
		].sort();

		populateDropdown(filterGama, gamas, 'gamaSearch');
		populateDropdown(filterViscosidade, viscosidades, 'viscosidadeSearch');
		populateDropdown(filterAcea, aceas, 'aceaSearch');
		populateDropdown(filterMarca, marcas, 'marcaSearch');
		populateDropdown(filterAprovacao, aprovacoes, 'aprovacaoSearch');
	}

	function populateDropdown(container, options, inputId) {
		options.forEach(option => {
			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.value = option;
			checkbox.addEventListener('change', filterAndSearch);
			checkbox.classList.add('form-check-input');

			const label = document.createElement('label');
			label.textContent = option;
			label.classList.add('form-check-label'); // Adiciona classe para facilitar o styling

			const div = document.createElement('div');
			div.classList.add('form-check', 'filter-option'); // Classe adicional para a estilização

			// Adiciona evento na div para marcar/desmarcar o checkbox quando clicar
			div.addEventListener('click', () => {
				checkbox.checked = !checkbox.checked; // Alterna entre marcado e desmarcado
				checkbox.dispatchEvent(new Event('change')); // Dispara o evento de change manualmente
			});

			div.appendChild(checkbox);
			div.appendChild(label);
			container.appendChild(div);
		});

		// Adiciona o evento de filtragem para o input de busca
		setupFilterCheckboxes(inputId, container);
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
			const matchesSearch = product.DesignacaoComercial.toLowerCase().includes(searchTerm) || product.Descricao.toLowerCase().includes(searchTerm);
			const matchesGama = selectedGamas.length > 0 ? selectedGamas.includes(product.Gama) : true;
			const matchesViscosidade = selectedViscosidades.length > 0 ? selectedViscosidades.includes(product.ViscosidadeSAE) : true;
			const matchesAcea = selectedAceas.length > 0 ? selectedAceas.some(acea => (product.EspecificacaoACEA || '').includes(acea)) : true;
			const matchesMarcas = selectedMarcas.length > 0 ? selectedMarcas.includes(product.Marca) : true;
			const matchesAprovacoes = selectedAprovacoes.length > 0 ? selectedAprovacoes.some(aprov => (product.AprovacaoFabricante || '').includes(aprov)) : true;

			return matchesSearch && matchesGama && matchesViscosidade && matchesAcea && matchesMarcas && matchesAprovacoes;
		});

		displayGroupedProducts(filteredProducts);
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
				productCard.className = 'col-xl-3 col-sm-12';

				// Card original com visual restaurado
				productCard.innerHTML = `
                    <div class="card">
                        <div class="product-box">
                            <div class="product-img" style="text-align: center; text-align: -webkit-center">
                                <img class="img-fluid" src="${product.imgUrl || '../assets/images/dashboard-3/product/semimagem.gif'}" alt="${product.DesignacaoComercial}" style="height: 250px" />
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
                                    <span class="badge bg-light text-dark p-2" style="font-weight: 700">${product.ViscosidadeSAE}</span>
                                </li>
                                <li class="list-group-item d-flex align-items-start flex-wrap">
                                    <div class="ms-2 me-auto">ACEA</div>
                                    <span class="badge bg-light text-dark p-2" style="font-weight: 700">${product.EspecificacaoACEA || ''}</span>
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
	const exampleModalCenter = document.getElementById('exampleModalCenter');
	exampleModalCenter.addEventListener('show.bs.modal', event => {
		const button = event.relatedTarget;
		const group = JSON.parse(button.getAttribute('data-group'));

		const modalTitle = exampleModalCenter.querySelector('.modal-title');
		const modalBody = exampleModalCenter.querySelector('.modal-body');

		modalTitle.textContent = group[0].DesignacaoComercial;
		modalBody.innerHTML = ``;

		// Ordena o grupo por Capacidade (ascendente)
		group.sort((a, b) => parseFloat(a.Capacidade) - parseFloat(b.Capacidade));

		group.forEach(product => {
			const button = document.createElement('button');
			button.className = 'btn btn-outline-primary';
			button.type = 'button';
			button.textContent = `${product.Capacidade}L`;
			button.addEventListener('click', () => {
				populateModal(product);
				highlightButton(button);
			});
			modalBody.appendChild(button);
		});

		// Seleciona e exibe automaticamente o produto com a menor Capacidade
		const lowestCapacityProduct = group[0];
		populateModal(lowestCapacityProduct);
		const firstButton = modalBody.querySelector('button');
		highlightButton(firstButton);
	});

	// Realça o botão ativo
	function highlightButton(button) {
		const buttons = button.parentNode.querySelectorAll('button');
		buttons.forEach(btn => btn.classList.remove('active'));
		button.classList.add('active');
	}

	// Exibe os detalhes do produto no modal
	function populateModal(product) {
		const modalImage = exampleModalCenter.querySelector('.modal-image img');
		const modalDetails = exampleModalCenter.querySelector('.modal-details');
		const modalAcea = exampleModalCenter.querySelector('#modal-acea');
		const modalAprovacao = exampleModalCenter.querySelector('#modal-aprovacao');
		const modalDescricao = exampleModalCenter.querySelector('#modal-descricao');

		modalImage.src = product.imgUrl || '../assets/images/dashboard-3/product/semimagem.gif';
		modalAcea.textContent = product.EspecificacaoACEA || 'N/A';
		modalAprovacao.textContent = product.AprovacaoFabricante || 'N/A';
		modalDescricao.textContent = product.Descricao || 'N/A';
	}

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
