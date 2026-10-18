'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'pt-BR';

export interface Translations {
  // Brand & Header
  brandTitle: string;
  brandSubtitle: string;
  familyAccess: string;
  export: string;
  logVisit: string;
  signIn: string;
  signOut: string;
  spotsCount: (count: number) => string;

  // Language selector
  languageSelectLabel: string;
  english: string;
  portuguese: string;

  // Auth Banners
  signInHeadline: string;
  signInDesc: (ownerEmail: string) => string;
  signInGoogle: string;
  verifyingPermissions: string;
  accessRestricted: string;
  signedInAs: string;
  privateJournalNotice: (ownerEmail: string) => string;
  askOwnerNotice: (userEmail: string) => string;
  copyMyEmail: string;
  copiedEmail: (email: string) => string;
  switchAccount: string;

  // Hero section
  badgeJournalFull: string;
  badgeJournalShort: string;
  badgeMapsFull: string;
  badgeMapsShort: string;
  badgeCloudFull: string;
  badgeCloudShort: string;
  heroHeadline: string;
  heroSubtitle: string;
  logNewVisit: string;
  seedSampleSpots: string;
  seeding: string;

  // Stats Summary
  totalPlaces: string;
  avgRating: string;
  wouldReturnRate: string;
  topCategory: string;
  noData: string;

  // Search & Filters
  searchPlaceholder: string;
  clearSearch: string;
  allCategories: string;
  categoryLabels: Record<string, string>;
  wouldReturnFilterLabels: {
    all: string;
    'return-yes': string;
    'return-no': string;
  };
  sortByLabel: string;
  sortOptions: Record<string, string>;
  viewModeGrid: string;
  viewModeMap: string;
  showingCount: (filtered: number, total: number) => string;
  resetFilters: string;
  noMatchingSpots: string;
  noSpotsYet: string;
  logFirstSpot: string;

  // Place Cards
  visitedOn: string;
  wouldReturnBadge: string;
  wouldNotReturnBadge: string;
  highlightsTitle: string;
  considerationsTitle: string;
  googleReviews: (rating: number, count?: number) => string;
  viewOnGoogleMaps: string;
  visitWebsite: string;
  edit: string;
  duplicate: string;
  delete: string;
  loggedBy: string;
  you: string;

  // Place Form Modal
  logNewVisitTitle: string;
  editVisitTitle: string;
  googleSearchLabel: string;
  googleSearchPlaceholder: string;
  nameLabel: string;
  namePlaceholder: string;
  categoryLabel: string;
  dateVisitedLabel: string;
  ratingLabel: string;
  wouldReturnQuestion: string;
  wouldReturnYes: string;
  wouldReturnNo: string;
  priceRangeLabel: string;
  locationLabel: string;
  locationPlaceholder: string;
  formattedAddressLabel: string;
  notesLabel: string;
  notesPlaceholder: string;
  prosLabel: string;
  prosPlaceholder: string;
  consLabel: string;
  consPlaceholder: string;
  cancel: string;
  saveVisit: string;
  savingVisit: string;

  // Delete Confirm Modal
  deleteTitle: string;
  deleteDesc: (name: string) => string;
  deleteConfirmBtn: string;
  deletingBtn: string;

  // Export Modal
  exportTitle: string;
  exportDesc: string;
  exportHtmlBtn: string;
  exportHtmlDesc: string;
  exportCsvBtn: string;
  exportCsvDesc: string;
  exportJsonBtn: string;
  exportJsonDesc: string;
  importLabel: string;
  close: string;

  // Family Sharing Modal
  familyTitle: string;
  familySubtitle: string;
  ownerBoxTitle: string;
  ownerBadge: string;
  memberEmailLabel: string;
  memberEmailPlaceholder: string;
  memberEmailHelp: string;
  otherMembersLabel: string;
  otherMemberPlaceholder: string;
  addBtn: string;
  currentWhitelist: string;
  saveAccessBtn: string;
  savingAccessBtn: string;
  emailAlreadyInList: string;
  invalidEmail: string;

  // Map View
  mapTitle: string;
  mapSubtitle: string;
  pinsCount: (count: number) => string;
  noMapCoords: string;

