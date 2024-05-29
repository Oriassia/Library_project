let worldLibraryUrl = "https://www.googleapis.com/books/v1/volumes";
let localLibraryUrl = "http://localhost:8001/books";
let searchUrl = "http://localhost:8001/search";

const elementBooksList = document.querySelector(".books-list");
const elementBookCard = document.querySelector(".book-card");

let filterArray = [];
let next = 1;
let previous;
let totalPages;

inIt();
function inIt() {
  showBookByPage(next);
}

async function showBookByPage(pageNum) {
  const response = await axios.get(
    `${localLibraryUrl}?_page=${pageNum}&_per_page=5`
  );
  const booksArray = response.data.data;
  console.log(response.data.data);
  next = response.data.next;
  previous = response.data.prev;
  totalPages = response.data.pages;
  printList(booksArray);
  showBookCard(booksArray[0]);
}

function printList(array) {
  elementBooksList.innerHTML = "";
  for (const book of array) {
    elementBooksList.innerHTML += `<li>
    <img class = "shadow"  src="${book.image}" alt="">
    <div>
    <p><h3>Name:</h3> ${book.name}</p>
    <p><h3>Author:</h3> ${book.author}</p>
    </div>
    </li>`;
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
  elementBookCard.innerHTML += `
  <div><img class = "shadow"  src="${book.image}"></img></div>

  
  
  <div><p><h3>ID:</h3> ${book.id}</p></div>
  <div><p><h3>Name:</h3> ${book.name}</p></div>
  

   
  <div><p> <h3>Author:</h3> ${book.author}</p></div>
  <div> <p><h3>Pages:</h3> ${book.num_pages}</p></div>
  <div><p> <h3>Description:</h3> ${book.short_description}</p></div>
  <div> <p><h3>Copies:</h3> ${book.num_copies}</p></div>
  <div><p> <h3>Categories:</h3> ${book.categories}</p></div>
  <div><p> <h3>ISBN:</h3> ${book.ISBN}</p></div>
  

  
  <div>
  <button class = "delete-button">Delete book</button>
  <button class = "Increment-button">Increment copies</button>
  <button class = "Decrement-button">Decrement copies</button>
  </div>`;

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

async function addToHistory(action, book) {
  const postData = {
    image: book.image,
    bookName: book.name,
    ISBN: book.ISBN,
    action: action,
    date: getCurrentDateTime(),
  };
  await axios.post("http://localhost:8001/history", postData);
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
    key: "AIzaSyAj03UVAQuKO-sABUxmqOPr8gMxJrna9TQ",
    maxResults: maxResultsNum,
    startIndex: startIndex,
    langRestrict: "en",
  };

  try {
    const response = await axios.get(worldLibraryUrl, { params });
    return response.data.items;
  } catch (error) {
    console.error("Error fetching books:", error);
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

  for (const book of allBooks) {
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
    };
    addBookToData(postData);
  }
}

async function addBookToData(postData) {
  await axios.post(localLibraryUrl, postData);
}

function getCurrentDateTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

function buttonsToggle() {
  const nextPrevious = document.querySelector(".next-previous");
  const nextPreviousSearch = document.querySelector(".next-previous.search");

  if (nextPrevious) {
    nextPrevious.style.display = "none";
  }

  if (nextPreviousSearch) {
    nextPreviousSearch.style.display = "block";
  }
}
let currentInputValue = null;
let currentArrayIndex = 0;
let searchPageIndex = 1;
let totalBooksArray = [];
let currentBooksArray = [];
let totalSearchPages = 1;

// function searchPageToggle(action) {
//   if (totalBooksArray.length === 0) {
//     console.log("yessssssssss");
//     currentArrayIndex = 0;
//     printSearchList(currentArrayIndex);
//   } else {
//     switch (action) {
//       case "previous":
//         if (currentArrayIndex >= 1) {
//           currentArrayIndex--;
//         }
//         break;

//       default:
//         if (!totalBooksArray[currentArrayIndex + 1]) {
//           searchByInputTest().then(() => {
//             currentArrayIndex++;
//             printSearchList(currentArrayIndex);
//           });
//         } else {
//           currentArrayIndex++;
//           printSearchList(currentArrayIndex);
//         }
//         break;
//     }
//     printSearchList(currentArrayIndex);
//   }
// }

// function printSearchList(index) {
//   if (!totalBooksArray[index]) {
//     searchByInputTest().then(() => {
//       printSearchList(index);
//     });
//   } else {
//     elementBooksList.innerHTML = "";
//     for (const book of totalBooksArray[index]) {
//       elementBooksList.innerHTML += `<li>
//       <img class = "shadow"  src="${book.image}" alt="">
//       <div>
//       <p><h3>Name:</h3> ${book.name}</p>
//       <p><h3>Author:</h3> ${book.author}</p>
//       </div>
//       </li>`;
//     }
//     const liNodeList = document.querySelectorAll("li");

//     liNodeList.forEach((li, i) => {
//       li.onclick = () => showBookCard(array[i]);
//     });
//   }
// }

// async function searchByInputTest() {
//   buttonsToggle();

//   const inputValue = document.querySelector(".search-bar-input").value;
//   if (inputValue !== currentInputValue) {
//     // Reset if input value has changed
//     currentInputValue = inputValue;
//     searchPageIndex = 1;
//     totalBooksArray = [];
//     currentBooksArray = [];
//     currentArrayIndex = 0;
//   }

//   while (searchPageIndex <= totalSearchPages) {
//     const initialResponse = await axios.get(
//       `${localLibraryUrl}?_page=${searchPageIndex}`
//     );
//     totalSearchPages = initialResponse.data.pages;
//     const booksPage = initialResponse.data.data;
//     searchPageIndex++;

//     for (let book of booksPage) {
//       if (book.name.includes(inputValue)) {
//         if (currentBooksArray.length < 10) {
//           currentBooksArray.push(book);
//         } else {
//           totalBooksArray.push(currentBooksArray);
//           currentBooksArray = [book];
//         }
//       }
//     }

//     if (totalBooksArray[currentArrayIndex]) {
//       if (totalBooksArray[currentArrayIndex].length == 10) {
//         break;
//       }
//     }
//   }

//   if (currentBooksArray.length > 0) {
//     totalBooksArray.push(currentBooksArray);
//   }
// }

function stringLengthLimit(str, maxLength) {
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}
