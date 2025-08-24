import { useState, useEffect } from 'react';
import { toolsClient } from '../lib/http';
import { Note, CreateNoteRequest } from '../types/chat';
import { Plus, Search, Edit, Trash2, AlertCircle, X } from 'lucide-react';

export default function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await toolsClient.get('/api/tools/notes');
      setNotes(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    try {
      const request: CreateNoteRequest = {
        title: newNote.title.trim(),
        content: newNote.content.trim(),
      };

      const response = await toolsClient.post('/api/tools/notes', request);
      
      // Optimistic update
      setNotes(prev => [response.data, ...prev]);
      setNewNote({ title: '', content: '' });
      setShowCreateForm(false);
      setError(null);
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note');
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await toolsClient.delete(`/api/tools/notes/${noteId}`);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      setError(null);
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
        <h2 className="text-lg md:text-xl font-semibold">Notes</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary flex items-center justify-center px-4 py-2 md:py-3 text-sm md:text-base w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
          New Note
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start md:items-center">
          <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 md:mt-0 flex-shrink-0" />
          <span className="text-red-700 text-sm md:text-base">{error}</span>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 md:pl-12 text-sm md:text-base"
          />
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={createNote} className="mb-6 p-3 md:p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3 md:space-y-4">
            <input
              type="text"
              placeholder="Note title"
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              className="input text-sm md:text-base"
              required
            />
            <textarea
              placeholder="Note content"
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              className="input min-h-[80px] md:min-h-[100px] resize-none text-sm md:text-base"
              required
            />
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button type="submit" className="btn-primary text-sm md:text-base px-4 py-2 md:py-3">
                Create Note
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewNote({ title: '', content: '' });
                }}
                className="btn-secondary text-sm md:text-base px-4 py-2 md:py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="space-y-3 md:space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center text-gray-500 py-6 md:py-8 text-sm md:text-base">
            {searchQuery ? 'No notes found matching your search' : 'No notes yet. Create your first note!'}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div 
              key={note.id} 
              className="border border-gray-200 rounded-lg p-3 md:p-4 hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => setSelectedNote(note)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-1 text-sm md:text-base truncate">{note.title}</h3>
                  <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-3 leading-relaxed">
                    {note.content || 'No content'}
                  </p>
                  <div className="text-xs text-gray-400">
                    Created: {new Date(note.createdAt).toLocaleDateString()}
                    {note.updatedAt !== note.createdAt && (
                      <span className="ml-2">
                        Updated: {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1 ml-2 md:ml-4 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-2xl w-full max-h-[90vh] md:max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-semibold pr-4">{selectedNote.title}</h3>
              <button
                onClick={() => setSelectedNote(null)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap text-sm md:text-base leading-relaxed">{selectedNote.content || 'No content'}</p>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              Created: {new Date(selectedNote.createdAt).toLocaleDateString()}
              {selectedNote.updatedAt !== selectedNote.createdAt && (
                <span className="ml-2">
                  Updated: {new Date(selectedNote.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
