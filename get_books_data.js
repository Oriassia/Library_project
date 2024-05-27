const maxBooks = 100; // Maximum number of books to fetch

async function postBooksData() {
  let totalBooks = 0;
  let startIndex = 0; // Adjusted to start from 0

  while (totalBooks < maxBooks) {
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
        num_copies: 5, // Default number of copies
        categories: volumeInfo.categories || ["Uncategorized"],
        ISBN: volumeInfo.industryIdentifiers
          ? volumeInfo.industryIdentifiers.find(
              (id) => id.type === "ISBN_10" || id.type === "ISBN_13"
            )?.identifier
          : "N/A",
      });

      totalBooks++;
      if (totalBooks >= maxBooks) break;
    }

    startIndex += Math.min(maxBooks, 40); // Move to the next set of books
  }
}

async function fetchBooks(startIndex) {
  try {
    const response = await axios.get(
      `${worldLibraryUrl}&startIndex=${startIndex}&maxResults=${maxBooks}`
    );
    return response.data.items || [];
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}
