import { useState } from 'react'
import { ToastProvider } from '@/components/ToastProvider'
import { MainLayout } from '@/components/MainLayout'
import type { ModuleId } from '@/components/Sidebar'
import { ConsultasMedicas } from '@/sections/ConsultasMedicas'
import { Remedios } from '@/sections/Remedios'
import { Compras } from '@/sections/Compras'
import { Marmitas } from '@/sections/Marmitas'
import { Documentos } from '@/sections/Documentos'
import { Visitas } from '@/sections/Visitas'
import { Ligacoes } from '@/sections/Ligacoes'
import { Orcamentos } from '@/sections/Orcamentos'
import { Fraldas } from '@/sections/Fraldas'

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('consultas')

  const renderModule = () => {
    switch (activeModule) {
      case 'consultas': return <ConsultasMedicas />
      case 'remedios': return <Remedios />
      case 'compras': return <Compras />
      case 'marmitas': return <Marmitas />
      case 'documentos': return <Documentos />
      case 'visitas': return <Visitas />
      case 'ligacoes': return <Ligacoes />
      case 'orcamentos': return <Orcamentos />
      case 'fraldas': return <Fraldas />
      default: return <ConsultasMedicas />
    }
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50">
        <MainLayout activeModule={activeModule} onModuleChange={setActiveModule}>
          {renderModule()}
        </MainLayout>
      </div>
    </ToastProvider>
  )
}
