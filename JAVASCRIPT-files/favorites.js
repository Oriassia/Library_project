
showFavorites();

async function showFavorites() {
  try {
    const response = await axios.get("http://localhost:8001/favorites");
    const favoritesData = response.data;
    console.log(favoritesData);
    const favoritesGridElem = document.querySelector(".favorites-grid");
    favoritesGridElem.innerHTML = "";

    for (const book of favoritesData) {
      favoritesGridElem.innerHTML += `<div class = "singal-favorite-card shadow" >
        <i class="fa-solid fa-star"></i>  
        <img class = "shadow"  src="${book.image}" alt="">
          <div>
          <p><h3>Name:</h3> ${stringLengthLimit(book.name, 30)}</p>
          <p><h3>Author:</h3> ${book.author}</p>
          <p><h3>ISBN:</h3> ${book.ISBN}
              : "None"
          }</p>
          </div>
          <button onclick="removeFavoriteFromData('${
            book.id
          }')" >Remove book</button>
        </div>`;
    }
  } catch (error) {
    // console.error("Error fetching :", error);
  }
}

function stringLengthLimit(str, maxLength) {
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}

async function removeFavoriteFromData(bookId) {
  try {
    await axios.delete(`http://localhost:8001/favorites/${bookId}`);
  } catch (error) {
    console.error("Error removing favorite book:", error);
  }
}
