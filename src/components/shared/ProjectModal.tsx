'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, Plus, Trash2
} from 'lucide-react';
import { useProjectStore, Project } from '@/store/useProjectStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { getSectionIconSelectOptions } from '@/lib/sectionIcons';

const CATEGORY_OPTIONS = [
  'School Based', 'Tech Based', 'E-Commerce', 'Real Estate', 
  'Healthcare', 'SaaS Platform', 'Fintech', 'Social Media', 
  'Fitness & Gym', 'Landing Page', 'Logistics & Supply', 'Other / Custom'
].map(cat => ({ value: cat, label: cat }));


const PROJECT_ICONS = ['🌱', '🚀', '🛒', '⚡', '📦', '🏕️', '🎯', '🔥', '💡', '🛠️', '📊', '🎨', '🔬', '🌐', '📱', '💻', '⚙️', '💎', '🌟', '🛡️', '🎓', '🏥', '🏢', '🏗️'];

interface ProjectModalProps {
  project?: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const router = useRouter();
  const { createProject, updateProject, setActiveProject } = useProjectStore();
  const { createDocument, setActiveDoc } = useDocumentStore();
  
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [icon, setIcon] = useState(project?.icon || '🌱');
  const [color, setColor] = useState(project?.color || '#6366f1');
  const [category, setCategory] = useState(project?.category || 'School Based');
  
  const [customSections, setCustomSections] = useState<Array<{ id: string; label: string; icon: string }>>(() => {
    if (project?.sections && project.sections.length > 0) {
      return project.sections.map(s => ({
        id: s.id,
        label: s.label,
        icon: s.icon || 'BookOpen'
      }));
    }
    return [
      { id: `sec_${Math.random().toString(36).slice(2, 7)}`, label: 'New Custom Section', icon: 'BookOpen' }
    ];
  });

  const handleAddCustomSection = () => {
    const newId = `sec_${Math.random().toString(36).slice(2, 7)}`;
    setCustomSections(prev => [...prev, { id: newId, label: 'New Custom Section', icon: 'BookOpen' }]);
  };

