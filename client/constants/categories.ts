import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    _id: '1',
    name: 'Fitness',
    slug: 'fitness',
    icon: 'Dumbbell',
    color: '#B388FF',
    gradient: 'linear-gradient(135deg, #B388FF, #FF7043)',
    isActive: true,
  },
  {
    _id: '2',
    name: 'Yoga',
    slug: 'yoga',
    icon: 'Flower2',
    color: '#7C4DFF',
    gradient: 'linear-gradient(135deg, #7C4DFF, #B388FF)',
    isActive: true,
  },
  {
    _id: '3',
    name: 'Dance',
    slug: 'dance',
    icon: 'Music',
    color: '#E91E63',
    gradient: 'linear-gradient(135deg, #E91E63, #F48FB1)',
    isActive: true,
  },
  {
    _id: '4',
    name: 'Martial Arts',
    slug: 'martial-arts',
    icon: 'Swords',
    color: '#FF9800',
    gradient: 'linear-gradient(135deg, #FF9800, #FFB74D)',
    isActive: true,
  },
  {
    _id: '5',
    name: 'Nutrition',
    slug: 'nutrition',
    icon: 'Apple',
    color: '#4CAF50',
    gradient: 'linear-gradient(135deg, #4CAF50, #81C784)',
    isActive: true,
  },
  {
    _id: '6',
    name: 'Sports',
    slug: 'sports',
    icon: 'Trophy',
    color: '#2196F3',
    gradient: 'linear-gradient(135deg, #2196F3, #64B5F6)',
    isActive: true,
  },
  {
    _id: '7',
    name: 'Meditation',
    slug: 'meditation',
    icon: 'Brain',
    color: '#009688',
    gradient: 'linear-gradient(135deg, #009688, #4DB6AC)',
    isActive: true,
  },
  {
    _id: '8',
    name: 'Physiotherapy',
    slug: 'physiotherapy',
    icon: 'HeartPulse',
    color: '#F44336',
    gradient: 'linear-gradient(135deg, #F44336, #EF9A9A)',
    isActive: true,
  },
];

export const getCategoryBySlug = (slug: string): Category | undefined =>
  CATEGORIES.find((c) => c.slug === slug);

export const getCategoryById = (id: string): Category | undefined =>
  CATEGORIES.find((c) => c._id === id);
