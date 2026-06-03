document.addEventListener("DOMContentLoaded", () => {

    const filters = document.querySelectorAll(".btn-filter");
    const cards = document.querySelectorAll(".event-card");
    const searchInput = document.querySelector(".search-bar input");
    const mapButtons = document.querySelectorAll(".btn-secondary");
    const buttons = document.querySelectorAll(".btn-primary");
    const favoriteIcons = document.querySelectorAll(".favorite-icon");

    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modal-title");
    const modalLocation = document.getElementById("modal-location");
    const modalTime = document.getElementById("modal-time");
    const modalExtra = document.getElementById("modal-info-extra");
    const closeModal = document.getElementById("closeModal");
    const commentInput = document.getElementById("comment-input");
    const sendComment = document.getElementById("send-comment");
    const commentsList = document.getElementById("comments-list");

    // ADICIONADO: Carrega os favoritos salvos no localStorage ao iniciar a página
    let favoritedEvents = JSON.parse(localStorage.getItem("sobralVibeFavorites")) || [];

    // ADICIONADO: Inicializa os corações de acordo com os favoritos salvos
    favoriteIcons.forEach(icon => {
        const eventId = icon.dataset.id;
        if (favoritedEvents.includes(eventId)) {
            icon.classList.add("active");
            icon.innerHTML = "❤️";
        } else {
            icon.classList.remove("active");
            icon.innerHTML = "♡";
        }
    });

    /* FAVORITAR EVENTOS */
    favoriteIcons.forEach(icon => {
        icon.addEventListener("click", (e) => {
            e.stopPropagation();

            icon.classList.toggle("active");
            const eventId = icon.dataset.id;

            if(icon.classList.contains("active")){
                icon.innerHTML = "❤️";
                // Adiciona na lista se não estiver nela
                if (!favoritedEvents.includes(eventId)) {
                    favoritedEvents.push(eventId);
                }
            } else{
                icon.innerHTML = "♡";
                // Remove da lista
                favoritedEvents = favoritedEvents.filter(id => id !== eventId);
                
                // Se o usuário desfavoritar enquanto estiver visualizando a aba favoritos, atualiza a tela
                const activeFilter = document.querySelector(".btn-filter.active");
                if (activeFilter && activeFilter.textContent.trim().toLowerCase() === "favoritos") {
                    icon.closest(".event-card").style.display = "none";
                    checkEmptyFavorites();
                }
            }

            // Salva as alterações no localStorage
            localStorage.setItem("sobralVibeFavorites", JSON.stringify(favoritedEvents));
            console.log("Evento favoritado:", eventId);
        });
    });
    
    // ADICIONADO: Função auxiliar para gerenciar aviso de favoritos vazio
    function checkEmptyFavorites() {
        const eventsGrid = document.querySelector(".events-grid");
        let existingMsg = eventsGrid.querySelector(".no-favorites-message");
        if (existingMsg) existingMsg.remove();

        const visibleCards = Array.from(cards).filter(card => card.style.display === "block");
        
        if (visibleCards.length === 0) {
            const noFavMsg = document.createElement("div");
            noFavMsg.className = "no-favorites-message";
            noFavMsg.innerHTML = "<p>Você ainda não favoritou nenhum evento. Clique no ♡ dos eventos para salvá-los aqui!</p>";
            eventsGrid.appendChild(noFavMsg);
        }
    }
    
    filters.forEach(button => {
        button.addEventListener("click", () => {

            filters.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const filterText = button.textContent.trim().toLowerCase();

            // Limpa mensagem de favoritos vazios antes de aplicar novos filtros
            const existingMsg = document.querySelector(".no-favorites-message");
            if (existingMsg) existingMsg.remove();

            cards.forEach(card => {
                const category = card.dataset.category;
                const eventId = card.querySelector(".favorite-icon").dataset.id;

                if (filterText === "hoje") {
                    card.style.display = "block";
                } 
                else if (filterText === "shows" && category === "shows") {
                    card.style.display = "block";
                } 
                else if (filterText === "acadêmicos" && category === "academicos") {
                    card.style.display = "block";
                } 
                else if (filterText === "histórico" && category === "historico") {
                    card.style.display = "block";
                } 
                else if (filterText === "lazer" && category === "lazer") {
                    card.style.display = "block";
                } 
                // ADICIONADO: Condição de filtragem para exibir apenas os favoritados
                else if (filterText === "favoritos" && favoritedEvents.includes(eventId)) {
                    card.style.display = "block";
                }
                else {
                    card.style.display = "none";
                }
            });

            // Se o filtro selecionado for favoritos, valida se a lista está vazia
            if (filterText === "favoritos") {
                checkEmptyFavorites();
            }
        });
    });

    
    searchInput.addEventListener("input", () => {
        const value = searchInput.value.toLowerCase();

        cards.forEach(card => {
            const title = card.querySelector("h3").textContent.toLowerCase();

            if (title.includes(value)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });

   
    mapButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const location = btn.dataset.location;

            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

            window.open(url, "_blank");
        });
    });

    
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {

            const card = btn.closest(".event-card");

            const title = card.querySelector("h3").textContent;
            const location = card.querySelector(".event-details").textContent;
            const time = card.querySelector(".event-time").textContent;

            const type = btn.dataset.type;

            modalTitle.textContent = title;
            modalLocation.textContent = " " + location;
            modalTime.textContent = " " + time;

            let extra = "";

            if (type === "ingresso") {
                const price = btn.dataset.price;
                const link = btn.dataset.link;

                extra = `
                    <p style="margin-top:10px;">🎟️ Valor: ${price}</p>
                    <a href="${link}" target="_blank" 
                    style="display:inline-block;margin-top:10px;color:#ff7a00;">
                    Comprar ingresso
                    </a>
                `;
            } else {
                extra = `<p style="margin-top:10px;">Evento aberto ao público</p>`;
            }

            modalExtra.innerHTML = extra;

            modal.style.display = "flex";
        });
    });

    
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

   
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

});