document.addEventListener("DOMContentLoaded", function () {
    const cardsContainer = document.querySelector(".cards-container");

    function formatPrice(price) {
        return new Intl.NumberFormat("ru-RU").format(price);
    }

    function createProductCard(product) {
        return `
        <div class="product-card">
          <img
            src="${product.image}"
            alt="${product.title}"
            class="product-card__image"
          />
          <div class="product-card__info">
            <div class="product-info__category">${product.category}</div>
            <h3 class="product-info__title">${product.title}</h3>
            <p class="product-info__price">
              ${formatPrice(product.price)}
              <span class="product-info__price-currency">₽</span>
            </p>
          </div>
          <button class="product-card__favorite-button">
            <svg width="24" height="24">
              <use href="#heart-off"></use>
            </svg>
          </button>
        </div>
      `;
    }

    fetch(
        "https://products-qn4pgbgk1-orlovwebdevgmailcoms-projects.vercel.app/products.json"
    )
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((products) => {
            cardsContainer.innerHTML = "";

            products.forEach((product) => {
                cardsContainer.insertAdjacentHTML(
                    "beforeend",
                    createProductCard(product)
                );
            });

            setupFavoriteButtons();
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
            cardsContainer.innerHTML =
                '<p class="error-message">Не удалось загрузить товары. Пожалуйста, попробуйте позже.</p>';
        });

    function setupFavoriteButtons() {
        document
            .querySelectorAll(".product-card__favorite-button")
            .forEach((button) => {
                button.addEventListener("click", function () {
                    this.classList.toggle("active");
                    const useElement = this.querySelector("use");
                    if (this.classList.contains("active")) {
                        useElement.setAttribute("href", "#heart-on");
                    } else {
                        useElement.setAttribute("href", "#heart-off");
                    }
                });
            });
    }
});
