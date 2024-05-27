let worldLibraryUrl =
  "https://www.googleapis.com/books/v1/volumes";
let localLibraryUrl = "http://localhost:8001/books";
const elementBooksList = document.querySelector(".books-list");
const elementBookCard = document.querySelector(".book-card");

let next = 1;
let previous;

showBookByPage(next);

async function showBookByPage(pageNum) {
  elementBooksList.innerHTML = "";
  const response = await axios.get(`${localLibraryUrl}?_page=${pageNum}`);
  const booksArray = response.data.data;
  console.log(response.data);
  next = response.data.next;
  previous = response.data.prev;
  for (const book of booksArray) {
    elementBooksList.innerHTML += `<li>${book.name}</li>`;
  }
  const liNodeList = document.querySelectorAll("li");

  liNodeList.forEach((li, i) => {
    li.onclick = () => showBookCard(booksArray[i]);
  });
  showBookCard(booksArray[0]);
}

function nextPage() {
  if (next !== null) showBookByPage(next);
}

function previousPage() {
  if (previous !== null) showBookByPage(previous);
}

function showBookCard(book) {
  elementBookCard.innerHTML = "";

  elementBookCard.innerHTML += `<img src="${book.image}"></img>`;
  elementBookCard.innerHTML += `<p id = ${book.id}><h3>ID:</h3> ${book.id}</p>`;
  elementBookCard.innerHTML += `<p><h3>Name:</h3> ${book.name}</p>`;
  elementBookCard.innerHTML += `<p> <h3>Author:</h3> ${book.author}</p>`;
  elementBookCard.innerHTML += `<p><h3>Pages:</h3> ${book.num_pages}</p>`;
  elementBookCard.innerHTML += `<p> <h3>Descriotion:</h3> ${book.short_description}</p>`;
  elementBookCard.innerHTML += `<p><h3>Copies:</h3> ${book.num_copies}</p>`;
  elementBookCard.innerHTML += `<p> <h3>Categories:</h3> ${book.categories}</p>`;
  elementBookCard.innerHTML += `<p> <h3>ISBN:</h3> ${book.ISBN}</p>`;
  elementBookCard.innerHTML += `<div class="book-card-buttons">
  <button class = "delete-button">Delete book</button>
  <button class = "Increment-button">Increment copies</button>
  <button class = "Decrement-button">Decrement copies</button>
  </div>`

  

  const elemDeleteButton = document.querySelector(".delete-button");
  const elemIncrementButton = document.querySelector(".Increment-button");
  const elemDecrementButton = document.querySelector(".Decrement-button");

  elemDeleteButton.onclick = () => deleteBook(book.id);
  elemIncrementButton.onclick = () => incrementBook(book.id, book.num_copies);
  elemDecrementButton.onclick = () => decrementBook(book.id, book.num_copies);
}

function deleteBook(id) {
  axios.delete(`${localLibraryUrl}/${id}`);
}

function incrementBook(id, copies) {
  axios.patch(`${localLibraryUrl}/${id}`, { num_copies: copies + 1 });
}
function decrementBook(id, copies) {
  axios.patch(`${localLibraryUrl}/${id}`, { num_copies: copies - 1 });
}

// fetch books from google API
async function fetchBooks(startIndex, maxResultsNum) {
  const params = {
      q: "a",
      key: 'AIzaSyAj03UVAQuKO-sABUxmqOPr8gMxJrna9TQ',
      maxResults: maxResultsNum,
      startIndex: startIndex,
      langRestrict: 'en'
  };

  try {
      const response = await axios.get(worldLibraryUrl, { params });
      return response.data.items;
  } catch (error) {
      console.error('Error fetching books:', error);
      return [];
  }
}

async function fetchMultiplePages() {
  let allBooks = [];
  const maxResultsNum = 40;
  for (let page = 0; page < 1; page++) {
      const startIndex = page * maxResultsNum; 
      const books = await fetchBooks(startIndex, maxResultsNum);
      allBooks = allBooks.concat(books);
  }

   for (const book of allBooks){
    const volumeInfo = book.volumeInfo || {};
    const postData = {
    name: volumeInfo.title || "No Title",
    author: volumeInfo.authors ? volumeInfo.authors[0] : "Unknown",
    num_pages: volumeInfo.pageCount || 0,
    short_description: volumeInfo.description || "No Description",
    image:
      (volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail) ||
      "https://example.com/no-image.jpg",
    num_copies: 5,
    categories: volumeInfo.categories || ["Uncategorized"],
    ISBN: volumeInfo.industryIdentifiers
      ? volumeInfo.industryIdentifiers[0].identifier
      : "None",
  }
      await axios.post(localLibraryUrl, postData);
   }   
}