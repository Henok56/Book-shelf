// 1. TYPO FIX: It must be 'PrismaClient' (Capital P, Capital C)
const { PrismaClient } = require('@prisma/client');

// 2. TYPO FIX: Match the variable name above
const prisma = new PrismaClient();

const bookService = {
  // 1. Get all books
  getAllBooks: async () => {
    // TYPO FIX: .findMany() (Capital M) and orderBy (no 'h')
    return await prisma.book.findMany({
        orderBy: { createdAt: 'desc' }, 
    });
  },

  // 2. Get a book by id
  getBookById: async (id) => {
    return await prisma.book.findUnique({
      // IMPORTANT: Ensure 'id' is a number because your schema says Int
      where: { id: parseInt(id) },
    });
  },

 // CREATE with new fields
  createBook: async (data) => {
    return await prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        genre: data.genre || "General",
        totalPages: parseInt(data.totalPages) || 0,
        currentPage: parseInt(data.currentPage) || 0,
        is_read: data.currentPage >= data.totalPages && data.totalPages > 0
      }
    });
  },

  // NEW: Update Progress Function
  updateProgress: async (id, pagesRead) => {
    return await prisma.book.update({
      where: { id: parseInt(id) },
      data: { currentPage: parseInt(pagesRead) }
    });
  },

  // 5. Delete a book
  deleteBook: async (id) => {
    return await prisma.book.delete({
      where: { id: parseInt(id) },
    });
  }
};

module.exports = bookService;