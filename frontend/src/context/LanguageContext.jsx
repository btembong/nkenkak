import { createContext, useContext, useState } from 'react'

const translations = {
  en: {
    // Nav
    home:       'Home',
    aboutUs:    'About Us',
    anthropology: 'Anthropology',
    donation:   'Donation',
    allProjects:'All Projects',
    education:  'Education',
    health:     'Health',
    infra:      'Infrastructure',
    pages:      'Pages',
    ourTeam:    'Our Team',
    gallery:    'Gallery',
    faq:        'FAQ',
    diaspora:   'Diaspora Map',
    volunteers: 'Volunteers',
    events:     'Events',
    news:       'News',
    contact:    'Contact',
    donateNow:  'Donate Now',
    login:      'Login',
    logout:     'Logout',
    myDashboard:'My Dashboard',
    profile:    'Profile',
    myDonations:'My Donations',
    adminPanel: 'Admin Panel',
    search:     'Search…',
    // Common
    viewAll:    'View All',
    readMore:   'Read More',
    register:   'Register',
    free:       'Free',
    learnMore:  'Learn More',
    // Home
    heroTitle:  'Together We Build a Stronger Community',
    heroSub:    'Supporting Nkenkak-Ngiesang through education, health, and sustainable development.',
    upcomingEvents: 'Upcoming Events',
    featuredProjects: 'Featured Projects',
    latestNews: 'Latest News',
    viewAllEvents: 'View All Events',
    viewAllProjects: 'View All Projects',
    viewAllNews: 'View All News',
    getTicket:  'Get Ticket',
    registerFree: 'Register — Free',
  },
  fr: {
    // Nav
    home:       'Accueil',
    aboutUs:    'À Propos',
    anthropology: 'Anthropologie',
    donation:   'Donation',
    allProjects:'Tous les Projets',
    education:  'Éducation',
    health:     'Santé',
    infra:      'Infrastructure',
    pages:      'Pages',
    ourTeam:    'Notre Équipe',
    gallery:    'Galerie',
    faq:        'FAQ',
    diaspora:   'Carte Diaspora',
    volunteers: 'Bénévoles',
    events:     'Événements',
    news:       'Actualités',
    contact:    'Contact',
    donateNow:  'Faire un Don',
    login:      'Connexion',
    logout:     'Déconnexion',
    myDashboard:'Mon Tableau de Bord',
    profile:    'Profil',
    myDonations:'Mes Dons',
    adminPanel: 'Panneau Admin',
    search:     'Rechercher…',
    // Common
    viewAll:    'Voir Tout',
    readMore:   'Lire Plus',
    register:   "S'inscrire",
    free:       'Gratuit',
    learnMore:  'En Savoir Plus',
    // Home
    heroTitle:  'Ensemble, Construisons une Communauté Plus Forte',
    heroSub:    'Soutenir Nkenkak-Ngiesang à travers l\'éducation, la santé et le développement durable.',
    upcomingEvents: 'Événements à Venir',
    featuredProjects: 'Projets en Vedette',
    latestNews: 'Dernières Actualités',
    viewAllEvents: 'Voir Tous les Événements',
    viewAllProjects: 'Voir Tous les Projets',
    viewAllNews: 'Voir Toutes les Actualités',
    getTicket:  'Obtenir un Billet',
    registerFree: "S'inscrire — Gratuit",
  },
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')

  const toggle = () => {
    const next = lang === 'en' ? 'fr' : 'en'
    setLang(next)
    localStorage.setItem('lang', next)
  }

  const t = (key) => translations[lang][key] ?? translations['en'][key] ?? key

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
