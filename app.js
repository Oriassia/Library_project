let worldLibraryUrl = "https://www.googleapis.com/books/v1/volumes?q=a&key=AIzaSyAj03UVAQuKO-sABUxmqOPr8gMxJrna9TQ"
let localLibraryUrl = "http://localhost:8001/books"

const maxBooks = 200; // Maximum number of books to fetch

async function postBooksData() {
    let totalBooks = 0;
    let startindex = 1
    while(totalBooks < maxBooks){
        const items = await fetchBooks(startindex);
        startindex += 40 ;
        for (const item of items) {
            const volumeInfo = item.volumeInfo || {};
            axios.post(localLibraryUrl,{
                name: volumeInfo.title || 'No Title',
                author: volumeInfo.authors[0] || 'Unknown',
                num_pages: volumeInfo.pageCount || 0,
                short_description: volumeInfo.description || 'No Description',
                image: (volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail) || 'https://example.com/no-image.jpg',
                num_copies: 5, // Default number of copies
                categories: volumeInfo.categories || ['Uncategorized'],
                ISBN: volumeInfo.industryIdentifiers ? volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10' || id.type === 'ISBN_13')?.identifier : 'N/A'
            });
            totalBooks += 40;
            if (totalBooks >= maxBooks) break;
        }
        if (totalBooks >= maxBooks) break;
    }
}


async function fetchBooks(startindex){
       return await axios.get(`${worldLibraryUrl}&startIndex=${startindex}`)
    }


