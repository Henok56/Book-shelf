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
      setError("The Library Scroll is unreachable."); 
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // FIX: Update local state immediately for dynamic UI response
  const handleUpdatePages = async (id, totalPages) => {
    try {
      const pages = Math.max(0, Math.min(tempPages, totalPages)); 
      const isNowRead = pages === totalPages;

      await updateBook(id, { 
        currentPage: pages, 
        is_read: isNowRead 
      });

      // Optimistic UI Update: update the book in the local array immediately
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === id ? { ...book, currentPage: pages, is_read: isNowRead } : book
        )
      );

      setEditingId(null);
    } catch (err) {
      console.error("Update failed:", err);
      setError("Could not update the scroll.");
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await addBook({ 
        ...form, 
        totalPages: parseInt(form.totalPages),
        currentPage: parseInt(form.currentPage) || 0 
      });
      setForm({ title: "", author: "", genre: "", totalPages: "", currentPage: 0 });
      fetchBooks();
      setView("dashboard");
    } catch (err) { 
      setError("Summoning failed."); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this book?")) {
      try {
        await deleteBook(id);
        setBooks(prev => prev.filter(b => b.id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  // Stats Calculations
  const total = books.length;
  const completedCount = books.filter(b => b.is_read).length;
  const pendingCount = total - completedCount;
  const compRatio = total > 0 ? (completedCount / total) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-black tracking-tighter text-indigo-600 flex items-center gap-2">
            <span>📚</span> Enchanted Library
          </h1>
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
            <button onClick={() => setView("dashboard")} className={`px-6 py-2 rounded-lg text-xs font-black uppercase ${view === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Dashboard</button>
            <button onClick={() => setView("add")} className={`px-6 py-2 rounded-lg text-xs font-black uppercase ${view === 'add' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>+ Add Book</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        {view === "dashboard" && (
          <div className="space-y-12">
            {/* NEW STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Books</p>
                <div className="text-4xl font-black text-indigo-600 mt-1">{total}</div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Completed</p>
                <div className="text-4xl font-black text-emerald-500 mt-1">{completedCount}</div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase text-amber-400 tracking-widest">In Progress</p>
                <div className="text-4xl font-black text-amber-500 mt-1">{pendingCount}</div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Global Progress</p>
                <div className="text-2xl font-black text-slate-800 mt-1">{Math.round(compRatio)}%</div>
              </div>
            </div>

            {/* PROGRESS BAR SECTION */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-bold text-slate-700">Reading Pulse</h3>
                <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">{Math.round(compRatio)}% DONE</span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700" style={{ width: `${compRatio}%` }}></div>
              </div>
            </div>

            {/* TABLE (Keep your existing table code here) */}
          </div>
        )}
        {/* ADD BOOK VIEW (Keep your existing form code here) */}
      </main>
    </div>
  );
}

export default BookLibrary;