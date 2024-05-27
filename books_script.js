let worldLibraryUrl =
  "https://www.googleapis.com/books/v1/volumes";
let localLibraryUrl = "http://localhost:8001/books";

const elementBooksList = document.querySelector(".books-list");
const elementBookCard = document.querySelector(".book-card");
const elemetSearchButton = document.querySelector(".fa-magnifying-glass");

let filterArray = [];
let next = 1;
let previous;
let totalPages;
let pageToStart = next;

inIt();
function inIt() {
  showBookByPage(next);
  elemetSearchButton.addEventListener("click", searchBar);
}

async function showBookByPage(pageNum) {
  elementBooksList.innerHTML = "";
  const response = await axios.get(`${localLibraryUrl}?_page=${pageNum}`);
  const booksArray = response.data.data;
  console.log(response.data);
  next = response.data.next;
  previous = response.data.prev;
  totalPages = response.data.pages;
  printList(booksArray);
  showBookCard(booksArray[0]);
}

function printList(array) {
  for (const book of array) {
    elementBooksList.innerHTML += `<li>${book.name}</li>`;
  }
  const liNodeList = document.querySelectorAll("li");

  liNodeList.forEach((li, i) => {
    li.onclick = () => showBookCard(array[i]);
  });
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

  elemDeleteButton.onclick = () => {
    deleteBook(book.id);
    addToHistory("delete", book);
};

elemIncrementButton.onclick = () => {
    incrementBook(book.id, book.num_copies);
    addToHistory("Increment", book);
};

elemDecrementButton.onclick = () => {
    decrementBook(book.id, book.num_copies);
    addToHistory("Decrement", book);
};
}

async function addToHistory(action, book){
  const postData = {
    "image":book.image,
    "bookName": book.name,
    "ISBN": book.ISBN,
    "action": action,
    "date": getCurrentDateTime()
  }
  await axios.post("http://localhost:8001/history",postData)
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

async function searchPerPage(substring, pageToStart, endOfSearch) {
  let holder = [];

  for (let page = pageToStart; page < totalPages + 1; page++) {
    const response = await axios.get(`${localLibraryUrl}?_page=${page}`);
    const booksArrayByPage = response.data.data;

    holder = booksArrayByPage.filter((book) => book.name.includes(substring));
    for (const item of holder) {
      filterArray.push(item);
    }
    if (filterArray.length >= endOfSearch * 10) {
      console.log(filterArray);
      return filterArray;
    }
  }
  console.log(filterArray);
  return filterArray;
}

async function searchBar() {
  elementBooksList.innerHTML = "";
  let endOfSearch = 1;
  const elementSearchInput = document.querySelector(".search-bar-input");
  const searchValue = elementSearchInput.value;
  filterArray = await searchPerPage(searchValue, pageToStart, endOfSearch);
  printList(filterArray);
  filterArray = [];
}

function getCurrentDateTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}
