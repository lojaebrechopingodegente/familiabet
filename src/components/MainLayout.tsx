import { useState, type ReactNode } from 'react'
import { TopBar } from './TopBar'
import { Sidebar, type ModuleId } from './Sidebar'

interface MainLayoutProps {
  children: ReactNode
  activeModule: ModuleId
  onModuleChange: (module: ModuleId) => void
}

export function MainLayout({ children, activeModule, onModuleChange }: MainLayoutProps) {
  const [activeUser, setActiveUser] = useState('1')

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar activeUser={activeUser} onUserChange={setActiveUser} />
      <Sidebar activeModule={activeModule} onModuleChange={onModuleChange} />
      
      {/* Main Content Area */}
      <main className="ml-[260px] mt-16 min-h-[calc(100vh-64px)] p-8 animate-fade-in">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
