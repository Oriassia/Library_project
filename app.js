const url = "http://localhost:8001/books?_page=";
const elementBooksList = document.querySelector(".books-list");
const elementBookCard = document.querySelector(".book-card");

let next = 1;
showBookByPage(next);
async function showBookByPage(next) {
  elementBooksList.innerHTML = "";
  const response = await axios.get(`${url}${next}`);
  const booksArray = response.data.data;
  console.log(booksArray);
  for (const book of booksArray) {
    elementBooksList.innerHTML += `<li>${book.name}</li>`;
  }
  showBookCard(booksArray[0]);
}
function nextPage() {
  next++;
  showBookByPage(next);
}
function previousPage() {
  if (next > 1) {
    next--;
  }
  showBookByPage(next);
}

function showBookCard(book) {
  elementBookCard.innerHTML = "";

  elementBookCard.innerHTML += `<img src="${book.image}"></img>`;
  elementBookCard.innerHTML += `<p><h3>Name:</h3> ${book.name}</p>`;
  elementBookCard.innerHTML += `<p> <h3>Author:</h3> ${book.author}</p>`;
  elementBookCard.innerHTML += `<p><h3>Pages:</h3> ${book.num_pages}</p>`;
  elementBookCard.innerHTML += `<p> <h3>Descriotion:</h3> ${book.short_description}</p>`;
  elementBookCard.innerHTML += `<p><h3>Copies:</h3> ${book.num_copies}</p>`;
  elementBookCard.innerHTML += `<p> <h3>Categories:</h3> ${book.categories}</p>`;
}
