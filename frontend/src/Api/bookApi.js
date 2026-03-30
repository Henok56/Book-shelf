import api from '../api'; // This is your axios interceptor instance

/**
 * Service for Book-related API calls.
 * These functions return the 'data' directly because of our 
 * response interceptor logic.
 */

// 1. Fetch all books (supports filtering by genre or status)
export const getBooks = async (params = {}) => {
    return await api.get('/books', { params });
};

// 2. Fetch a single book by its ID
export const getBookById = async (id) => {
    return await api.get(`/books/${id}`);
};

// 3. Add a new book to the database
export const addBook = async (bookData) => {
    return await api.post('/books', bookData);
};

// 4. Update an existing book (Progress, Rating, or Read Status)
export const updateBook = async (id, updateData) => {
    return await api.put(`/books/${id}`, updateData);
};

// 5. Delete a book permanently
export const deleteBook = async (id) => {
    return await api.delete(`/books/${id}`);
};

/**
 * PRO-TIP: Specialized logic for Reading Progress
 * Instead of manually calculating pages in your components, 
 * you can create helper functions here.
 */
export const advanceReadingProgress = async (book, pagesRead) => {
    const newPage = Math.min(book.currentPage + pagesRead, book.totalPages);
    return await updateBook(book.id, { currentPage: newPage });
};