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
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok ' + response.statusText);
			}
			return response.json();
		})
		.then(data => {
			products = data;
			console.log('Products loaded:', products);
			populateFilters(products);
			displayProducts(products);
		})
		.catch(error => {
			console.error('There was a problem with the fetch operation:', error);
		});

	// Agrupar produtos por DesignacaoComercial
	function groupByDesignation(products) {
		const groupedProducts = products.reduce((acc, product) => {
			const { DesignacaoComercial } = product;
			if (!acc[DesignacaoComercial]) {
				acc[DesignacaoComercial] = [];
			}
			acc[DesignacaoComercial].push(product);
			return acc;
		}, {});
		return Object.values(groupedProducts);
	}

	// Populate filter dropdowns
	function populateFilters(products) {
		const gamas = [...new Set(products.map(p => p.Gama))].sort();
		const viscosidades = [...new Set(products.map(p => p.ViscosidadeSAE))].sort();
		const aceas = [...new Set(products.flatMap(p => (p.EspecificacaoACEA ? p.EspecificacaoACEA.split('; ') : [])))].sort();
		const marcas = [...new Set(products.map(p => p.Marca))].sort();
		// const aprovacoes = [...new Set(products.map(p => p.AprovacaoFabricante))].sort();
		const aprovacoes = [...new Set(products.flatMap(p => (p.AprovacaoFabricante ? p.AprovacaoFabricante.split(';') : [])))].sort();

		populateFilterOptions(filterGama, gamas);
		populateFilterOptions(filterViscosidade, viscosidades);
		populateFilterOptions(filterAcea, aceas);
		populateFilterOptions(filterMarca, marcas);
		populateFilterOptions(filterAprovacao, aprovacoes);
	}

	function populateFilterOptions(filter, options) {
		options.forEach(option => {
			const opt = document.createElement('option');
			opt.value = option;
			opt.textContent = option;
			filter.appendChild(opt);
		});
	}

	// Display products
	function displayProducts(products) {
		productGrid.innerHTML = '';
		if (products.length === 0) {
			noResults.style.display = 'block';
		} else {
			noResults.style.display = 'none';
			const groupedProducts = groupByDesignation(products);
			groupedProducts.forEach(group => {
				const product = group[0]; // Utilize o primeiro produto do grupo para o card
				const productCard = document.createElement('div');
				productCard.className = 'col-xl-3 col-sm-12';
				productCard.innerHTML = `
                    <div class="card">
                        <div class="product-box">
                            <div class="product-img" style="text-align: center; text-align: -webkit-center">
                                <img class="img-fluid" src="${product.imgUrl || 'https://cdn3d.iconscout.com/3d/premium/thumb/oil-can-10205168-8317526.png'}" alt="${
					product.DesignacaoComercial
				}" style="height: 250px" />
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
                    </div>
                `;
				productGrid.appendChild(productCard);
			});
		}
	}

	// Filter and search functionality
	function filterAndSearch() {
		const searchTerm = searchBar.value.toLowerCase();
		const selectedGama = filterGama.value;
		const selectedViscosidade = filterViscosidade.value;
		const selectedAcea = filterAcea.value;
		const selectedMarca = filterMarca.value;
		const selectedAprovacao = filterAprovacao.value;

		const filteredProducts = products.filter(product => {
			const matchesSearch = product.DesignacaoComercial.toLowerCase().includes(searchTerm) || product.Descricao.toLowerCase().includes(searchTerm);
			const matchesGama = selectedGama ? product.Gama === selectedGama : true;
			const matchesViscosidade = selectedViscosidade ? product.ViscosidadeSAE === selectedViscosidade : true;
			const matchesAcea = selectedAcea ? (product.EspecificacaoACEA || '').includes(selectedAcea) : true;
			const matchesMarca = selectedMarca ? product.Marca === selectedMarca : true;
			// const matchesAprovacao = selectedAprovacao ? product.AprovacaoFabricante === selectedAprovacao : true;
			const matchesAprovacao = selectedAprovacao ? (product.AprovacaoFabricante || '').includes(selectedAprovacao) : true;

			return matchesSearch && matchesGama && matchesViscosidade && matchesAcea && matchesMarca && matchesAprovacao;
		});

		displayProducts(filteredProducts);
	}

	// Event listeners
	searchBar.addEventListener('input', filterAndSearch);
	filterGama.addEventListener('change', filterAndSearch);
	filterViscosidade.addEventListener('change', filterAndSearch);
	filterAcea.addEventListener('change', filterAndSearch);
	filterMarca.addEventListener('change', filterAndSearch);
	filterAprovacao.addEventListener('change', filterAndSearch);
	resetFilters.addEventListener('click', () => {
		searchBar.value = '';
		filterGama.value = '';
		filterViscosidade.value = '';
		filterAcea.value = '';
		filterMarca.value = '';
		filterAprovacao.value = '';
		displayProducts(products);
	});

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
		modalBody.innerHTML = ``;

		// Sort group by Capacidade (ascending)
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
		const copyPriceBtn = exampleModalCenter.querySelector('#copy-price-btn');

		modalPrice.innerHTML = `${product.Referencia}`;
		modalDescricao.innerHTML = `${product.Descricao}`;
		modalACEA.innerHTML = `ACEA: ${product.EspecificacaoACEA || ''}`;
		modalSEA.innerHTML = `SAE: ${product.ViscosidadeSAE || ''}`;
		modalEspec.innerHTML = `Especificação: ${product.Especificacao || ''}`;
		modalAprov.innerHTML = `Aprovação Fabricante: ${product.AprovacaoFabricante || ''}`;
		modalImage.src = product.imgUrl || 'https://cdn3d.iconscout.com/3d/premium/thumb/oil-can-10205168-8317526.png';
		modalImage.alt = product.DesignacaoComercial;

		// Adiciona event listener para copiar o conteúdo de modalPrice
		copyPriceBtn.addEventListener('click', () => {
			navigator.clipboard
				.writeText(modalPrice.textContent)
				.then(() => {
					// Sucesso ao copiar
					console.log('Preço copiado com sucesso!');
				})
				.catch(err => {
					// Falha ao copiar
					console.error('Erro ao copiar o preço: ', err);
				});
		});
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
});
