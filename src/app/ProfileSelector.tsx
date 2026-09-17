"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Edit2, Check } from "lucide-react";
import { useState } from "react";

export function ProfileSelector({ 
  profiles, 
  activeProfileId, 
  onSelect, 
  onAdd, 
  onDelete, 
  onEdit
}: { 
  profiles: any[]; 
  activeProfileId?: string;
  onSelect: (p: any) => void; 
  onAdd: () => void; 
  onDelete: (p: any) => void;
  onEdit?: (p: any, newName: string) => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  return (
    <div className="fixed inset-0 bg-[#020005] z-[9999] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 0.9, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-[#D4FF00]/10 rounded-full blur-[120px] mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl px-6"
      >
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-wide uppercase">Switch Profile</h2>
          </div>

          <div className="flex flex-col gap-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {profiles.map(p => {
              const isActive = p.id === activeProfileId;
              const isDeleting = deletingId === p.id;
              const isEditing = editingId === p.id;
              
              return (
                <div 
                  key={p.id}
                  onClick={() => { if (!isEditing) onSelect(p); }}
                  className={`group relative flex items-center justify-between p-4 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent overflow-hidden
                    ${isActive ? 'bg-white/10 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'hover:bg-white/5 hover:border-white/10'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  
                  <div className="flex items-center gap-6 relative z-10">
                    {p.avatar ? (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-xl transition-transform duration-300 group-hover:scale-105 shrink-0 border-2 border-transparent group-hover:border-white/20">
                        <img src={p.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl transition-transform duration-300 group-hover:scale-105 bg-gradient-to-br ${p.color || "from-gray-600 to-gray-800"}`}>
                        {p.emoji || "👤"}
                      </div>
                    )}
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        {isEditing ? (
                          <input 
                            autoFocus
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                if (onEdit && editName.trim()) onEdit(p, editName.trim());
                                setEditingId(null);
                              }
                            }}
                            className="bg-black/50 border border-white/20 rounded-lg px-3 py-1 text-xl text-white outline-none focus:border-[#D4FF00]"
                          />
                        ) : (
                          <span className={`text-xl md:text-2xl font-bold tracking-tight transition-colors ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                            {p.name}
                          </span>
                        )}
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-[#D4FF00] shadow-[0_0_10px_#D4FF00]"
                          />
                        )}
                      </div>
                      {isActive && <span className="text-[#D4FF00]/70 text-sm font-medium">Active</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 relative z-10">
                    {isActive && (
                      <span className="hidden md:inline-flex px-4 py-1.5 rounded-full bg-[#D4FF00]/10 text-[#D4FF00] text-sm font-bold tracking-wider uppercase border border-[#D4FF00]/20">
                        Selected
                      </span>
                    )}
                    
                    {isEditing ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onEdit && editName.trim()) onEdit(p, editName.trim());
                          setEditingId(null);
                        }}
                        className="p-3 rounded-xl bg-[#D4FF00]/20 text-[#D4FF00] hover:bg-[#D4FF00] hover:text-black transition-all"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditName(p.name);
                          setEditingId(p.id);
                        }}
                        className="p-3 rounded-xl text-white/20 hover:bg-white/10 hover:text-white transition-all"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isDeleting) {
                          onDelete(p);
                        } else {
                          setDeletingId(p.id);
                          setTimeout(() => setDeletingId(null), 3000);
                        }
                      }}
                      className={`p-3 rounded-xl transition-all ${isDeleting ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'text-white/20 hover:bg-white/10 hover:text-white'}`}
                      title="Delete Profile"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <button
              onClick={onAdd}
              className="w-full flex items-center justify-center gap-3 bg-transparent border-2 border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/50 hover:bg-white/5 font-bold text-lg rounded-2xl py-5 transition-all active:scale-[0.98]"
            >
              <Plus className="w-6 h-6" /> Add Profile
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
