'use client';

import { Plus, Film, Activity, User } from 'lucide-react';

interface HeaderProps {
    projectName: string;
    onNewProject: () => void;
}

export default function Header({ projectName, onNewProject }: HeaderProps) {
    return (
        <header className="h-16 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center space-x-3">
                <div className="bg-primary p-1.5 rounded-lg">
                    <Film className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl tracking-tight hidden sm:block">Cinema AI</span>
            </div>

            <div className="flex-1 max-w-sm mx-auto px-4 hidden md:block">
                <div className="bg-muted/50 rounded-full px-4 py-1.5 flex items-center space-x-2 border">
                    <Activity className="h-3 w-3 text-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-muted-foreground truncate">
                        Project: <span className="text-foreground">{projectName}</span>
                    </span>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button
                    onClick={onNewProject}
                    className="flex items-center space-x-2 bg-muted hover:bg-muted/80 text-sm font-medium px-3 py-1.5 rounded-lg transition-all border"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New Project</span>
                </button>
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-all">
                    <User className="h-4 w-4 text-primary" />
                </div>
            </div>
        </header>
    );
}
