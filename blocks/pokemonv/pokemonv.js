const style = document.createElement("style");
 style.innerHTML = `
   body {
     font-family: 'Segoe UI', sans-serif;
     background-color: #f5f7fa;
     margin: 0;
     padding: 20px;
     transition: background-color 0.3s ease;
   }
   .dark-mode {
     background-color: #121212;
     color: #eee;
   }
   .header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     flex-wrap: wrap;
     margin-bottom: 20px;
   }
   .controls {
     display: flex;
     gap: 10px;
     flex-wrap: wrap;
   }
   input, button {
     padding: 8px 14px;
     font-size: 1rem;
     border-radius: 6px;
     border: 1px solid #ccc;
   }
   .dark-mode input, .dark-mode button {
     background: #2a2a2a;
     color: white;
     border-color: #555;
   }
   #cards {
     display: flex;
     flex-wrap: wrap;
     gap: 20px;
     justify-content: center;
   }
   .card {
     background: white;
     border-radius: 12px;
     box-shadow: 0 4px 12px rgba(0,0,0,0.1);
     width: 220px;
     padding: 16px;
     text-align: center;
     transition: background 0.3s;
   }
   .dark-mode .card {
     background: #1e1e1e;
   }
   .card img {
     width: 100px;
     height: 100px;
     object-fit: contain;
   }
   .types {
     display: flex;
     justify-content: center;
     gap: 6px;
     margin: 10px 0;
   }
   .type {
     padding: 4px 10px;
     border-radius: 20px;
     color: white;
     font-size: 0.8rem;
     text-transform: capitalize;
   }
   .favorite {
     cursor: pointer;
     font-weight: bold;
     font-size: 1.2rem;
   }
   .favorite.active {
     color: red;
   }
   .pagination {
     margin-top: 20px;
     text-align: center;
   }
   .pagination button {
     margin: 0 4px;
   }
 `;
 document.head.appendChild(style);
 const typeColor = {
   bug: "#26de81", dragon: "#ffeaa7", electric: "#fed330",
   fairy: "#FF0069", fighting: "#30336b", fire: "#f0932b",
   flying: "#81ecec", grass: "#00b894", ground: "#EFB549",
   ghost: "#a55eea", ice: "#74b9ff", normal: "#95afc0",
   poison: "#6c5ce7", psychic: "#a29bfe", rock: "#2d3436",
   water: "#0190FF"
 };
 let currentPage = 1;
 const perPage = 12;
 let allPokemon = [];
 let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
 let darkMode = false;
 const header = document.createElement("div");
 header.className = "header";
 const title = document.createElement("h1");
 title.textContent = "Pokédex";
 const controls = document.createElement("div");
 controls.className = "controls";
 const input = document.createElement("input");
 input.placeholder = "Search Pokémon";
 const toggleDark = document.createElement("button");
 toggleDark.textContent = "Toggle Dark Mode";
 controls.appendChild(input);
 controls.appendChild(toggleDark);
 header.appendChild(title);
 header.appendChild(controls);
 document.body.appendChild(header);
 const cards = document.createElement("div");
cards.id = "cards";
 document.body.appendChild(cards);
 const pagination = document.createElement("div");
 pagination.className = "pagination";
 document.body.appendChild(pagination);
 const toggleFavorite = (name, btn) => {
   if (favorites.includes(name)) {
     favorites = favorites.filter(fav => fav !== name);
   } else {
     favorites.push(name);
   }
   localStorage.setItem("favorites", JSON.stringify(favorites));
   btn.classList.toggle("active");
 };
 const renderCard = (pokemon) => {
   const card = document.createElement("div");
   card.className = "card";
   card.innerHTML = `
<img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
<h3>${pokemon.name}</h3>
<div class="types"></div>
<div class="favorite ${favorites.includes(pokemon.name) ? "active" : ""}">♥</div>
   `;
   const typesDiv = card.querySelector(".types");
   pokemon.types.forEach(t => {
     const span = document.createElement("span");
     span.className = "type";
     span.style.backgroundColor = typeColor[t.type.name] || "#777";
     span.textContent = t.type.name;
     typesDiv.appendChild(span);
   });
   const favBtn = card.querySelector(".favorite");
   favBtn.addEventListener("click", () => toggleFavorite(pokemon.name, favBtn));
   cards.appendChild(card);
 };
 const renderPagination = (total) => {
   pagination.innerHTML = "";
   const totalPages = Math.ceil(total / perPage);
   for (let i = 1; i <= totalPages; i++) {
     const btn = document.createElement("button");
     btn.textContent = i;
     if (i === currentPage) btn.disabled = true;
     btn.addEventListener("click", () => {
       currentPage = i;
       displayPage();
     });
     pagination.appendChild(btn);
   }
 };
 const displayPage = () => {
   const start = (currentPage - 1) * perPage;
   const end = start + perPage;
   const visible = allPokemon.slice(start, end);
   cards.innerHTML = "";
   visible.forEach(p => fetch(`https://pokeapi.co/api/v2/pokemon/${p.name}`)
     .then(res => res.json())
     .then(data => renderCard(data))
   );
   renderPagination(allPokemon.length);
 };
 const fetchPokemonList = () => {
   fetch("https://pokeapi.co/api/v2/pokemon?limit=200")
     .then(res => res.json())
     .then(data => {
       allPokemon = data.results;
       displayPage();
     });
 };
 input.addEventListener("input", () => {
   const query = input.value.toLowerCase();
   const filtered = allPokemon.filter(p => p.name.includes(query));
   currentPage = 1;
   cards.innerHTML = "";
   filtered.slice(0, perPage).forEach(p => {
     fetch(`https://pokeapi.co/api/v2/pokemon/${p.name}`)
       .then(res => res.json())
       .then(data => renderCard(data));
   });
   renderPagination(filtered.length);
 });
 toggleDark.addEventListener("click", () => {
   darkMode = !darkMode;
   document.body.classList.toggle("dark-mode", darkMode);
 });
 fetchPokemonList();