const quotes = [
  {
    id: 0,
    author: "Oscar Wilde",
    quote: "Be yourself; everyone else is already taken.",
    likes: 0
  },
  {
    id: 1,
    author: "Albert Einstein",
    quote: "Life is like riding a bicycle. To keep your balance, you must keep moving.",
    likes: 0
  },
  {
    id: 2,
    author: "Maya Angelou",
    quote: "You will face many defeats in life, but never let yourself be defeated.",
    likes: 0
  }
];

const quoteSection = document.getElementById("quoteSection");
let currentQuote = null;
let filteredQuotes = [];
let currentFilterIndex = 0;

function displayQuote(quote) {
  if (!quote) {
    quoteSection.textContent = "No quote found.";
    return;
  }

  currentQuote = quote;

  quoteSection.innerHTML = `
    <blockquote>"${quote.quote}"</blockquote>
    <p><strong>- ${quote.author}</strong></p>
    <p>Likes: ${quote.likes}</p>
  `;
}

function getRandomQuote() {
  let randomQuote;

  do {
    randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  } while (quotes.length > 1 && randomQuote.id === currentQuote?.id);

  displayQuote(randomQuote);
}

document.getElementById("generateBtn").addEventListener("click", getRandomQuote);

document.getElementById("addQuoteForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const newQuote = {
    id: quotes.length,
    quote: document.getElementById("quoteInput").value.trim(),
    author: document.getElementById("authorInput").value.trim(),
    likes: 0
  };

  quotes.push(newQuote);
  event.target.reset();
  displayQuote(newQuote);
});

document.getElementById("charactersBtn").addEventListener("click", () => {
  if (currentQuote) {
    alert(`Characters including spaces: ${currentQuote.quote.length}`);
  }
});

document.getElementById("charactersNoSpacesBtn").addEventListener("click", () => {
  if (currentQuote) {
    alert(`Characters without spaces: ${currentQuote.quote.replace(/\s/g, "").length}`);
  }
});

document.getElementById("wordsBtn").addEventListener("click", () => {
  if (currentQuote) {
    const wordCount = currentQuote.quote.trim().split(/\s+/).length;
    alert(`Number of words: ${wordCount}`);
  }
});

document.getElementById("likeBtn").addEventListener("click", () => {
  if (currentQuote) {
    currentQuote.likes++;
    displayQuote(currentQuote);
  }
});

document.getElementById("filterForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const author = document.getElementById("authorFilter").value.trim().toLowerCase();

  filteredQuotes = quotes.filter(
    (quote) => quote.author.toLowerCase() === author
  );

  currentFilterIndex = 0;
  displayQuote(filteredQuotes[currentFilterIndex]);
});

document.getElementById("nextBtn").addEventListener("click", () => {
  if (filteredQuotes.length > 0) {
    currentFilterIndex =
      (currentFilterIndex + 1) % filteredQuotes.length;

    displayQuote(filteredQuotes[currentFilterIndex]);
  }
});

document.getElementById("previousBtn").addEventListener("click", () => {
  if (filteredQuotes.length > 0) {
    currentFilterIndex =
      (currentFilterIndex - 1 + filteredQuotes.length) % filteredQuotes.length;

    displayQuote(filteredQuotes[currentFilterIndex]);
  }
});