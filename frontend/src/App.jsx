import React, { useState, useEffect } from "react";
import "./styles/book.css";

function BookLibrary() {
  const [books, setBooks] = useState([]);
  const [view, setView] = useState("dashboard"); // 'dashboard' or 'add'
  const [editingId, setEditingId] = useState(null); 
  const [tempPages, setTempPages] = useState(0);
  const [form, setForm] = useState({ title: "", author: "", genre: "", totalPages: "", currentPage: 0 });
  const [error, setError] = useState("");

  const fetchBooks = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/books");
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : data.data || []);
    } catch (err) { setError("The Library Scroll is unreachable."); }
  };

  useEffect(() => { fetchBooks(); }, []);

  // UPDATE PAGES LOGIC
  const handleUpdatePages = async (id, totalPages) => {
    const pages = Math.max(0, Math.min(tempPages, totalPages)); 
    const isNowRead = pages === totalPages;

    await fetch(`http://localhost:5000/api/books/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPage: pages, is_read: isNowRead }),
    });
    setEditingId(null);
    fetchBooks();
  };

  // ADD NEW BOOK LOGIC
  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...form, 
          totalPages: parseInt(form.totalPages),
          currentPage: parseInt(form.currentPage) || 0 
        }),
      });
      if (res.ok) {
        setForm({ title: "", author: "", genre: "", totalPages: "", currentPage: 0 });
        fetchBooks();
        setView("dashboard");
      }
    } catch (err) { setError("Summoning failed."); }
  };

  const total = books.length;
  const completed = books.filter(b => b.is_read).length;
  const compRatio = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      
      {/* NAV BAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-black tracking-tighter text-indigo-600 flex items-center gap-2">
            <span>📚</span> Enchanted Library
          </h1>
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
            <button onClick={() => setView("dashboard")} className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Dashboard</button>
            <button onClick={() => setView("add")} className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'add' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>+ Add Book</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        
        {/* VIEW 1: DASHBOARD */}
        {view === "dashboard" && (
          <div className="animate-view space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Collection</p>
                <div className="text-5xl font-black text-indigo-600 mt-2">{total}</div>
              </div>
              <div className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="font-bold text-slate-700">Reading Pulse</h3>
                  <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">{Math.round(compRatio)}% DONE</span>
                </div>
                <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 bar-transition" style={{ width: `${compRatio}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                  <tr>
                    <th className="px-8 py-5">Title</th>
                    <th className="px-8 py-5">Progress</th>
                    <th className="px-8 py-5 text-center">Daily Log</th>
                    <th className="px-8 py-5 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {books.map(book => (
                    <tr key={book.id} className="table-row-hover group">
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-800">{book.title}</div>
                        <div className="text-xs text-slate-400">{book.author}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full bar-transition ${book.is_read ? 'bg-emerald-400' : 'bg-indigo-500'}`} style={{ width: `${(book.currentPage/book.totalPages)*100}%` }}></div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        {editingId === book.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <input type="number" className="w-16 p-2 bg-slate-100 rounded-lg text-xs font-bold text-center ring-2 ring-indigo-500" defaultValue={book.currentPage} onChange={(e) => setTempPages(parseInt(e.target.value) || 0)} />
                            <button onClick={() => handleUpdatePages(book.id, book.totalPages)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold">Save</button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-slate-600">{book.currentPage} / {book.totalPages}</span>
                            <button onClick={() => { setEditingId(book.id); setTempPages(book.currentPage); }} className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-1 hover:text-indigo-700">Update</button>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={async () => { await fetch(`http://localhost:5000/api/books/${book.id}`, { method: 'DELETE' }); fetchBooks(); }} className="text-slate-200 hover:text-red-500 p-2 transition-colors">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 2: ADD BOOK */}
        {view === "add" && (
          <div className="animate-view max-w-xl mx-auto">
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">New Entry</h2>
              <p className="text-slate-400 mb-10 text-sm">Add a book to your enchanted collection.</p>
              <form onSubmit={handleAddBook} className="space-y-6">
                <input required className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" placeholder="Book Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                <input required className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" placeholder="Author" value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
                <div className="grid grid-cols-2 gap-6">
                  <input type="number" required className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" placeholder="Total Pages" value={form.totalPages} onChange={e => setForm({...form, totalPages: e.target.value})} />
                  <input className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" placeholder="Genre" value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transform hover:scale-[1.01] transition-all">Summon to Library</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default BookLibrary;