  // Additional page and view elements
  sharedWith: (email: string) => string;
  emptyJournalTitle: string;
  emptyJournalDesc: string;
  populateStarterSpots: string;
  visitsTitle: (count: number) => string;
  showAllSpots: (total: number) => string;
  gridView: string;
  mapView: string;
  familyAccessSettings: string;
  exportHtmlBundle: string;

  // Map elements
  mapLegend: (count: number) => string;
  spotsOnMap: (count: number) => string;
  clickSpotToLocate: string;
  unmappedBadge: (count: number) => string;
  unmappedTooltip: (count: number) => string;
  noSpotsMappedYet: string;
  noSpotsMappedDesc: string;
  googleRatingLabel: string;
  topProLabel: string;
  editLog: string;
  returnShort: string;
  passShort: string;

  // Export / Restore modal elements
  copyHtmlCode: string;
  copiedHtmlToast: string;
  downloadHtmlBtn: string;
  downloadJsonBtn: string;
  restoreJsonTitle: string;
  restoreJsonDesc: string;
  uploadJsonBtn: string;
  resetToSampleTitle: string;
  resetToSampleDesc: string;
  resetToSampleBtn: string;

  // Footer
  footerText: string;

  // Toasts
  toastSignedIn: string;
  toastSignedOut: string;
  toastLogged: (name: string) => string;
  toastUpdated: (name: string) => string;
  toastDeleted: (name: string) => string;
  toastFamilySaved: string;
  toastSeeded: string;
  toastSignInFailed: string;
  toastPopupBlocked: string;
  toastPopupClosed: string;
}

