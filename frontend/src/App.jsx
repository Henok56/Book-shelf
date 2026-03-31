import React, { useState, useEffect } from "react";
import { getBooks, addBook, updateBook, deleteBook } from "./services/bookApi";
import "./styles/book.css";

function BookLibrary() {
  const [books, setBooks] = useState([]);
  const [view, setView] = useState("dashboard");
  const [editingId, setEditingId] = useState(null);
  const [tempPages, setTempPages] = useState(0);
  const [form, setForm] = useState({ title: "", author: "", genre: "", totalPages: "", currentPage: 0 });
  const [error, setError] = useState("");

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      setBooks(Array.isArray(data) ? data : data.data || []);
      setError("");
    } catch (err) {
      setError("The Library Scroll is unreachable. Check your connection.");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // --- DYNAMIC CALCULATION LOGIC ---
  const totalBooks = books.length;
  const completedBooks = books.filter((b) => b.is_read).length;
  const pendingBooks = totalBooks - completedBooks;

  // Calculate percentage based on every single page in the library
  const libraryTotalPages = books.reduce((sum, b) => sum + (parseInt(b.totalPages) || 0), 0);
  const libraryReadPages = books.reduce((sum, b) => sum + (parseInt(b.currentPage) || 0), 0);
  const globalPercentage = libraryTotalPages > 0 ? (libraryReadPages / libraryTotalPages) * 100 : 0;

  // --- HANDLERS ---
  const handleUpdatePages = async (id, totalPages) => {
    try {
      const pages = Math.max(0, Math.min(parseInt(tempPages) || 0, totalPages));
      const isNowRead = pages === totalPages;

      // 1. Optimistic Update: Change local state immediately so the bar moves
      setBooks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, currentPage: pages, is_read: isNowRead } : b))
      );
      setEditingId(null);

      // 2. Sync with Backend
      await updateBook(id, { currentPage: pages, is_read: isNowRead });
    } catch (err) {
      console.error("Update failed:", err);
      fetchBooks(); // Rollback to server state if error occurs
      setError("Could not update the scroll.");
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await addBook({
        ...form,
        totalPages: parseInt(form.totalPages),
        currentPage: parseInt(form.currentPage) || 0,
      });
      setForm({ title: "", author: "", genre: "", totalPages: "", currentPage: 0 });
      fetchBooks();
      setView("dashboard");
    } catch (err) {
      setError("Summoning failed. Check all fields.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this book?")) {
      try {
        await deleteBook(id);
        setBooks((prev) => prev.filter((b) => b.id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* NAVIGATION */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-black tracking-tighter text-indigo-600 flex items-center gap-2">
            <span>📚</span> Enchanted Library
          </h1>
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setView("dashboard")}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                view === "dashboard" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView("add")}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                view === "add" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
              }`}
            >
              + Add Book
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 border border-red-100 text-center font-bold">
            {error}
          </div>
        )}

        {view === "dashboard" && (
          <div className="space-y-10">
            {/* STAT CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Books</p>
                <div className="text-4xl font-black text-indigo-600 mt-2">{totalBooks}</div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Completed</p>
                <div className="text-4xl font-black text-emerald-500 mt-2">{completedBooks}</div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Pending</p>
                <div className="text-4xl font-black text-amber-500 mt-2">{pendingBooks}</div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Library Progress</p>
                <div className="text-4xl font-black text-slate-800 mt-2">{Math.round(globalPercentage)}%</div>
              </div>
            </div>

            {/* MAIN PROGRESS BAR */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="font-bold text-slate-700">Library Mastery</h3>
                  <p className="text-xs text-slate-400">
                    {libraryReadPages} of {libraryTotalPages} total pages read
                  </p>
                </div>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full">
                  {Math.round(globalPercentage)}% OVERALL
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-1000 ease-out"
                  style={{ width: `${globalPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* TABLE SECTION */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                  <tr>
                    <th className="px-8 py-5">Title & Author</th>
                    <th className="px-8 py-5">Progress Bar</th>
                    <th className="px-8 py-5 text-center">Reading Log</th>
                    <th className="px-8 py-5 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {books.map((book) => (
                    <tr key={book.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-800">{book.title}</div>
                        <div className="text-xs text-slate-400">{book.author}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              book.is_read ? "bg-emerald-400" : "bg-indigo-500"
                            }`}
                            style={{ width: `${(book.currentPage / book.totalPages) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        {editingId === book.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              className="w-16 p-2 bg-slate-100 rounded-lg text-xs font-bold text-center ring-2 ring-indigo-500 outline-none"
                              defaultValue={book.currentPage}
                              onChange={(e) => setTempPages(e.target.value)}
                            />
                            <button
                              onClick={() => handleUpdatePages(book.id, book.totalPages)}
                              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-indigo-700"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-slate-600">
                              {book.currentPage} / {book.totalPages}
                            </span>
                            <button
                              onClick={() => {
                                setEditingId(book.id);
                                setTempPages(book.currentPage);
                              }}
                              className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-1 hover:text-indigo-700"
                            >
                              Update Log
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="text-slate-200 hover:text-red-500 p-2 transition-colors"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {books.length === 0 && (
                <div className="p-20 text-center text-slate-400 text-sm italic">
                  Your library shelves are empty. Add a book to begin your journey.
                </div>
              )}
            </div>
          </div>
        )}

        {view === "add" && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">New Entry</h2>
              <p className="text-slate-400 mb-10 text-sm">Add a book to your enchanted collection.</p>
              <form onSubmit={handleAddBook} className="space-y-6">
                <input
                  required
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Book Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <input
                  required
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Author"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-6">
                  <input
                    type="number"
                    required
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Total Pages"
                    value={form.totalPages}
                    onChange={(e) => setForm({ ...form, totalPages: e.target.value })}
                  />
                  <input
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Genre"
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transform hover:scale-[1.01] transition-all"
                >
                  Summon to Library
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default BookLibrary;