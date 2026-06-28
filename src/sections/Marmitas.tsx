import { useState } from 'react'
import { ChefHat, Utensils, Flame, ShieldAlert, Plus, Clock, X, Pencil } from 'lucide-react'
import { DataCard } from '@/components/DataCard'
import { EmptyState } from '@/components/EmptyState'
import { SearchInput } from '@/components/SearchInput'
import { useToast } from '@/components/ToastProvider'
import { useRecipes } from '@/hooks/useRecipes'
import type { Recipe, MealSlot, WeekDay, MealType } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const weekDays: { key: WeekDay; label: string }[] = [
  { key: 'mon', label: 'Seg' }, { key: 'tue', label: 'Ter' }, { key: 'wed', label: 'Qua' },
  { key: 'thu', label: 'Qui' }, { key: 'fri', label: 'Sex' }, { key: 'sat', label: 'Sáb' }, { key: 'sun', label: 'Dom' },
]
// eslint-disable-next-line @typescript-eslint/no-unused-vars

const mealTypes: { key: MealType; label: string; color: string }[] = [
  { key: 'cafe', label: 'Café', color: 'bg-amber-50 border-amber-200' },
  { key: 'almoco', label: 'Almoço', color: 'bg-green-50 border-green-200' },
  { key: 'jantar', label: 'Jantar', color: 'bg-blue-50 border-blue-200' },
]

const dietaryLabels: Record<string, string> = {
  diabetico: 'Diabético', 'baixa-sodio': 'Baixa Sódio', vegetariano: 'Vegetariano',
  'sem-lactose': 'Sem Lactose', 'sem-gluten': 'Sem Glúten',
}

const dietaryColors: Record<string, string> = {
  diabetico: 'bg-blue-100 text-blue-700', 'baixa-sodio': 'bg-green-100 text-green-700',
  vegetariano: 'bg-emerald-100 text-emerald-700', 'sem-lactose': 'bg-yellow-100 text-yellow-700',
  'sem-gluten': 'bg-orange-100 text-orange-700',
}

