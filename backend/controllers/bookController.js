const bookService = require('../services/bookServices');

// 1. Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const filters = {
      genre: req.query.genre,
      is_read:
        req.query.is_read === 'true'
          ? true
          : req.query.is_read === 'false'
          ? false
          : undefined,
    };
    const books = await bookService.getAllBooks(filters);
    res.status(200).json(books); // <-- send array directly
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch books' });
  }
};

// 2. Get a book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch book' });
  }
};

// 3. Create a new book
exports.createBook = async (req, res) => {
  try {
    if (!req.body.title || !req.body.author)
      return res.status(400).json({ message: 'Title and Author are required' });

    const newBook = await bookService.createBook(req.body);
    res.status(201).json(newBook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create book' });
  }
};

// 4. Update book
// 4. Update book progress
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    // We extract ONLY the number from the body
    // This matches the "currentPage" field in your Prisma schema
    const pagesRead = req.body.currentPage; 

    // CALL THE CORRECT SERVICE: updateProgress (not updateBook)
    const updatedBook = await bookService.updateProgress(id, pagesRead);
    
    res.status(200).json(updatedBook);
  } catch (err) {
    // This logs the specific reason (like "Invalid ID") to your Render console
    console.error("🔥 Update Error:", err.message);
    res.status(400).json({ message: err.message });
  }
};

// 5. Delete book
exports.deleteBook = async (req, res) => {
  try {
    await bookService.deleteBook(req.params.id);
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to delete book' });
  }
};