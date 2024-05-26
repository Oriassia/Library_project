let worldLibraryUrl = "https://www.googleapis.com/books/v1/volumes?q=a&key=AIzaSyAj03UVAQuKO-sABUxmqOPr8gMxJrna9TQ";
        let localLibraryUrl = "http://localhost:8001/books";

        async function fetchBooks(startIndex) {
            try {
                const response = await axios.get(`${worldLibraryUrl}&startIndex=${startIndex}&maxResults=40`);
                return response.data.items || [];
            } catch (error) {
                console.error('Error fetching books:', error);
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
                    await axios.post (localLibraryUrl, {
                        name: volumeInfo.title || 'No Title',
                        author: volumeInfo.authors ? volumeInfo.authors[0] : 'Unknown',
                        num_pages: volumeInfo.pageCount || 0,
                        short_description: volumeInfo.description || 'No Description',
                        image: (volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail) || 'https://example.com/no-image.jpg',
                        num_copies: 5,
                        categories: volumeInfo.categories || ['Uncategorized'],
                        ISBN: volumeInfo.industryIdentifiers ? volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10' || id.type === 'ISBN_13')?.identifier : "N/A"
                    });
                    booksCounter ++;
                    if (booksCounter >= 100) {
                        break;
                    }
                }

                startIndex += 40; // Move to the next set of books
            }

            console.log(booksArray);
            return booksArray;
        }