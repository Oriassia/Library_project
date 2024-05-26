let worldLibraryUrl =
  "https://www.googleapis.com/books/v1/volumes?q=a&key=AIzaSyAj03UVAQuKO-sABUxmqOPr8gMxJrna9TQ";
let localLibraryUrl = "http://localhost:8001/books";
const elementBooksList = document.querySelector(".books-list");
const elementBookCard = document.querySelector(".book-card");

let next = 1;

showBookByPage(next);
async function showBookByPage(next) {
  elementBooksList.innerHTML = "";
  const response = await axios.get(`${localLibraryUrl}?_page=${next}`);
  const booksArray = response.data.data;
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
  elementBookCard.innerHTML += `<p id = ${book.id}><h3>ID:</h3> ${book.id}</p>`;
  elementBookCard.innerHTML += `<p><h3>Name:</h3> ${book.name}</p>`;
  elementBookCard.innerHTML += `<p> <h3>Author:</h3> ${book.author}</p>`;
  elementBookCard.innerHTML += `<p><h3>Pages:</h3> ${book.num_pages}</p>`;
  elementBookCard.innerHTML += `<p> <h3>Descriotion:</h3> ${book.short_description}</p>`;
  elementBookCard.innerHTML += `<p><h3>Copies:</h3> ${book.num_copies}</p>`;
  elementBookCard.innerHTML += `<p> <h3>Categories:</h3> ${book.categories}</p>`;
  elementBookCard.innerHTML += `<p> <h3>ISBN:</h3> ${book.ISBN}</p>`;
  elementBookCard.innerHTML += `<button>Delete book</button>`;
  elementBookCard.innerHTML += `<button>Increment copies</button>`;
  elementBookCard.innerHTML += `<button>Decrement copies</button>`;
}

async function fetchBooks(startIndex) {
  try {
    const response = await axios.get(
      `${worldLibraryUrl}&startIndex=${startIndex}&maxResults=40`
    );
    return response.data.items || [];
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
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
