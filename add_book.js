const form = document.querySelector(".add-book-form");
const bookNameInput = document.querySelector("#name");
const authorInput = document.querySelector("#author");
const numPagesInput = document.querySelector("#num_pages");
const shortDescriptionTextarea = document.querySelector("#short_description");
const imageLinkInput = document.querySelector("#image-link");
const numCopiesInput = document.querySelector("#num_copies");
const categoriesInput = document.querySelector("#categories");
const isbnInput = document.querySelector("#ISBN");

async function createNewBook(event) {
  event.preventDefault(); // Prevent form from submitting normally
  const postData = {
    name: bookNameInput.value || "No Title",
    author: authorInput.value || "Unknown",
    num_pages: numPagesInput.value || 0,
    short_description: shortDescriptionTextarea.value || "No Description",
    image: imageLinkInput.value || "https://example.com/no-image.jpg",
    num_copies: numCopiesInput.value,
    categories: categoriesInput.value || ["Uncategorized"],
    ISBN: isbnInput.value || "None",
  };
  await axios.post(localLibraryUrl, postData);
}

// async function addBookToData(postData) {
// }

function adjustHeight(element) {
  element.style.height = "auto";
  element.style.height =
    (element.scrollHeight > 200 ? 200 : element.scrollHeight) + "px";
}

function addBookFromGoogle() {}

const elementInputValue = document.querySelector(
  ".search-book-from-google-input"
);
const elementSelect = document.querySelector("#add-book");
const elementCard = document.querySelector(".add-book-card");

async function searchBookFromGoogle() {
  let response;
  if (elementSelect.value == "book-name") {
    response = await fetchBooks(elementInputValue.value);
  } else {
    response = await fetchBooks(`isbn:${elementInputValue.value}`);
  }
  console.log(response);
  printList(response);
  elementCard.style.display = "grid";
}

function printList(array) {
  elementCard.innerHTML = "";
  for (const book of array) {
    elementCard.innerHTML += `<div class = "singal-book-card shadow" >
          <img class = "shadow"  src="${
            book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail
          }" alt="">
          <div>
          <p><h3>Name:</h3> ${stringLengthLimit(book.volumeInfo.title, 30)}</p>
          <p><h3>Author:</h3> ${book.volumeInfo.authors}</p>
          <p><h3>ISBN:</h3> ${
            book.volumeInfo.industryIdentifiers
              ? book.volumeInfo.industryIdentifiers[0].identifier
              : "None"
          }</p>
          </div>
          <button class = "add-book-button">Add Book</button>
        </div>`;
  }
  const liNodeList = elementCard.querySelectorAll(".add-book-button");

  liNodeList.forEach((button, i) => {
    button.onclick = () => addBookToData(array[i]);
  });
}

async function fetchBooks(search) {
  const params = {
    q: `${search}`,
    key: "AIzaSyAj03UVAQuKO-sABUxmqOPr8gMxJrna9TQ",
    maxResults: 6,
    startIndex: 0,
    langRestrict: "en",
  };

  try {
    const response = await axios.get(worldLibraryUrl, { params });
    console.log(response.data.items.volumeInfo);
    return response.data.items;
  } catch (error) {
    console.error("Error fetching books:", error);
    elementCard.innerHTML = `<p>Not Found</p>`;
    return [];
  }
}

async function addBookToData(book) {
  const bookToPost = {
    name: book.volumeInfo.title || "No Title",
    author: book.volumeInfo.authors ? book.volumeInfo.authors[0] : "Unknown",
    num_pages: book.volumeInfo.pageCount || 0,
    short_description: book.volumeInfo.description || "No Description",
    image:
      (book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail) ||
      "https://example.com/no-image.jpg",
    num_copies: 5,
    categories: book.volumeInfo.categories || ["Uncategorized"],
    ISBN: book.volumeInfo.industryIdentifiers
      ? book.volumeInfo.industryIdentifiers[0].identifier
      : "None",
  };
  await axios
    .post(localLibraryUrl, bookToPost)
    .then(addToHistory("add new book", bookToPost));
}