export function Marmitas() {
  const { recipes, mealPlans, getCurrentWeekPlan } = useRecipes()
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [recipeDialog, setRecipeDialog] = useState(false)
  const [mealDialog, setMealDialog] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [editingRecipe, setEditingRecipe] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ day: WeekDay; type: MealType } | null>(null)
  const [mealForm, setMealForm] = useState({ recipeId: '', freeText: '', assignedTo: 'João', notes: '' })

  const [recipeForm, setRecipeForm] = useState({
    name: '', categories: [] as string[], dietary_tags: [] as string[],
    prep_time_minutes: 30, ingredients: [{ name: '', quantity: '', unit: '' }],
    steps: [''], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 },
  })

  const weekPlan = getCurrentWeekPlan()
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const todayKey = weekDays[todayIndex]?.key || 'mon'

  const getMealForSlot = (day: WeekDay, type: MealType): MealSlot | undefined => {
    return weekPlan?.meals.find((m) => m.day === day && m.type === type)
  }

  const getRecipeName = (recipeId: string | null) => {
    if (!recipeId) return null
    return recipes.data.find((r) => r.id === recipeId)?.name || null
  }

  const openMealSlot = (day: WeekDay, type: MealType) => {
    setSelectedSlot({ day, type })
    const existing = getMealForSlot(day, type)
    if (existing) {
      setMealForm({ recipeId: existing.recipe_id || '', freeText: existing.free_text || '', assignedTo: existing.assigned_to, notes: existing.notes })
    } else {
      setMealForm({ recipeId: '', freeText: '', assignedTo: 'João', notes: '' })
    }
    setMealDialog(true)
  }

  const saveMeal = () => {
    if (!selectedSlot || !weekPlan) return
    const updatedMeals = weekPlan.meals.filter((m) => !(m.day === selectedSlot.day && m.type === selectedSlot.type))
    updatedMeals.push({
      day: selectedSlot.day,
      type: selectedSlot.type,
      recipe_id: mealForm.recipeId || null,
      free_text: mealForm.freeText || null,
      assigned_to: mealForm.assignedTo,
      notes: mealForm.notes,
    })
    mealPlans.update(weekPlan.id, { meals: updatedMeals })
    setMealDialog(false)
    addToast('success', 'Refeição atualizada no cardápio')
  }

  const filteredRecipes = recipes.data.filter((r) => {
    if (filterCategory !== 'all' && !r.categories.includes(filterCategory)) return false
    if (!search) return true
    const q = search.toLowerCase()
    return r.name.toLowerCase().includes(q) || r.dietary_tags.some((t) => t.toLowerCase().includes(q))
  })

  const openRecipeDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setRecipeDialog(true)
  }

  const openAddRecipe = () => {
    setEditingRecipe(false)
    setRecipeForm({
      name: '', categories: [], dietary_tags: [], prep_time_minutes: 30,
      ingredients: [{ name: '', quantity: '', unit: '' }], steps: [''],
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 },
    })
    setRecipeDialog(true)
  }

  const handleSaveRecipe = () => {
    if (!recipeForm.name) { addToast('warning', 'Nome da receita é obrigatório'); return }
    recipes.add({ ...recipeForm, created_by: 'João' })
    addToast('success', 'Receita cadastrada')
    setRecipeDialog(false)
  }

  // Stats
  const todayMeals = weekPlan?.meals.filter((m) => m.day === todayKey) || []
  const avgCalories = recipes.data.length > 0
    ? Math.round(recipes.data.reduce((s, r) => s + (r.nutrition?.calories || 0), 0) / recipes.data.length)
    : 0

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ChefHat className="w-6 h-6 text-warning" />
            <h1 className="text-display text-navy">Cardápio e Marmitas</h1>
          </div>
          <p className="text-slate-400 text-sm">Planejamento de refeições e controle nutricional</p>
        </div>
        <Button onClick={openAddRecipe} className="bg-navy hover:bg-navy-light text-white gap-2">
          <Plus className="w-4 h-4" />
          Nova Receita
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-data text-navy">{todayMeals.length}/3</p>
              <p className="text-xs text-slate-400">Refeições Hoje</p>
            </div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-health-light flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-health" />
            </div>
            <div>
              <p className="text-data text-navy">Maria</p>
              <p className="text-xs text-slate-400">Preparadas por</p>
            </div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-critical-light flex items-center justify-center">
              <Flame className="w-5 h-5 text-critical" />
            </div>
            <div>
              <p className="text-data text-navy">{avgCalories}</p>
              <p className="text-xs text-slate-400">kcal média/refeição</p>
            </div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info-light flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-data text-navy">2</p>
              <p className="text-xs text-slate-400">Restrições ativas</p>
            </div>
          </div>
        </DataCard>
      </div>

      {/* Weekly Meal Planner */}
      <DataCard title="Cardápio Semanal" className="mb-8">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const isToday = day.key === todayKey
            return (
              <div key={day.key} className={`rounded-lg border ${isToday ? 'border-health border-2' : 'border-slate-200'} overflow-hidden`}>
                <div className={`text-center py-2 ${isToday ? 'bg-health text-white' : 'bg-slate-50'}`}>
                  <p className={`text-[10px] font-medium uppercase ${isToday ? 'text-white/80' : 'text-slate-400'}`}>{day.label}</p>
                </div>
                <div className="p-1.5 space-y-1.5 min-h-[140px]">
                  {mealTypes.map((mt) => {
                    const meal = getMealForSlot(day.key, mt.key)
                    const recipeName = meal?.recipe_id ? getRecipeName(meal.recipe_id) : null
                    return (
                      <button
                        key={mt.key}
                        onClick={() => openMealSlot(day.key, mt.key)}
                        className={`w-full rounded-md border p-1.5 text-left transition-all hover:shadow-sm ${
                          recipeName ? `${mt.color}` : 'border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <p className={`text-[9px] font-medium uppercase mb-0.5 ${mt.key === 'cafe' ? 'text-amber-600' : mt.key === 'almoco' ? 'text-green-600' : 'text-blue-600'}`}>
                          {mt.label}
                        </p>
                        {recipeName ? (
                          <p className="text-[11px] font-medium text-navy leading-tight line-clamp-2">{recipeName}</p>
                        ) : (
                          <div className="flex items-center justify-center h-5">
                            <Plus className="w-3 h-3 text-slate-300" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </DataCard>

      {/* Recipe Repository */}
      <div className="flex items-center gap-4 mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar receita..." className="flex-1 max-w-md" />
        <div className="flex gap-2">
          {(['all', 'cafe', 'almoco', 'jantar', 'diabetico', 'baixa-sodio'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterCategory === c ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c === 'all' ? 'Todas' : c === 'cafe' ? 'Café' : c === 'almoco' ? 'Almoço' : c === 'jantar' ? 'Jantar' : c === 'diabetico' ? 'Diabético' : 'Baixa Sódio'}
            </button>
          ))}
        </div>
      </div>

      <DataCard title={`Receitas (${filteredRecipes.length})`}>
        {filteredRecipes.length === 0 ? (
          <EmptyState icon={<ChefHat className="w-8 h-8 text-slate-300" />} title="Nenhuma receita" action={<Button onClick={openAddRecipe} variant="outline" className="gap-2"><Plus className="w-4 h-4" />Nova Receita</Button>} />
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {filteredRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => openRecipeDetail(recipe)}
                className="text-left bg-white rounded-[10px] shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden group hover:-translate-y-0.5"
              >
                <div className="h-1 bg-health" />
                <div className="h-32 bg-slate-50 flex items-center justify-center">
                  <Utensils className="w-10 h-10 text-slate-200" />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-navy truncate mb-2">{recipe.name}</h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {recipe.categories.slice(0, 2).map((c) => (
                      <span key={c} className="text-[9px] font-medium uppercase px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                        {c === 'cafe' ? 'Café' : c === 'almoco' ? 'Almoço' : c === 'jantar' ? 'Jantar' : c}
                      </span>
                    ))}
                    {recipe.dietary_tags.slice(0, 2).map((t) => (
                      <span key={t} className={`text-[9px] font-medium uppercase px-1.5 py-0.5 rounded ${dietaryColors[t] || 'bg-slate-100 text-slate-500'}`}>
                        {dietaryLabels[t] || t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{recipe.nutrition?.calories || 0} kcal</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{recipe.prep_time_minutes} min</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </DataCard>

      {/* Meal Dialog */}
      <Dialog open={mealDialog} onOpenChange={setMealDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-heading-1 text-navy">
              {selectedSlot && `${mealTypes.find((m) => m.key === selectedSlot.type)?.label} — ${weekDays.find((d) => d.key === selectedSlot.day)?.label}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Selecionar Receita</Label>
              <Select value={mealForm.recipeId} onValueChange={(v) => setMealForm({ ...mealForm, recipeId: v, freeText: '' })}>
                <SelectTrigger><SelectValue placeholder="Escolha uma receita..." /></SelectTrigger>
                <SelectContent>
                  {recipes.data.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ou descreva a refeição</Label>
              <Input value={mealForm.freeText} onChange={(e) => setMealForm({ ...mealForm, freeText: e.target.value, recipeId: '' })} placeholder="Ex: Peixe grelhado com salada" />
            </div>
            <div className="space-y-2">
              <Label>Responsável pelo preparo</Label>
              <Select value={mealForm.assignedTo} onValueChange={(v) => setMealForm({ ...mealForm, assignedTo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="João">João</SelectItem>
                  <SelectItem value="Maria">Maria</SelectItem>
                  <SelectItem value="Pedro">Pedro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={mealForm.notes} onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setMealDialog(false)}>Cancelar</Button>
            <Button onClick={saveMeal} className="bg-navy hover:bg-navy-light text-white">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recipe Detail / Add Dialog */}
      <Dialog open={recipeDialog} onOpenChange={setRecipeDialog}>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
          {selectedRecipe && !editingRecipe ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 flex-wrap">
                  <DialogTitle className="text-display text-navy">{selectedRecipe.name}</DialogTitle>
                  {selectedRecipe.dietary_tags.map((t) => (
                    <span key={t} className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded ${dietaryColors[t] || ''}`}>
                      {dietaryLabels[t] || t}
                    </span>
                  ))}
                </div>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-4">
                <div>
                  <h3 className="text-heading-2 text-navy mb-3">Ingredientes</h3>
                  <ul className="space-y-1.5">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                        {ing.name} — {ing.quantity} {ing.unit}
                      </li>
                    ))}
                  </ul>
                  <h3 className="text-heading-2 text-navy mb-3 mt-6">Modo de Preparo</h3>
                  <ol className="space-y-2">
                    {selectedRecipe.steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-600">
                        <span className="w-5 h-5 rounded-full bg-navy text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h3 className="text-heading-2 text-navy mb-3">Informações Nutricionais</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-400">Calorias</span><span className="font-medium text-navy">{selectedRecipe.nutrition?.calories || 0} kcal</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Proteínas</span><span className="font-medium text-navy">{selectedRecipe.nutrition?.protein || 0}g</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Carboidratos</span><span className="font-medium text-navy">{selectedRecipe.nutrition?.carbs || 0}g</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Gorduras</span><span className="font-medium text-navy">{selectedRecipe.nutrition?.fat || 0}g</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Sódio</span><span className="font-medium text-navy">{selectedRecipe.nutrition?.sodium || 0}mg</span></div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>Tempo de preparo: <strong className="text-navy">{selectedRecipe.prep_time_minutes} min</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setEditingRecipe(true); setRecipeForm({ ...selectedRecipe, ingredients: [...selectedRecipe.ingredients], steps: [...selectedRecipe.steps], nutrition: { ...selectedRecipe.nutrition } }) }}>
                  <Pencil className="w-4 h-4 mr-2" /> Editar
                </Button>
                <Button className="bg-navy hover:bg-navy-light text-white">Usar no Cardápio</Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-heading-1 text-navy">{editingRecipe ? 'Editar Receita' : 'Nova Receita'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome <span className="text-critical">*</span></Label>
                  <Input value={recipeForm.name} onChange={(e) => setRecipeForm({ ...recipeForm, name: e.target.value })} placeholder="Nome da receita" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tempo de preparo (min)</Label>
                    <Input type="number" value={recipeForm.prep_time_minutes} onChange={(e) => setRecipeForm({ ...recipeForm, prep_time_minutes: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Calorias</Label>
                    <Input type="number" value={recipeForm.nutrition.calories} onChange={(e) => setRecipeForm({ ...recipeForm, nutrition: { ...recipeForm.nutrition, calories: parseInt(e.target.value) || 0 } })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Categorias (separadas por vírgula)</Label>
                  <Input value={recipeForm.categories.join(', ')} onChange={(e) => setRecipeForm({ ...recipeForm, categories: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="almoco, jantar" />
                </div>
                <div className="space-y-2">
                  <Label>Tags dietéticas (separadas por vírgula)</Label>
                  <Input value={recipeForm.dietary_tags.join(', ')} onChange={(e) => setRecipeForm({ ...recipeForm, dietary_tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="diabetico, baixa-sodio" />
                </div>
                <div className="space-y-2">
                  <Label>Ingredientes</Label>
                  {recipeForm.ingredients.map((ing, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={ing.name} onChange={(e) => { const newIng = [...recipeForm.ingredients]; newIng[i].name = e.target.value; setRecipeForm({ ...recipeForm, ingredients: newIng }) }} placeholder="Ingrediente" className="flex-1" />
                      <Input value={ing.quantity} onChange={(e) => { const newIng = [...recipeForm.ingredients]; newIng[i].quantity = e.target.value; setRecipeForm({ ...recipeForm, ingredients: newIng }) }} placeholder="Qtd" className="w-20" />
                      <Input value={ing.unit} onChange={(e) => { const newIng = [...recipeForm.ingredients]; newIng[i].unit = e.target.value; setRecipeForm({ ...recipeForm, ingredients: newIng }) }} placeholder="Un" className="w-20" />
                      {recipeForm.ingredients.length > 1 && (
                        <button onClick={() => setRecipeForm({ ...recipeForm, ingredients: recipeForm.ingredients.filter((_, idx) => idx !== i) })} className="text-slate-400 hover:text-critical"><X className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setRecipeForm({ ...recipeForm, ingredients: [...recipeForm.ingredients, { name: '', quantity: '', unit: '' }] })}>
                    <Plus className="w-3 h-3 mr-1" /> Adicionar Ingrediente
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Passos</Label>
                  {recipeForm.steps.map((step, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="w-6 h-6 rounded-full bg-navy text-white text-[10px] flex items-center justify-center shrink-0 mt-1">{i + 1}</span>
                      <Textarea value={step} onChange={(e) => { const newSteps = [...recipeForm.steps]; newSteps[i] = e.target.value; setRecipeForm({ ...recipeForm, steps: newSteps }) }} rows={2} className="flex-1" />
                      {recipeForm.steps.length > 1 && (
                        <button onClick={() => setRecipeForm({ ...recipeForm, steps: recipeForm.steps.filter((_, idx) => idx !== i) })} className="text-slate-400 hover:text-critical"><X className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setRecipeForm({ ...recipeForm, steps: [...recipeForm.steps, ''] })}>
                    <Plus className="w-3 h-3 mr-1" /> Adicionar Passo
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setRecipeDialog(false)}>Cancelar</Button>
                <Button onClick={handleSaveRecipe} className="bg-navy hover:bg-navy-light text-white">Salvar Receita</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
