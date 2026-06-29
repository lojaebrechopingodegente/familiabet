import { useAppData } from './useAppData'
import type { Recipe, MealPlan } from '@/types/database'

const sampleRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Sopa de Legumes',
    categories: ['almoco', 'jantar'],
    dietary_tags: ['baixa-sodio'],
    prep_time_minutes: 45,
    ingredients: [
      { name: 'Abobrinha', quantity: '2', unit: 'un' },
      { name: 'Cenoura', quantity: '2', unit: 'un' },
      { name: 'Batata', quantity: '3', unit: 'un' },
      { name: 'Cebola', quantity: '1', unit: 'un' },
      { name: 'Caldo de legumes', quantity: '1', unit: 'litro' },
    ],
    steps: [
      'Pique todos os legumes em cubos médios',
      'Refogue a cebola até dourar',
      'Adicione os legumes e o caldo',
      'Cozinhe por 30 minutos em fogo médio',
    ],
    nutrition: { calories: 180, protein: 6, carbs: 32, fat: 4, sodium: 120 },
    created_by: 'Maria',
    created_at: '2026-05-10T10:00:00Z',
  },
  {
    id: '2',
    name: 'Peito de Frango Grelhado',
    categories: ['almoco', 'jantar'],
    dietary_tags: ['diabetico', 'baixa-sodio'],
    prep_time_minutes: 25,
    ingredients: [
      { name: 'Peito de frango', quantity: '4', unit: 'un' },
      { name: 'Limão', quantity: '2', unit: 'un' },
      { name: 'Alho', quantity: '3', unit: 'dentes' },
      { name: 'Azeite', quantity: '2', unit: 'colheres' },
    ],
    steps: [
      'Tempere o frango com limão, alho e azeite',
      'Deixe marinar por 15 minutos',
      'Grelhe em fogo médio por 7 minutos de cada lado',
    ],
    nutrition: { calories: 220, protein: 35, carbs: 2, fat: 8, sodium: 85 },
    created_by: 'João',
    created_at: '2026-05-15T14:00:00Z',
  },
  {
    id: '3',
    name: ' mingau de Aveia',
    categories: ['cafe'],
    dietary_tags: ['diabetico'],
    prep_time_minutes: 10,
    ingredients: [
      { name: 'Aveia em flocos', quantity: '5', unit: 'colheres' },
      { name: 'Leite desnatado', quantity: '200', unit: 'ml' },
      { name: 'Canela', quantity: '1', unit: 'pitada' },
    ],
    steps: [
      'Aqueça o leite em fogo baixo',
      'Adicione a aveia e mexa constantemente',
      'Cozinhe por 5 minutos até engrossar',
      'Finalize com canela',
    ],
    nutrition: { calories: 150, protein: 8, carbs: 22, fat: 3, sodium: 60 },
    created_by: 'Maria',
    created_at: '2026-05-20T08:00:00Z',
  },
  {
    id: '4',
    name: 'Salada de Quinoa',
    categories: ['almoco', 'jantar'],
    dietary_tags: ['vegetariano', 'diabetico'],
    prep_time_minutes: 30,
    ingredients: [
      { name: 'Quinoa', quantity: '200', unit: 'g' },
      { name: 'Tomate cereja', quantity: '10', unit: 'un' },
      { name: 'Pepino', quantity: '1', unit: 'un' },
      { name: 'Azeite', quantity: '2', unit: 'colheres' },
      { name: 'Limão', quantity: '1', unit: 'un' },
    ],
    steps: [
      'Cozinhe a quinoa conforme instruções',
      'Corte os vegetais em cubos pequenos',
      'Misture tudo e tempere com azeite e limão',
      'Sirva frio',
    ],
    nutrition: { calories: 280, protein: 10, carbs: 38, fat: 10, sodium: 45 },
    created_by: 'Pedro',
    created_at: '2026-06-01T12:00:00Z',
  },
  {
    id: '5',
    name: 'Omelete de Claras',
    categories: ['cafe'],
    dietary_tags: ['diabetico', 'baixa-sodio'],
    prep_time_minutes: 10,
    ingredients: [
      { name: 'Claras de ovo', quantity: '4', unit: 'un' },
      { name: 'Espinafre', quantity: '1', unit: 'punhado' },
      { name: 'Tomate', quantity: '1', unit: 'un' },
    ],
    steps: [
      'Bata as claras em neve',
      'Adicione os vegetais picados',
      'Cozinhe em frigideira antiaderente',
    ],
    nutrition: { calories: 90, protein: 14, carbs: 4, fat: 1, sodium: 110 },
    created_by: 'João',
    created_at: '2026-06-05T07:00:00Z',
  },
]

const thisMonday = new Date()
thisMonday.setDate(thisMonday.getDate() - thisMonday.getDay() + 1)
const mondayStr = thisMonday.toISOString().split('T')[0]

const sampleMealPlan: MealPlan = {
  id: '1',
  week_start: mondayStr,
  meals: [
    { day: 'mon', type: 'cafe', recipe_id: '3', free_text: null, assigned_to: 'Maria', notes: '' },
    { day: 'mon', type: 'almoco', recipe_id: '1', free_text: null, assigned_to: 'João', notes: '' },
    { day: 'mon', type: 'jantar', recipe_id: '2', free_text: null, assigned_to: 'Pedro', notes: '' },
    { day: 'tue', type: 'cafe', recipe_id: '5', free_text: null, assigned_to: 'Maria', notes: '' },
    { day: 'tue', type: 'almoco', recipe_id: '4', free_text: null, assigned_to: 'João', notes: '' },
    { day: 'wed', type: 'cafe', recipe_id: '3', free_text: null, assigned_to: 'Maria', notes: '' },
    { day: 'wed', type: 'almoco', recipe_id: '2', free_text: null, assigned_to: 'Pedro', notes: '' },
  ],
  created_by: 'João',
  created_at: mondayStr + 'T00:00:00Z',
}

export function useRecipes() {
  const recipes = useAppData<Recipe>({ key: 'recipes', initialData: sampleRecipes })
  const mealPlans = useAppData<MealPlan>({ key: 'meal_plans', initialData: [sampleMealPlan] })

  const getCurrentWeekPlan = () => {
    const now = new Date()
    const monday = new Date(now)
    monday.setDate(monday.getDate() - monday.getDay() + 1)
    const mondayStr = monday.toISOString().split('T')[0]
    return mealPlans.data.find((p) => p.week_start === mondayStr) || null
  }

  return { recipes, mealPlans, getCurrentWeekPlan }
}
