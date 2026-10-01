import { BookOpen, Brain, CalendarCheck, Code2, Database, FlaskConical, Layers, LayoutDashboard, Network, Settings, Sparkles, Timer, Workflow } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  section?: 'dsa' | 'sql' | 'ml' | 'sd' | 'mlsd' | 'theory'
}

export const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/plan', label: 'Study Plan', icon: CalendarCheck },
    ],
  },
  {
    group: 'Coding',
    items: [
      { to: '/dsa', label: 'DSA · NeetCode 150', icon: Code2, section: 'dsa' },
      { to: '/sql', label: 'SQL', icon: Database, section: 'sql' },
      { to: '/ml-coding', label: 'ML Coding', icon: FlaskConical, section: 'ml' },
    ],
  },
  {
    group: 'Design',
    items: [
      { to: '/system-design', label: 'System Design', icon: Network, section: 'sd' },
      { to: '/ml-design', label: 'ML System Design', icon: Workflow, section: 'mlsd' },
    ],
  },
  {
    group: 'Knowledge',
    items: [
      { to: '/theory', label: 'ML Theory', icon: Brain, section: 'theory' },
      { to: '/review', label: 'Flashcards', icon: Layers },
      { to: '/visualizers', label: 'Visualizers', icon: Sparkles },
    ],
  },
  {
    group: 'Practice',
    items: [
      { to: '/mock', label: 'Mock Interview', icon: Timer },
      { to: '/resources', label: 'Resources', icon: BookOpen },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]