const en: Translations = {
  brandTitle: 'Every Visited Spot',
  brandSubtitle: 'Family Spot & Visit Journal',
  familyAccess: 'Family Access',
  export: 'Export',
  logVisit: 'Log Visit',
  signIn: 'Sign In',
  signOut: 'Sign Out',
  spotsCount: (count) => (count === 1 ? '1 spot' : `${count} spots`),

  languageSelectLabel: 'Language',
  english: 'English',
  portuguese: 'Português (Brasil)',

  signInHeadline: 'Every Visited Spot',
  signInDesc: (ownerEmail) =>
    `Cloud persistence enabled via Firestore with Google Maps location intelligence. Sign in with your Google account (${ownerEmail} or your family member email) to access, log, and sync your favorite spots in real time.`,
  signInGoogle: 'Sign In with Google',
  verifyingPermissions: 'Verifying family access permissions...',
  accessRestricted: 'Access Restricted',
  signedInAs: 'You are signed in as',
  privateJournalNotice: (ownerEmail) => `This journal is private for ${ownerEmail} and family.`,
  askOwnerNotice: (userEmail) =>
    `If you are part of Elson's family, ask Elson to open "Family Access" and add your email address (${userEmail}) to the allowed access list.`,
  copyMyEmail: 'Copy My Email',
  copiedEmail: (email) => `Copied ${email} to clipboard!`,
  switchAccount: 'Sign Out / Switch Account',

  badgeJournalFull: 'Family Spot & Visit Journal',
  badgeJournalShort: 'Family Journal',
  badgeMapsFull: 'Google Maps Intelligence',
  badgeMapsShort: 'Google Maps',
  badgeCloudFull: 'Live Cloud Database',
  badgeCloudShort: 'Live Cloud',
  heroHeadline: 'Every Visited Spot',
  heroSubtitle:
    'Private cloud journal for Elson & Family. Browse visits, search Google Maps location insights, and log memorable outings together.',
  logNewVisit: 'Log New Visit',
  seedSampleSpots: 'Seed 5 Curated Spots',
  seeding: 'Seeding...',

  totalPlaces: 'Total Spots',
  avgRating: 'Average Rating',
  wouldReturnRate: 'Would Return',
  topCategory: 'Top Category',
  noData: 'No data yet',

  searchPlaceholder: 'Search by name, address, notes, or highlights...',
  clearSearch: 'Clear search',
  allCategories: 'All',
  categoryLabels: {
    All: 'All',
    'Coffee Shop': 'Coffee Shop',
    Bookstore: 'Bookstore',
    Restaurant: 'Restaurant',
    Bakery: 'Bakery',
    Bar: 'Bar',
    Other: 'Other',
  },
  wouldReturnFilterLabels: {
    all: 'All',
    'return-yes': 'Would Return (Yes)',
    'return-no': "Wouldn't Return",
  },
  sortByLabel: 'Sort By',
  sortOptions: {
    'date-desc': 'Newest First',
    'date-asc': 'Oldest First',
    'rating-desc': 'Highest Rating',
    'rating-asc': 'Lowest Rating',
    'name-asc': 'Name (A - Z)',
    'name-desc': 'Name (Z - A)',
  },
  viewModeGrid: 'Grid Journal',
  viewModeMap: 'Interactive Map',
  showingCount: (filtered, total) => `Showing ${filtered} of ${total} spots`,
  resetFilters: 'Reset filters',
  noMatchingSpots: 'No spots match your current filters or search.',
  noSpotsYet: 'No visited spots logged yet.',
  logFirstSpot: 'Log your first visited spot to begin your family journal!',

  visitedOn: 'Visited',
  wouldReturnBadge: 'Would Return',
  wouldNotReturnBadge: "Won't Return",
  highlightsTitle: 'Highlights',
  considerationsTitle: 'Considerations',
  googleReviews: (rating, count) =>
    count !== undefined ? `${rating} (${count} Google reviews)` : `${rating} on Google`,
  viewOnGoogleMaps: 'View on Google Maps',
  visitWebsite: 'Website',
  edit: 'Edit',
  duplicate: 'Duplicate Visit',
  delete: 'Delete',
  loggedBy: 'Logged by',
  you: 'You',

  logNewVisitTitle: 'Log New Place Visit',
  editVisitTitle: 'Edit Place Visit',
  googleSearchLabel: 'Search Google Maps to auto-fill details',
  googleSearchPlaceholder: 'Type venue name (e.g. Starbucks, Powell Books)...',
  nameLabel: 'Place Name',
  namePlaceholder: 'e.g. Blue Bottle Coffee',
  categoryLabel: 'Category',
  dateVisitedLabel: 'Date Visited',
  ratingLabel: 'Your Score',
  wouldReturnQuestion: 'Would you return?',
  wouldReturnYes: 'Yes, definitely return',
  wouldReturnNo: 'No, probably not',
  priceRangeLabel: 'Price Range',
  locationLabel: 'Neighborhood / City',
  locationPlaceholder: 'e.g. Downtown, SOMA',
  formattedAddressLabel: 'Full Address',
  notesLabel: 'Personal Notes & Review',
  notesPlaceholder: 'What did you order? How was the service, seating, vibes?',
  prosLabel: 'Highlights / Pros (press Enter to add)',
  prosPlaceholder: 'e.g. Great pour over, plenty of outlets',
  consLabel: 'Drawbacks / Cons (press Enter to add)',
  consPlaceholder: 'e.g. Hard to park, long line',
  cancel: 'Cancel',
  saveVisit: 'Save Visit',
  savingVisit: 'Saving...',

  deleteTitle: 'Delete Spot Entry',
  deleteDesc: (name) =>
    `Are you sure you want to delete "${name}" from the family journal? This action cannot be undone.`,
  deleteConfirmBtn: 'Delete Entry',
  deletingBtn: 'Deleting...',

  exportTitle: 'Export & Backup Journal',
  exportDesc:
    'Download a standalone offline HTML interactive viewer, CSV spreadsheet, or JSON raw backup.',
  exportHtmlBtn: 'Export Standalone HTML Viewer',
  exportHtmlDesc: 'Single self-contained file with search, filters, and offline access.',
  exportCsvBtn: 'Export CSV Spreadsheet',
  exportCsvDesc: 'Importable into Excel, Google Sheets, or Notion.',
  exportJsonBtn: 'Export Raw JSON',
  exportJsonDesc: 'Complete database backup file with all metadata.',
  importLabel: 'Import JSON Backup',
  close: 'Close',

  familyTitle: 'Family & Access Sharing',
  familySubtitle: 'Shared journal access for you and your family',
  ownerBoxTitle: 'Account Owner (You)',
  ownerBadge: 'Primary Access',
  memberEmailLabel: "Family Member's Google Email Address",
  memberEmailPlaceholder: 'e.g. family@gmail.com',
  memberEmailHelp:
    'When they sign in with this Google account, they will have full access to view, log, and rate visits in real time.',
  otherMembersLabel: 'Other Allowed Family Emails (Optional)',
  otherMemberPlaceholder: 'family.member@gmail.com',
  addBtn: 'Add',
  currentWhitelist: 'Current Access Whitelist:',
  saveAccessBtn: 'Save Family Access',
  savingAccessBtn: 'Saving...',
  emailAlreadyInList: 'This email is already in the access list.',
  invalidEmail: 'Please enter a valid email address.',

  mapTitle: 'Map View',
  mapSubtitle: 'Interactive geographical display of all logged spots',
  pinsCount: (count) => (count === 1 ? '1 pinned location' : `${count} pinned locations`),
  noMapCoords: 'No places with GPS coordinates found yet.',

  footerText:
    'Every Visited Spot — Private Cloud Journal for Elson & Family. Stored securely in Firestore with Google Maps location intelligence.',

  sharedWith: (email) => `Shared with ${email}`,
  emptyJournalTitle: 'Your cloud journal is currently empty',
  emptyJournalDesc:
    'Would you like to populate 5 curated starter spots (Blue Bottle Coffee, Livraria Cultura, Osteria Stella, etc.) with coordinates on Google Maps?',
  populateStarterSpots: 'Populate 5 Starter Spots',
  visitsTitle: (count) => `Visits (${count})`,
  showAllSpots: (total) => `Show all ${total} spots`,
  gridView: 'Grid View',
  mapView: 'Map View',
  familyAccessSettings: 'Family Access Settings',
  exportHtmlBundle: 'Export HTML Bundle',

  mapLegend: (count) => `Map Legend (${count} pinned)`,
  spotsOnMap: (count) => `Spots on Map (${count})`,
  clickSpotToLocate: 'Click any spot to locate',
  unmappedBadge: (count) => `${count} unmapped`,
  unmappedTooltip: (count) =>
    `${count} spots don't have coordinates. Edit them to search and attach Google Maps location.`,
  noSpotsMappedYet: 'No spots mapped yet',
  noSpotsMappedDesc: 'Log a visit and pick a location with Google Maps to see it on the map.',
  googleRatingLabel: 'Google Rating:',
  topProLabel: 'Top Pro:',
  editLog: 'Edit Log',
  returnShort: 'Return',
  passShort: 'Pass',

  copyHtmlCode: 'Copy HTML',
  copiedHtmlToast: 'Copied HTML code!',
  downloadHtmlBtn: 'Download Standalone HTML',
  downloadJsonBtn: 'Download JSON Backup',
  restoreJsonTitle: 'Restore from JSON Backup',
  restoreJsonDesc: 'Upload a previously exported JSON backup file to sync spots to your Firestore cloud journal.',
  uploadJsonBtn: 'Choose JSON File',
  resetToSampleTitle: 'Reset to 5 Curated Sample Spots',
  resetToSampleDesc: 'Need clean starter data? Replace with 5 curated coffee shops, bookstores, and restaurants.',
  resetToSampleBtn: 'Load Starter Spots',

  toastSignedIn: 'Signed in successfully!',
  toastSignedOut: 'Signed out',
  toastLogged: (name) => `Logged new visit to "${name}"`,
  toastUpdated: (name) => `Updated "${name}"`,
  toastDeleted: (name) => `Deleted "${name}"`,
  toastFamilySaved: 'Family access list updated and saved successfully!',
  toastSeeded: 'Seeded 5 curated sample spots with Google Maps coordinates!',
  toastSignInFailed: 'Sign in failed',
  toastPopupBlocked: 'Pop-up blocked: Please allow popups or tap Sign In again.',
  toastPopupClosed: 'Sign in window was closed.',
};

