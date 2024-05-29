document.addEventListener('DOMContentLoaded', () => {
	const searchBar = document.getElementById('search-bar');
	const filterGama = document.getElementById('filter-gama');
	const filterViscosidade = document.getElementById('filter-viscosidade');
	const filterAcea = document.getElementById('filter-acea');
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
			products = data; // Ajuste para usar diretamente o array de produtos
			console.log('Products loaded:', products);
			populateFilters(products);
			displayProducts(products);
		})
		.catch(error => {
			console.error('There was a problem with the fetch operation:', error);
		});

	// Populate filter dropdowns
	function populateFilters(products) {
		const gamas = [...new Set(products.map(p => p.Gama))].sort();
		const viscosidades = [...new Set(products.map(p => p.ViscosidadeSAE))].sort();
		const aceas = [...new Set(products.flatMap(p => (p.EspecificacaoACEA ? p.EspecificacaoACEA.split('; ') : [])))].sort();

		populateFilterOptions(filterGama, gamas);
		populateFilterOptions(filterViscosidade, viscosidades);
		populateFilterOptions(filterAcea, aceas);
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
			products.forEach(product => {
				const productCard = document.createElement('div');
				productCard.className = 'col-xl-3 col-sm-12';
				productCard.innerHTML = `
                    <div class="card">
                        <div class="product-box">
                            <div class="product-img">
                                <img class="img-fluid" src="${product.imgUrl || 'https://cdn3d.iconscout.com/3d/premium/thumb/oil-can-10205168-8317526.png'}" alt="${product.DesignacaoComercial}" />
                            </div>
                            <div class="user-profile">
													<div class="hovercard">
														<div class="user-image">
															<ul class="share-icons" style="right: 0px; top: -40px">
																<li>
																	<button class="social-icon bg-primary" style="width: 30px; height: 30px" type="button" data-bs-toggle="modal" data-bs-target="#exampleModalCenter">
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

		const filteredProducts = products.filter(product => {
			const matchesSearch = product.DesignacaoComercial.toLowerCase().includes(searchTerm) || product.Descricao.toLowerCase().includes(searchTerm);
			const matchesGama = selectedGama ? product.Gama === selectedGama : true;
			const matchesViscosidade = selectedViscosidade ? product.ViscosidadeSAE === selectedViscosidade : true;
			const matchesAcea = selectedAcea ? (product.EspecificacaoACEA || '').includes(selectedAcea) : true;

			return matchesSearch && matchesGama && matchesViscosidade && matchesAcea;
		});

		displayProducts(filteredProducts);
	}

	// Event listeners
	searchBar.addEventListener('input', filterAndSearch);
	filterGama.addEventListener('change', filterAndSearch);
	filterViscosidade.addEventListener('change', filterAndSearch);
	filterAcea.addEventListener('change', filterAndSearch);
	resetFilters.addEventListener('click', () => {
		searchBar.value = '';
		filterGama.value = '';
		filterViscosidade.value = '';
		filterAcea.value = '';
		displayProducts(products);
	});
});
