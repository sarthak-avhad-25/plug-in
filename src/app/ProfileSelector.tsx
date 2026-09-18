"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Check, X } from "lucide-react";
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

  return (
    <div className="fixed inset-0 bg-[#020202]/95 backdrop-blur-3xl z-[9999] flex flex-col pt-[env(safe-area-inset-top,40px)] pb-[env(safe-area-inset-bottom,40px)] px-6 overflow-hidden">
      
      <div className="flex items-end justify-between border-b border-white/20 pb-6 mb-8 mt-4 relative">
        <h2 className="text-[64px] font-black tracking-tighter text-white uppercase leading-[0.8]">
          SELECT<br/>IDENTITY
        </h2>
        <button onClick={() => onSelect(profiles.find(p => p.id === activeProfileId))} className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white/50 active:bg-white active:text-black transition-colors absolute top-0 right-0">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col gap-8 overflow-y-auto pb-24 scrollbar-hide flex-1">
        {profiles.map((p, i) => {
          const isActive = p.id === activeProfileId;
          const isDeleting = deletingId === p.id;
          
          return (
            <div 
              key={p.id}
              onClick={() => onSelect(p)}
              className={`flex items-center gap-6 group cursor-pointer active:opacity-50 transition-opacity ${isActive ? '' : 'grayscale opacity-60'}`}
            >
              <div className="text-[12px] font-black tracking-widest text-white/30 -rotate-90 origin-center w-6">
                {String(i+1).padStart(2,'0')}
              </div>
              <div className={`w-[120px] h-[160px] overflow-hidden shrink-0 border ${isActive ? 'border-[#D4FF00]' : 'border-white/10'}`}>
                {p.avatar ? (
                  <img src={p.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#111] flex items-center justify-center text-4xl">
                    {p.emoji || "👤"}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col flex-1 min-w-0 pr-4 justify-between h-[160px] py-2 border-b border-white/10">
                <div className="flex flex-col">
                  <span className="text-[32px] font-black tracking-tighter uppercase text-white truncate leading-none">
                    {p.name}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-bold tracking-[0.4em] text-[#D4FF00] uppercase mt-2">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-4 mt-auto" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      if (isDeleting) {
                        onDelete(p);
                      } else {
                        setDeletingId(p.id);
                        setTimeout(() => setDeletingId(null), 3000);
                      }
                    }}
                    className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${isDeleting ? 'bg-red-500 text-black' : 'border border-white/20 text-white/30 active:text-white'}`}
                  >
                    {isDeleting ? <Check className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-white/20">
        <button
          onClick={onAdd}
          className="w-full py-6 bg-transparent border border-dashed border-white/30 text-white/50 active:bg-white active:text-black font-black tracking-[0.4em] text-[10px] uppercase transition-colors flex items-center justify-center gap-3"
        >
          <Plus className="w-4 h-4" /> CREATE NEW
        </button>
      </div>
    </div>
  );
}
