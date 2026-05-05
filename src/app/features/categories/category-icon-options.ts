import type { LucideIconData } from 'lucide-angular';
import {
  Apple,
  Banknote,
  Bike,
  BookOpen,
  Briefcase,
  Bus,
  Car,
  Coffee,
  CreditCard,
  Dumbbell,
  Flower2,
  Gamepad2,
  Gift,
  HeartPulse,
  Home,
  Laptop,
  PiggyBank,
  Pill,
  Plane,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Store,
  Tag,
  Tv,
  Utensils,
  Wallet,
  Wrench,
  Zap,
} from 'lucide-angular';

export const CATEGORY_ICON_SLUGS = [
  'tag',
  'home',
  'wallet',
  'credit-card',
  'banknote',
  'piggy-bank',
  'shopping-cart',
  'shopping-bag',
  'store',
  'car',
  'bus',
  'plane',
  'bike',
  'utensils',
  'coffee',
  'apple',
  'pill',
  'heart-pulse',
  'dumbbell',
  'book-open',
  'briefcase',
  'laptop',
  'smartphone',
  'tv',
  'gamepad-2',
  'shirt',
  'gift',
  'wrench',
  'zap',
  'flower-2',
] as const;

export type CategoryIconSlug = (typeof CATEGORY_ICON_SLUGS)[number];

export interface CategoryIconOption {
  slug: CategoryIconSlug;
  label: string;
  icon: LucideIconData;
}

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { slug: 'tag', label: 'Etiqueta', icon: Tag },
  { slug: 'home', label: 'Casa', icon: Home },
  { slug: 'wallet', label: 'Carteira', icon: Wallet },
  { slug: 'credit-card', label: 'Cartão', icon: CreditCard },
  { slug: 'banknote', label: 'Dinheiro', icon: Banknote },
  { slug: 'piggy-bank', label: 'Poupança', icon: PiggyBank },
  { slug: 'shopping-cart', label: 'Carrinho', icon: ShoppingCart },
  { slug: 'shopping-bag', label: 'Sacola', icon: ShoppingBag },
  { slug: 'store', label: 'Loja', icon: Store },
  { slug: 'car', label: 'Carro', icon: Car },
  { slug: 'bus', label: 'Ônibus', icon: Bus },
  { slug: 'plane', label: 'Avião', icon: Plane },
  { slug: 'bike', label: 'Bicicleta', icon: Bike },
  { slug: 'utensils', label: 'Refeição', icon: Utensils },
  { slug: 'coffee', label: 'Café', icon: Coffee },
  { slug: 'apple', label: 'Alimentação', icon: Apple },
  { slug: 'pill', label: 'Farmácia', icon: Pill },
  { slug: 'heart-pulse', label: 'Saúde', icon: HeartPulse },
  { slug: 'dumbbell', label: 'Academia', icon: Dumbbell },
  { slug: 'book-open', label: 'Educação', icon: BookOpen },
  { slug: 'briefcase', label: 'Trabalho', icon: Briefcase },
  { slug: 'laptop', label: 'Tecnologia', icon: Laptop },
  { slug: 'smartphone', label: 'Celular', icon: Smartphone },
  { slug: 'tv', label: 'Entretenimento', icon: Tv },
  { slug: 'gamepad-2', label: 'Games', icon: Gamepad2 },
  { slug: 'shirt', label: 'Vestuário', icon: Shirt },
  { slug: 'gift', label: 'Presentes', icon: Gift },
  { slug: 'wrench', label: 'Manutenção', icon: Wrench },
  { slug: 'zap', label: 'Energia', icon: Zap },
  { slug: 'flower-2', label: 'Natureza', icon: Flower2 },
];

const ICON_BY_SLUG = new Map<string, LucideIconData>(
  CATEGORY_ICON_OPTIONS.map((o) => [o.slug, o.icon]),
);

export function isKnownCategoryIconSlug(slug: string | null | undefined): boolean {
  const s = slug?.trim();
  return !!s && ICON_BY_SLUG.has(s);
}

export function categoryLucideIcon(slug: string): LucideIconData {
  return ICON_BY_SLUG.get(slug.trim()) ?? Tag;
}
