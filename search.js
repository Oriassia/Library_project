let filterArray = [];
let indexContainer = 0;
let pageToStart = 1;
let searchPage = 1;
let searchNext;
let searchPrev;
let searchValue;

async function searchPerPage(substring, searchPage) {
  for (let page = pageToStart; page < totalPages + 1; page++) {
    const response = await axios.get(`${localLibraryUrl}?_page=${page}`); // בקשת גט מקבל מערך של 10 ספרים לפי דף
    const booksArray = response.data.data; // המערך המתקבל

    for (let i = indexContainer; i < booksArray.length; i++) {
      if (booksArray[i].name.includes(substring)) {
        await axios.post(searchUrl, {
          name: `${booksArray[i].name}`,
          author: `${booksArray[i].author}`,
          pages: `${booksArray[i].pages}`,
          description: `${booksArray[i].description}`,
          copies: `${booksArray[i].copies}`,
          categories: `${booksArray[i].categories}`,
          ISBN: `${booksArray[i].ISBN}`,
        });
      }
      const result = await axios
        .get(`${searchUrl}?_page=${searchPage}`)
        .then((result) => result);
      filterArray = result.data.data;
      searchNext = result.data.next;
      searchPrev = result.data.prev;

      if (filterArray.length == 10) {
        indexContainer = i + 1;
        pageToStart = page;
        searchPage++;
        printSearchList(filterArray);
        return;
      }
    }
  }
}

function printSearchList(array) {
  for (const book of array) {
    elementBooksList.innerHTML += `<li>${book.name}</li>`;
  }
  const liNodeList = document.querySelectorAll("li");

  liNodeList.forEach((li, i) => {
    li.onclick = () => showBookCard(array[i]);
  });
}

async function searchBar() {
  elementBooksList.innerHTML = "";
  switchAttribute();
  const elementSearchInput = document.querySelector(".search-bar-input");
  searchValue = elementSearchInput.value;
  await searchPerPage(searchValue, 1);
}

function switchAttribute() {
  const elemNext = document.querySelector(".next");
  const elemPrev = document.querySelector(".prev");
  elemNext.removeAttribute("onclick");
  elemPrev.removeAttribute("onclick");
  elemNext.setAttribute("onclick", "nextPageSaerch()");
  elemPrev.setAttribute("onclick", "previousPageSearch()");
}
function nextPageSaerch() {
  if (next !== null) searchPerPage(searchValue, searchNext);
}

function previousPageSearch() {
  if (previous !== null) searchPerPage(searchValue, searchPrev);
}
