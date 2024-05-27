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





async function fetchBooks(startIndex = 0, maxResults = 10) {
  const params = {
      q: "a",
      key: 'AIzaSyAj03UVAQuKO-sABUxmqOPr8gMxJrna9TQ',
      maxResults: maxResults,
      startIndex: startIndex
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
  for (let page = 0; page < 1; page++) {
      const startIndex = page * 10; // Assuming 40 results per page
      const books = await fetchBooks(startIndex);
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















async function postFirstBooks() {
  let booksCounter = 0;
  let startIndex = 0;

  while (booksCounter < 100) {
    const items = await fetchBooks(startIndex);
    if (!items || items.length === 0) {
      break;
    }
    for (const item of items) {
      const volumeInfo = item.volumeInfo || {};
      await axios.post(localLibraryUrl, {
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
      });
      booksCounter++;
      if (booksCounter >= 100) {
        break;
      }
    }
    startIndex += 40; // Move to the next set of books
  }
}






const inputField = document.getElementById("input");
const btnSearch = document.getElementById("search");
const url = "http://localhost:8001/books";
const apiKey = 'AIzaSyCTA9wuo8lvoUDxqDt_WYsebCsbSYoHoUY';

btnSearch.addEventListener("click", async () => {
    for (let page = 0; page < 10; page++) {
        await getBookToAdd('https://www.googleapis.com/books/v1/volumes', {
            key: apiKey,
            startIndex: page,
            maxResults: 40,
            q: inputField.value,
            langRestrict: 'en'
        });
    }
});

async function getBookToAdd(apiUrl, params) {
    try {
        const response = await axios.get(apiUrl, { params });
        const books = response.data.items;
        for (const book of books) {
            if (book.volumeInfo.language.toLowerCase() === "en") {
                const bookDetails = book.volumeInfo;
                await addBookToData(bookDetails); // Ensure each book is processed before moving to the next
            }
        }
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

async function addBookToData(element) {
    try {
        const exists = await check_if_exists(element.title); // boolean
        if (exists) {
            // console.log("Duplicate book:", element.title);
        } else {
            const elementToPush = {
                "title": element.title,
                "authors": element.authors,
                "numPages": element.pageCount,
                "description": element.description,
                "imageLink": {
                    small: element.imageLinks.smallThumbnail,
                    big: element.imageLinks.thumbnail
                },
                "categories": [element.categories],
                "ISBN": element.industryIdentifiers
            };
            const res = await axios.post(url, elementToPush);
            console.log('Book added:', res.data);
        }
    } catch (error) {
        console.error('Error adding book:', error);
    }
}

async function check_if_exists(title) {
    try {
        const response = await axios.get(url);
        const myBooks = response.data;
        for (const book of myBooks) {
            if (book.title.toLowerCase() === title.toLowerCase()) {
                return true;
            }
        }
        return false;
    } catch (error) {
        throw error;
    }
}

async function displayMyBooks(){
    try {
        const respnse = await axios.get(url);
        const myBooks = respnse.data;
        console.log(myBooks);
    } catch (error) {
        console.log(error);
    }
}
displayMyBooks();