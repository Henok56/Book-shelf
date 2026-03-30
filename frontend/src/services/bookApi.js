import api from '../Api'; // This correctly looks one level up for api.js

// 1. Fetch all books
export const getBooks = async (params = {}) => {
    return await api.get('/books', { params });
};

// 2. Add a new book
export const addBook = async (bookData) => {
    return await api.post('/books', bookData);
};

// 3. Update a book (Fixed URL syntax with /)
export const updateBook = async (id, updateData) => {
    return await api.put(`/books/${id}`, updateData);
};

// 4. Delete a book
export const deleteBook = async (id) => {
    return await api.delete(`/books/${id}`);
};