const ptBR: Translations = {
  brandTitle: 'Every Visited Spot',
  brandSubtitle: 'Diário Familiar de Lugares',
  familyAccess: 'Acesso Familiar',
  export: 'Exportar',
  logVisit: 'Registrar Visita',
  signIn: 'Entrar',
  signOut: 'Sair',
  spotsCount: (count) => (count === 1 ? '1 lugar' : `${count} lugares`),

  languageSelectLabel: 'Idioma',
  english: 'English',
  portuguese: 'Português (Brasil)',

  signInHeadline: 'Every Visited Spot',
  signInDesc: (ownerEmail) =>
    `Persistência em nuvem pelo Firestore com inteligência de localização do Google Maps. Entre com sua conta Google (${ownerEmail} ou e-mail de membro da família) para acessar, registrar e sincronizar seus lugares favoritos em tempo real.`,
  signInGoogle: 'Entrar com o Google',
  verifyingPermissions: 'Verificando permissões de acesso familiar...',
  accessRestricted: 'Acesso Restrito',
  signedInAs: 'Você está conectado como',
  privateJournalNotice: (ownerEmail) => `Este diário é privado para ${ownerEmail} e família.`,
  askOwnerNotice: (userEmail) =>
    `Se você faz parte da família do Elson, peça para ele abrir "Acesso Familiar" e adicionar seu e-mail (${userEmail}) à lista de permissões.`,
  copyMyEmail: 'Copiar Meu E-mail',
  copiedEmail: (email) => `${email} copiado para a área de transferência!`,
  switchAccount: 'Sair / Trocar de Conta',

  badgeJournalFull: 'Diário Familiar de Lugares',
  badgeJournalShort: 'Diário Familiar',
  badgeMapsFull: 'Inteligência Google Maps',
  badgeMapsShort: 'Google Maps',
  badgeCloudFull: 'Banco em Nuvem ao Vivo',
  badgeCloudShort: 'Nuvem ao Vivo',
  heroHeadline: 'Lugares Visitados',
  heroSubtitle:
    'Diário privado em nuvem para Elson & Família. Explore visitas, consulte detalhes de localização do Google Maps e registre momentos marcantes juntos.',
  logNewVisit: 'Registrar Novo Lugar',
  seedSampleSpots: 'Carregar 5 Lugares de Exemplo',
  seeding: 'Carregando...',

  totalPlaces: 'Total de Lugares',
  avgRating: 'Avaliação Média',
  wouldReturnRate: 'Voltaria',
  topCategory: 'Categoria Principal',
  noData: 'Sem dados ainda',

  searchPlaceholder: 'Buscar por nome, endereço, notas ou destaques...',
  clearSearch: 'Limpar busca',
  allCategories: 'Todas',
  categoryLabels: {
    All: 'Todas',
    'Coffee Shop': 'Cafeteria',
    Bookstore: 'Livraria',
    Restaurant: 'Restaurante',
    Bakery: 'Padaria',
    Bar: 'Bar',
    Other: 'Outro',
  },
  wouldReturnFilterLabels: {
    all: 'Todos',
    'return-yes': 'Voltaria (Sim)',
    'return-no': 'Não Voltaria',
  },
  sortByLabel: 'Ordenar Por',
  sortOptions: {
    'date-desc': 'Mais Recentes',
    'date-asc': 'Mais Antigos',
    'rating-desc': 'Melhor Avaliação',
    'rating-asc': 'Menor Avaliação',
    'name-asc': 'Nome (A - Z)',
    'name-desc': 'Nome (Z - A)',
  },
  viewModeGrid: 'Grade',
  viewModeMap: 'Mapa Interativo',
  showingCount: (filtered, total) => `Mostrando ${filtered} de ${total} lugares`,
  resetFilters: 'Limpar filtros',
  noMatchingSpots: 'Nenhum lugar corresponde aos filtros ou à busca atual.',
  noSpotsYet: 'Nenhum lugar registrado ainda.',
  logFirstSpot: 'Registre o seu primeiro lugar visitado para iniciar o diário familiar!',

  visitedOn: 'Visitado em',
  wouldReturnBadge: 'Voltaria',
  wouldNotReturnBadge: 'Não Voltaria',
  highlightsTitle: 'Pontos Positivos',
  considerationsTitle: 'Pontos a Melhorar',
  googleReviews: (rating, count) =>
    count !== undefined ? `${rating} (${count} avaliações no Google)` : `${rating} no Google`,
  viewOnGoogleMaps: 'Ver no Google Maps',
  visitWebsite: 'Site Oficial',
  edit: 'Editar',
  duplicate: 'Duplicar Visita',
  delete: 'Excluir',
  loggedBy: 'Registrado por',
  you: 'Você',

  logNewVisitTitle: 'Registrar Nova Visita',
  editVisitTitle: 'Editar Visita',
  googleSearchLabel: 'Buscar no Google Maps para preencher automaticamente',
  googleSearchPlaceholder: 'Digite o nome do local (ex: Café, Livraria, Restaurante)...',
  nameLabel: 'Nome do Lugar',
  namePlaceholder: 'ex: Santo Grão Café',
  categoryLabel: 'Categoria',
  dateVisitedLabel: 'Data da Visita',
  ratingLabel: 'Sua Nota',
  wouldReturnQuestion: 'Você voltaria?',
  wouldReturnYes: 'Sim, com certeza',
  wouldReturnNo: 'Não, provavelmente não',
  priceRangeLabel: 'Faixa de Preço',
  locationLabel: 'Bairro / Cidade',
  locationPlaceholder: 'ex: Jardins, São Paulo',
  formattedAddressLabel: 'Endereço Completo',
  notesLabel: 'Notas e Avaliação Pessoal',
  notesPlaceholder: 'O que você pediu? Como foi o atendimento, ambiente e experiência?',
  prosLabel: 'Destaques / Prós (pressione Enter para adicionar)',
  prosPlaceholder: 'ex: Ótimo café coado, ambiente tranquilo',
  consLabel: 'Pontos Negativos / Contras (pressione Enter para adicionar)',
  consPlaceholder: 'ex: Difícil estacionar, fila demorada',
  cancel: 'Cancelar',
  saveVisit: 'Salvar Visita',
  savingVisit: 'Salvando...',

  deleteTitle: 'Excluir Lugar do Diário',
  deleteDesc: (name) =>
    `Tem certeza de que deseja excluir "${name}" do diário familiar? Esta ação não pode ser desfeita.`,
  deleteConfirmBtn: 'Excluir Visita',
  deletingBtn: 'Excluindo...',

  exportTitle: 'Exportar e Fazer Backup',
  exportDesc:
    'Baixe um visualizador HTML interativo para usar offline, uma planilha CSV ou um backup completo em JSON.',
  exportHtmlBtn: 'Exportar Visualizador HTML Offline',
  exportHtmlDesc: 'Arquivo autônomo completo com busca, filtros e visualização sem internet.',
  exportCsvBtn: 'Exportar Planilha CSV',
  exportCsvDesc: 'Compatível com Excel, Google Planilhas ou Notion.',
  exportJsonBtn: 'Exportar Backup JSON',
  exportJsonDesc: 'Arquivo completo com todos os dados e metadados.',
  importLabel: 'Restaurar Backup JSON',
  close: 'Fechar',

  familyTitle: 'Compartilhamento com a Família',
  familySubtitle: 'Acesso compartilhado ao diário para você e sua família',
  ownerBoxTitle: 'Dono da Conta (Você)',
  ownerBadge: 'Acesso Principal',
  memberEmailLabel: 'E-mail Google do Membro da Família',
  memberEmailPlaceholder: 'ex: familia@gmail.com',
  memberEmailHelp:
    'Ao entrar com essa conta Google, a pessoa terá acesso total para ver, registrar e avaliar visitas em tempo real.',
  otherMembersLabel: 'Outros E-mails Permitidos da Família (Opcional)',
  otherMemberPlaceholder: 'parente@gmail.com',
  addBtn: 'Adicionar',
  currentWhitelist: 'Lista de Acesso Atual:',
  saveAccessBtn: 'Salvar Acesso Familiar',
  savingAccessBtn: 'Salvando...',
  emailAlreadyInList: 'Este e-mail já está na lista de acesso.',
  invalidEmail: 'Por favor, insira um endereço de e-mail válido.',

  mapTitle: 'Visão no Mapa',
  mapSubtitle: 'Mapa geográfico interativo de todos os lugares registrados',
  pinsCount: (count) => (count === 1 ? '1 local no mapa' : `${count} locais no mapa`),
  noMapCoords: 'Nenhum local com coordenadas GPS encontrado ainda.',

  footerText:
    'Every Visited Spot — Diário Privado em Nuvem para Elson & Família. Armazenado com segurança no Firestore com inteligência do Google Maps.',

  sharedWith: (email) => `Compartilhado com ${email}`,
  emptyJournalTitle: 'Seu diário em nuvem está vazio no momento',
  emptyJournalDesc:
    'Deseja carregar 5 lugares de exemplo selecionados (Santo Grão Café, Livraria Cultura, Osteria Stella, etc.) com coordenadas no Google Maps?',
  populateStarterSpots: 'Carregar 5 Lugares de Exemplo',
  visitsTitle: (count) => `Visitas (${count})`,
  showAllSpots: (total) => `Mostrar todos os ${total} lugares`,
  gridView: 'Grade',
  mapView: 'Mapa Interativo',
  familyAccessSettings: 'Configurações de Acesso Familiar',
  exportHtmlBundle: 'Exportar Pacote HTML',

  mapLegend: (count) => `Legenda do Mapa (${count} marcados)`,
  spotsOnMap: (count) => `Lugares no Mapa (${count})`,
  clickSpotToLocate: 'Clique em um local para focar no mapa',
  unmappedBadge: (count) => `${count} sem mapa`,
  unmappedTooltip: (count) =>
    `${count} lugares não têm coordenadas. Edite-os para buscar no Google Maps.`,
  noSpotsMappedYet: 'Nenhum lugar no mapa ainda',
  noSpotsMappedDesc: 'Registre uma visita e selecione a localização no Google Maps para visualizar no mapa.',
  googleRatingLabel: 'Avaliação Google:',
  topProLabel: 'Principal Destaque:',
  editLog: 'Editar Registro',
  returnShort: 'Voltar',
  passShort: 'Dispensar',

  copyHtmlCode: 'Copiar HTML',
  copiedHtmlToast: 'Código HTML copiado!',
  downloadHtmlBtn: 'Baixar Visualizador HTML',
  downloadJsonBtn: 'Baixar Backup JSON',
  restoreJsonTitle: 'Restaurar de Backup JSON',
  restoreJsonDesc: 'Envie um arquivo de backup JSON previamente exportado para sincronizar com seu diário no Firestore.',
  uploadJsonBtn: 'Escolher Arquivo JSON',
  resetToSampleTitle: 'Restaurar 5 Lugares de Exemplo',
  resetToSampleDesc: 'Precisa de dados de exemplo? Substitua por 5 cafeterias, livrarias e restaurantes selecionados.',
  resetToSampleBtn: 'Carregar Lugares de Exemplo',

  toastSignedIn: 'Conectado com sucesso!',
  toastSignedOut: 'Desconectado',
  toastLogged: (name) => `Nova visita registrada em "${name}"`,
  toastUpdated: (name) => `"${name}" atualizado com sucesso`,
  toastDeleted: (name) => `"${name}" excluído`,
  toastFamilySaved: 'Lista de acesso familiar atualizada e salva com sucesso!',
  toastSeeded: '5 lugares de exemplo com coordenadas do Google Maps adicionados!',
  toastSignInFailed: 'Falha ao entrar',
  toastPopupBlocked: 'Pop-up bloqueado: por favor, permita pop-ups ou toque em Entrar novamente.',
  toastPopupClosed: 'Janela de login foi fechada.',
};

const dictionaries: Record<Language, Translations> = {
  en,
  'pt-BR': ptBR,
};

const STORAGE_KEY = 'placevibe_preferred_lang';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
        if (stored === 'en' || stored === 'pt-BR') {
          setLanguageState(stored);
        } else if (
          typeof navigator !== 'undefined' &&
          navigator.language?.toLowerCase().startsWith('pt')
        ) {
          setLanguageState('pt-BR');
        }
      } catch {
        // Ignore storage errors
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: dictionaries[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
