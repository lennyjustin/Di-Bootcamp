interface Book {
    title: string;
    author: string;
    isbn: string;
    publishedYear: number;
    genre?: string;
}

class Library {
    private books: Book[] = [];

    public addBook(book: Book): void {
        this.books.push(book);
    }

    public getBookDetails(isbn: string): Book | undefined {
        return this.books.find((book) => book.isbn === isbn);
    }

    protected getBooks(): Book[] {
        return [...this.books];
    }
}

class DigitalLibrary extends Library {
    constructor(public readonly website: string) {
        super();
    }

    public listBooks(): string[] {
        return this.getBooks().map((book) => book.title);
    }
}

const digitalLibrary = new DigitalLibrary("https://example-library.com");

digitalLibrary.addBook({
    title: "1984",
    author: "George Orwell",
    isbn: "978-0451524935",
    publishedYear: 1949,
    genre: "Dystopian fiction"
});

digitalLibrary.addBook({
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "978-0141439518",
    publishedYear: 1813,
    genre: "Romance"
});

console.log("Library website:", digitalLibrary.website);
console.log(
    "Book details:",
    digitalLibrary.getBookDetails("978-0451524935")
);
console.log("All book titles:", digitalLibrary.listBooks());

if (typeof document !== "undefined") {
    const output = document.getElementById("output");

    if (output) {
        const firstBook = digitalLibrary.getBookDetails("978-0451524935");
        const bookDetails = firstBook
            ? `
                <h2>Book details</h2>
                <p><strong>Title:</strong> ${firstBook.title}</p>
                <p><strong>Author:</strong> ${firstBook.author}</p>
                <p><strong>ISBN:</strong> ${firstBook.isbn}</p>
                <p><strong>Published:</strong> ${firstBook.publishedYear}</p>
                <p><strong>Genre:</strong> ${firstBook.genre ?? "Not specified"}</p>
            `
            : "<p>Book not found.</p>";

        output.innerHTML = `
            <p><strong>Library website:</strong> ${digitalLibrary.website}</p>
            ${bookDetails}
            <h2>All book titles</h2>
            <ul>${digitalLibrary
                .listBooks()
                .map((title) => `<li>${title}</li>`)
                .join("")}</ul>
        `;
    }
}
