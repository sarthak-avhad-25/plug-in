const fs = require('fs');
let code = fs.readFileSync('src/app/ProfileSelector.tsx', 'utf-8');

const importTarget = `import { Trash2, Plus } from "lucide-react";`;
const importReplace = `import { Trash2, Plus, Edit2, Check } from "lucide-react";`;
code = code.replace(importTarget, importReplace);

const stateTarget = `  const [deletingId, setDeletingId] = useState<string | null>(null);`;
const stateReplace = `  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");`;
code = code.replace(stateTarget, stateReplace);

const propsTarget = `onDelete: (p: any) => void;
}) {`;
const propsReplace = `onDelete: (p: any) => void;
  onEdit?: (p: any, newName: string) => void;
}) {`;
code = code.replace(propsTarget, propsReplace);

const loopTarget = `              const isActive = p.id === activeProfileId;
              const isDeleting = deletingId === p.id;
              
              return (
                <div 
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className={\`group relative flex items-center justify-between p-4 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent overflow-hidden
                    \${isActive ? 'bg-white/10 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'hover:bg-white/5 hover:border-white/10'}\`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  
                  <div className="flex items-center gap-6 relative z-10">
                    <div className={\`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl transition-transform duration-300 group-hover:scale-105 bg-gradient-to-br \${p.color}\`}>
                      {p.emoji}
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <span className={\`text-xl md:text-2xl font-bold tracking-tight transition-colors \${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}\`}>
                          {p.name}
                        </span>`;

const loopReplace = `              const isActive = p.id === activeProfileId;
              const isDeleting = deletingId === p.id;
              const isEditing = editingId === p.id;
              
              return (
                <div 
                  key={p.id}
                  onClick={() => { if (!isEditing) onSelect(p); }}
                  className={\`group relative flex items-center justify-between p-4 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent overflow-hidden
                    \${isActive ? 'bg-white/10 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'hover:bg-white/5 hover:border-white/10'}\`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  
                  <div className="flex items-center gap-6 relative z-10">
                    <div className={\`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl transition-transform duration-300 group-hover:scale-105 bg-gradient-to-br \${p.color}\`}>
                      {p.emoji}
                    </div>
                    
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
                          <span className={\`text-xl md:text-2xl font-bold tracking-tight transition-colors \${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}\`}>
                            {p.name}
                          </span>
                        )}`;

code = code.replace(loopTarget, loopReplace);


const buttonsTarget = `                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isDeleting) {
                          onDelete(p);
                        } else {
                          setDeletingId(p.id);
                          setTimeout(() => setDeletingId(null), 3000);
                        }
                      }}
                      className={\`p-3 rounded-xl transition-all \${isDeleting ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'text-white/20 hover:bg-white/10 hover:text-white'}\`}
                      title="Delete Profile"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>`;

const buttonsReplace = `                    {isEditing ? (
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
                      className={\`p-3 rounded-xl transition-all \${isDeleting ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'text-white/20 hover:bg-white/10 hover:text-white'}\`}
                      title="Delete Profile"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>`;

code = code.replace(buttonsTarget, buttonsReplace);
fs.writeFileSync('src/app/ProfileSelector.tsx', code);
