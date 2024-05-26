let worldLibraryUrl = "https://www.googleapis.com/books/v1/volumes?q=a&key=AIzaSyAj03UVAQuKO-sABUxmqOPr8gMxJrna9TQ"
let localLibraryUrl = "http://localhost:8001/books"

const maxBooks = 10; // Maximum number of books to fetch

async function postBooksData() {
    let totalBooks = 0;
    let startIndex = 1
    while(totalBooks < maxBooks){
        const items = await fetchBooks(startIndex);
        for (let item of items) {
            const volumeInfo = item.volumeInfo || {};
            await axios.post(localLibraryUrl,{
                name: volumeInfo.title || 'No Title',
                author: volumeInfo.authors[0] || 'Unknown',
                num_pages: volumeInfo.pageCount || 0,
                short_description: volumeInfo.description || 'No Description',
                image: (volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail) || 'https://example.com/no-image.jpg',
                num_copies: 5, // Default number of copies
                categories: volumeInfo.categories || ['Uncategorized'],
                ISBN: volumeInfo.industryIdentifiers ? volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10' || id.type === 'ISBN_13')?.identifier : 'N/A'
            });
            totalBooks ++;
            if (totalBooks >= maxBooks) break;
        }
        startIndex += 10; // Move to the next set of books
    }
}


async function fetchBooks(startIndex) {
    try {
        const response = await axios.get(`${worldLibraryUrl}&startIndex=${startIndex}`);
        return response.data.items || [];
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
}

    // postBooksData()