  const handleRemoveCustomSection = (id: string) => {
    setCustomSections(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateSectionLabel = (id: string, label: string) => {
    setCustomSections(prev => prev.map(s => s.id === id ? { ...s, label } : s));
  };

  const handleUpdateSectionIcon = (id: string, icon: string) => {
    setCustomSections(prev => prev.map(s => s.id === id ? { ...s, icon } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedSections = customSections.map(s => ({
      id: s.id,
      label: s.label.trim(),
      icon: s.icon
    }));

    try {
      if (project) {
        await updateProject(project.id, { 
          name: name.trim(), 
          description: description.trim(), 
          icon, 
          color, 
          category, 
          sections: formattedSections 
        });
      } else {
        const proj = await createProject({ 
          name: name.trim(), 
          description: description.trim(), 
          icon, 
          color, 
          category, 
          version: 'v1.0.0',
          sections: formattedSections 
        });

        // Auto-select and spawn the first document of the first section
        setActiveProject(proj.id);
        const firstSecId = formattedSections[0]?.id || 'teacher';
        const firstDoc = await createDocument(null, proj.id, firstSecId);
        setActiveDoc(firstDoc.id);
        router.push(`/dashboard/documents/${firstDoc.id}`);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-card border border-border shadow-2xl rounded-3xl overflow-hidden text-foreground">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between">
          <div className="space-y-0.5 text-left">
            <h2 className="text-lg font-black font-outfit uppercase tracking-wider text-foreground">
              {project ? 'Edit Module' : 'Create New Module'}
            </h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              {project ? 'Modify your module parameters' : 'Create a customized tenant module documentation pool'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5 max-h-[80vh] sm:max-h-[75vh] overflow-y-auto scrollbar-thin text-left">
          
          {/* Custom Visual Customization block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Icon Picker Grid */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Icon</label>
              <div className="grid grid-cols-4 gap-1 p-2 bg-background border border-border rounded-xl">
                {PROJECT_ICONS.slice(0, 12).map(i => (
                  <button
                    key={i} 
                    type="button"
                    onClick={() => setIcon(i)}
                    className={cn(
                      'w-7 h-7 text-base rounded-lg flex items-center justify-center transition-all cursor-pointer select-none', 
                      icon === i ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-accent'
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-1.5 flex flex-col justify-between">
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5">Module Theme Color</label>
                <div className="flex items-center gap-3 p-2.5 bg-background border border-border rounded-xl">
                  {/* Interactive Color Circle Button */}
                  <label 
                    className="w-10 h-10 rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center relative overflow-hidden border border-border/80 hover:scale-105 active:scale-95 shadow-md shadow-black/10 group"
                    style={{ backgroundColor: color }}
                    title="Click to choose color"
                  >
                    <input 
                      type="color" 
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-black uppercase tracking-wider select-none pointer-events-none">
                      Pick
                    </div>
                  </label>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Add Color</span>
                      <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded-sm border border-primary/20">Hex</span>
                    </div>
                    <input
                      type="text"
                      value={color}
                      onChange={e => {
                        const val = e.target.value;
                        if (val.startsWith('#') && val.length <= 7) {
                          setColor(val);
                        } else if (!val.startsWith('#') && val.length <= 6) {
                          setColor('#' + val);
                        }
                      }}
                      placeholder="#6366f1"
                      className="w-full bg-accent/40 border border-border/60 rounded-lg px-2.5 py-1 text-xs font-black tracking-wider text-foreground focus:outline-none focus:border-primary/50 uppercase transition-all"
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview Bubble */}
              <div className="flex items-center gap-2 p-2 bg-background border border-border rounded-xl mt-3 sm:mt-0">
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 select-none" 
                  style={{ backgroundColor: color + '25' }}
                >
                  {icon}
                </div>
                <span className="text-[11px] font-bold text-foreground truncate max-w-[120px]">{name || 'Module Name'}</span>
              </div>
            </div>

          </div>

          {/* Project Details */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Module Name *</label>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Little Seeds" 
              className="h-11 bg-background border-border focus:border-primary/50 text-foreground font-bold rounded-xl" 
              required 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Description</label>
            <Input 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Brief summary of module manuals..." 
              className="h-11 bg-background border-border focus:border-primary/50 text-foreground font-bold rounded-xl" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Module Category / Workspace Type</label>
            <Select
              value={category}
              onChange={setCategory}
              options={CATEGORY_OPTIONS}
            />
          </div>

          {/* Dynamic Project Sections Editor */}
          <div className="space-y-3 p-4 bg-accent/20 border border-border rounded-2xl max-h-[220px] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Module Custom Sections</span>
              <button
                type="button"
                onClick={handleAddCustomSection}
                className="text-[9px] font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-2.5 h-2.5" /> Add Section
              </button>
            </div>

            <div className="space-y-2">
              {customSections.map((section, idx) => (
                <div key={section.id} className="flex flex-col gap-2.5 bg-card border border-border p-3 rounded-2xl hover:border-primary/40 hover:shadow-lg transition-all group/item">
                  <div className="relative w-full">
                    <Select
                      value={section.icon}
                      onChange={val => handleUpdateSectionIcon(section.id, val)}
                      options={getSectionIconSelectOptions()}
                      className="w-full"
                      triggerClassName="h-10 px-3 rounded-xl"
                    />
                  </div>

                  <div className="flex w-full items-center gap-2">
                    <input
                      type="text"
                      required
                      value={section.label}
                      onChange={e => handleUpdateSectionLabel(section.id, e.target.value)}
                      placeholder={`Section ${idx + 1} name...`}
                      className="flex-1 min-w-0 bg-background border border-border hover:border-border/80 focus:border-primary/45 focus:bg-background rounded-xl px-3 h-10 text-xs font-bold text-foreground focus:outline-none transition-all placeholder:text-muted-foreground/45"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomSection(section.id)}
                      className="bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 hover:text-rose-600 transition-colors shrink-0 cursor-pointer flex items-center justify-center h-10 w-10"
                      title="Remove custom section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {customSections.length === 0 && (
                <p className="text-[10px] text-muted-foreground italic text-center py-4 select-none">No custom sections. Click Add Section above.</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-border text-xs font-bold hover:bg-accent transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/10 transition-all cursor-pointer text-center"
            >
              {project ? 'Save Changes' : 'Create Module'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
