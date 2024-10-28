document.addEventListener('DOMContentLoaded', () => {
	const API_URL = 'https://ruifgcosta.github.io/ecommerceapi/campanhas.json';
	const campanhaContainer = document.getElementById('idcampanha');
	const destaquesContainer = document.querySelector('.categories ul');
	const inputPesquisa = document.getElementById('pesquisa');
	const radioAtivas = document.getElementById('ativas');
	const radioProximas = document.getElementById('proximas');
	const radioTodas = document.getElementById('todas');
	const resetButton = document.getElementById('reset');
	let campanhas = [];

	// Função para fazer fetch do JSON
	fetch(API_URL)
		.then(response => response.json())
		.then(data => {
			campanhas = data;
			// Filtrar campanhas ativas ou brevemente ativas na inicialização
			const campanhasIniciais = campanhas.filter(campanha => {
				const estado = calcularEstado(campanha.DataInicio, campanha.DataFim);
				return estado === 'Ativa' || estado === 'Brevemente';
			});
			radioAtivas.checked = false;
			radioProximas.checked = false;
			radioTodas.checked = false;
			renderCampanhas(campanhasIniciais);
			renderDestaques(campanhas);
		})
		.catch(error => console.error('Erro ao carregar campanhas:', error));

	// Função para renderizar campanhas
	function renderCampanhas(filteredCampanhas) {
		campanhaContainer.innerHTML = '';

		if (filteredCampanhas.length === 0) {
			campanhaContainer.innerHTML = `
			<div class="col-12 text-center">
				<p><strong>Não encontrámos campanhas para mostrar, tente o filtro "Ver todas"!</strong></p>
			</div>
		`;
			return; // Sai da função para não tentar renderizar campanhas inexistentes
		}

		filteredCampanhas.forEach(campanha => {
			const estadoCampanha = calcularEstado(campanha.DataInicio, campanha.DataFim);

			let estadoCor = 'red'; // Cor padrão para Expirada

			if (estadoCampanha === 'Ativa') {
				estadoCor = 'limegreen';
			} else if (estadoCampanha === 'Brevemente') {
				estadoCor = 'orange';
			}

			const imagem = campanha.ImgUrl || '../assets/images/faq/3.jpg';
			campanhaContainer.innerHTML += `
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6"> <!-- Ajuste nas classes de colunas -->
                <div class="card" style="height: calc(100% - 25px);">
                    <div class="blog-box blog-grid text-center product-box">
                        <div class="product-img">
                            <img class="img-fluid top-radius-blog" src="${imagem}" alt="${campanha.Titulo}" />
                            <div class="product-hover">
                                <ul>
                                    <li><a href="${campanha.PdfUrl}" target="_blank" type="application/pdf"><i class="icon-link"></i></a></li>
                                </ul>
                            </div>
                        </div>
                        <div class="blog-details-main">
                            <ul class="blog-social">
                                <li style="font-weight: 600">${campanha.Titulo}</li>
                                <li style="font-weight: 700; color: ${estadoCor}">&#x2022; ${estadoCampanha}</li>
                            </ul>
                            <hr />
                            <h6 class="blog-bottom-details">${campanha.Descricao}</h6>
                        </div>
                    </div>
                </div>
            </div>
        `;
		});
	}

	// Função para calcular o estado da campanha
	function calcularEstado(dataInicio, dataFim) {
		const hoje = new Date();
		const inicio = new Date(dataInicio); // Formato ISO yyyy-mm-dd
		const fim = new Date(dataFim);

		// Verificar se as datas são válidas
		if (isNaN(inicio) || isNaN(fim)) {
			return 'Data inválida';
		}

		// Comparar as datas
		if (hoje >= inicio && hoje <= fim) {
			return 'Ativa';
		} else if (hoje < inicio) {
			return 'Brevemente';
		} else {
			return 'Expirada';
		}
	}

	// Função para renderizar os destaques
	function renderDestaques(campanhas) {
		destaquesContainer.innerHTML = '';
		campanhas
			.filter(c => c.Destaque === 1)
			.forEach(campanha => {
				const estadoCampanha = calcularEstado(campanha.DataInicio, campanha.DataFim);
				let badgeClass = 'badge-primary'; // Padrão para Ativa

				if (estadoCampanha === 'Brevemente') {
					badgeClass = 'badge-warning';
				} else if (estadoCampanha === 'Expirada') {
					badgeClass = 'badge-secondary'; // Caso deseje uma cor para Expirada (opcional)
				}

				destaquesContainer.innerHTML += `
					<li style="display: flex; align-items: center; place-content: space-between;">
						<a class="mr-1" href="#" onclick="filtrarPorDestaque(${campanha.Id}); return false;" style="padding:5px;">${campanha.Titulo}</a>
						<span class="badge ${badgeClass} pull-right">${estadoCampanha}</span>
					</li>
				`;
			});
	}

	// Função para filtrar por destaque
	window.filtrarPorDestaque = function (id) {
		const campanhaDestaque = campanhas.filter(campanha => campanha.Id === id);
		renderCampanhas(campanhaDestaque);
	};

	// Função para pesquisar por título ou descrição
	inputPesquisa.addEventListener('input', () => {
		const termoPesquisa = inputPesquisa.value.toLowerCase();
		const campanhasFiltradas = campanhas.filter(campanha => campanha.Titulo.toLowerCase().includes(termoPesquisa) || campanha.Descricao.toLowerCase().includes(termoPesquisa));
		renderCampanhas(campanhasFiltradas);
	});

	// Função para filtrar campanhas ativas, próximas ou todas
	[radioAtivas, radioProximas, radioTodas].forEach(radio => {
		radio.addEventListener('change', () => {
			let campanhasFiltradas;

			if (radioAtivas.checked) {
				campanhasFiltradas = campanhas.filter(c => calcularEstado(c.DataInicio, c.DataFim) === 'Ativa');
			} else if (radioProximas.checked) {
				campanhasFiltradas = campanhas.filter(c => calcularEstado(c.DataInicio, c.DataFim) === 'Brevemente');
			} else {
				campanhasFiltradas = campanhas; // Mostrar todas
			}

			renderCampanhas(campanhasFiltradas);
		});
	});

	// Função para resetar os filtros
	resetButton.addEventListener('click', () => {
		inputPesquisa.value = '';
		radioTodas.checked = false;
		radioAtivas.checked = false;
		radioProximas.checked = false;
		const campanhasIniciais = campanhas.filter(campanha => {
			const estado = calcularEstado(campanha.DataInicio, campanha.DataFim);
			return estado === 'Ativa' || estado === 'Brevemente';
		});
		renderCampanhas(campanhasIniciais); // Limpar filtros e mostrar todas
	});

	document.getElementById('btnAtivas').addEventListener('click', () => {
		const campanhasAtivas = campanhas.filter(c => calcularEstado(c.DataInicio, c.DataFim) === 'Ativa');
		renderCampanhas(campanhasAtivas);
	});

	document.getElementById('btnDestaque').addEventListener('click', () => {
		const campanhasDestaque = campanhas.filter(c => c.Destaque === 1);
		renderCampanhas(campanhasDestaque);
	});

	document.getElementById('btnProximas').addEventListener('click', () => {
		const campanhasProximas = campanhas.filter(c => calcularEstado(c.DataInicio, c.DataFim) === 'Brevemente');
		renderCampanhas(campanhasProximas);
	});

	document.getElementById('btnLimpar').addEventListener('click', () => {
		const campanhasIniciais = campanhas.filter(campanha => {
			const estado = calcularEstado(campanha.DataInicio, campanha.DataFim);
			return estado === 'Ativa' || estado === 'Brevemente';
		});
		renderCampanhas(campanhasIniciais); // Limpar filtros e mostrar todas
	});
});
