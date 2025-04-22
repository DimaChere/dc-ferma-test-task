document.addEventListener("DOMContentLoaded", function () {
    const cardsContainer = document.querySelector(".cards-container");
    const minPriceInput = document.getElementById("min-price");
    const maxPriceInput = document.getElementById("max-price");
    const filterPriceBtn = document.getElementById("filter-price");
    const categorySelect = document.getElementById("category-select");
    const categoryCheckboxes = document.getElementById("category-checkboxes");
    const sortPriceBtn = document.getElementById("sort-price");

    let productsData = [];
    let filteredProducts = [];
    let sortAscending = true;
    let selectedCategories = [];
    let favorites = JSON.parse(localStorage.getItem("favorites")) || {};

    function formatPrice(price) {
        return new Intl.NumberFormat("ru-RU").format(price);
    }

    function createProductCard(product) {
        const isFavorite = favorites[product.id] || false;
        return `
        <div class="product-card" data-id="${product.id}">
            <img src="${
                product.image
            }" alt="${product.title}" class="product-card__image">
            <div class="product-card__info">
                <div class="product-info__category">${product.category}</div>
                <h3 class="product-info__title">${product.title}</h3>
                <p class="product-info__price">
                    ${formatPrice(product.price)}
                    <span class="product-info__price-currency">₽</span>
                </p>
            </div>
            <button class="product-card__favorite-button ${
                isFavorite ? "active" : ""
            }">
                <svg width="24" height="24"><use href="${
                    isFavorite ? "#heart-on" : "#heart-off"
                }"></use></svg>
            </button>
        </div>`;
    }

    function renderProducts(products) {
        cardsContainer.innerHTML = "";
        products.forEach((product) => {
            cardsContainer.insertAdjacentHTML(
                "beforeend",
                createProductCard(product)
            );
        });
        setupFavoriteButtons();
    }

    function setupFavoriteButtons() {
        document
            .querySelectorAll(".product-card__favorite-button")
            .forEach((button) => {
                button.addEventListener("click", function () {
                    const productId = this.closest(".product-card").dataset.id;
                    const isActive = this.classList.toggle("active");
                    const useElement = this.querySelector("use");

                    useElement.setAttribute(
                        "href",
                        isActive ? "#heart-on" : "#heart-off"
                    );

                    if (isActive) {
                        favorites[productId] = true;
                    } else {
                        delete favorites[productId];
                    }
                    localStorage.setItem(
                        "favorites",
                        JSON.stringify(favorites)
                    );
                });
            });
    }

    function applyFilters() {
        const minPrice = parseFloat(minPriceInput.value) || 0;
        const maxPrice = parseFloat(maxPriceInput.value) || Infinity;

        filteredProducts = productsData.filter((product) => {
            const priceMatch =
                product.price >= minPrice && product.price <= maxPrice;
            const categoryMatch =
                selectedCategories.length === 0 ||
                selectedCategories.includes(product.category);
            return priceMatch && categoryMatch;
        });

        renderProducts(filteredProducts);
    }

    function handleSelectChange() {
        selectedCategories = categorySelect.value ? [categorySelect.value] : [];
        updateCheckboxes();
        applyFilters();
    }

    function handleCheckboxChange() {
        const checkboxes = document.querySelectorAll(
            ".category-checkbox:checked"
        );
        selectedCategories = Array.from(checkboxes).map((cb) => cb.value);
        updateSelect();
        applyFilters();
    }

    function updateSelect() {
        if (selectedCategories.length === 1) {
            categorySelect.value = selectedCategories[0];
        } else {
            categorySelect.value = "";
        }
    }

    function updateCheckboxes() {
        document.querySelectorAll(".category-checkbox").forEach((checkbox) => {
            checkbox.checked = selectedCategories.includes(checkbox.value);
        });
    }

    function sortProducts() {
        sortAscending = !sortAscending;
        sortPriceBtn.textContent = `по ${
            sortAscending ? "возрастанию" : "убыванию"
        }`;
        filteredProducts.sort((a, b) =>
            sortAscending ? a.price - b.price : b.price - a.price
        );
        renderProducts(filteredProducts);
    }

    function populateCategories(products) {
        const categories = [
            ...new Set(products.map((product) => product.category)),
        ];

        categorySelect.innerHTML = '<option value="">Все категории</option>';
        categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        categoryCheckboxes.innerHTML = "";
        categories.forEach((category) => {
            const checkboxId = `category-${category.replace(/\s+/g, "-")}`;
            const container = document.createElement("div");
            container.className = "checkbox-container";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = checkboxId;
            checkbox.className = "category-checkbox";
            checkbox.value = category;

            const label = document.createElement("label");
            label.htmlFor = checkboxId;
            label.textContent = category;

            container.appendChild(checkbox);
            container.appendChild(label);
            categoryCheckboxes.appendChild(container);
        });
    }

    fetch(
        "https://products-qn4pgbgk1-orlovwebdevgmailcoms-projects.vercel.app/products.json"
    )
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((products) => {
            productsData = products.map((product, index) => ({
                ...product,
                id: product.id || `product-${index}`,
            }));

            filteredProducts = [...productsData];
            renderProducts(filteredProducts);
            populateCategories(productsData);
        })
        .catch(() => {
            cardsContainer.innerHTML =
                '<p class="error-message">Не удалось загрузить товары</p>';
        });

    filterPriceBtn.addEventListener("click", applyFilters);
    categorySelect.addEventListener("change", handleSelectChange);
    categoryCheckboxes.addEventListener("change", handleCheckboxChange);
    sortPriceBtn.addEventListener("click", sortProducts);
});
