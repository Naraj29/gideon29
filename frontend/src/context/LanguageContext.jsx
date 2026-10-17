import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

// ── All app-wide UI strings ────────────────────────────────────────────────────
export const translations = {
  en: {
    // Nav
    home: 'Home',
    search: 'Search',
    gideon: 'Gideon',
    tools: 'Tools',
    account: 'Account',
    history: 'History',

    // Sidebar
    switchAccount: 'Switch Account',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',

    // Executive Home Dashboard
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    aiStatusActive: 'Local Ollama Engine Online (1.5B) · 100% Private',
    heroTagline: 'Personal AI intelligence & executive workstation running on your local machine.',
    commandPlaceholder: 'Ask Gideon anything, draft an idea, or plan your day...',
    askGideon: 'Ask Gideon',
    quickPrompts: 'Suggested Inquiries',
    workspaceSuite: 'Integrated Workspace Suite',
    workspaceSubtitle: 'Privacy-first native tools designed for focus and productivity',
    systemMetrics: 'Workspace Telemetry',
    tasksPending: 'Tasks Active',
    notesSaved: 'Documents Saved',
    memoriesLogged: 'Memories Logged',
    vaultSecured: 'Vault Assets',
    quickCapture: 'Quick Task Capture',
    quickTaskPlaceholder: 'Type a task name and press Enter...',
    addTask: 'Add Task',
    launch: 'Launch Tool',
    viewAllTools: 'Explore All Tools',
    prompt1: 'Summarize my priorities for today',
    prompt2: 'Draft a short diary reflection',
    prompt3: 'Check my upcoming calendar schedule',
    prompt4: 'Tips for deep focused work',
    noTasksYet: 'No active tasks. You are all caught up!',
    taskCompleted: 'completed',

    // Home page
    featuredServices: 'Featured Services',
    seeAll: 'See all',
    allServices: 'All Services',
    noServices: 'No services in this category',
    tryDifferent: 'Try selecting a different category',
    customizeService: 'Customize your service',
    recommendedForYou: 'Recommended for you',
    startOver: 'Start Over',
    install: 'Install',
    hire: 'Hire',
    book: 'Book',
    order: 'Order',
    free: 'FREE',
    type: 'Type',
    price: 'Price',
    aiPowered: 'AI Powered',
    humanExpert: 'Human Expert',
    hybrid: 'Hybrid',

    // Customization questions
    preferenceQ: (name) => `What type of ${name.toLowerCase()} do you prefer?`,
    urgencyQ: 'How urgent is your need?',
    budgetQ: 'What is your budget range?',
    subjectQ: 'What subject do you need help with?',
    aiLabel: 'AI-Powered',
    aiDesc: 'Fast, available 24/7, lower cost',
    humanLabel: 'Human Expert',
    humanDesc: 'Personalized, experienced, higher quality',
    hybridLabel: 'Hybrid',
    hybridDesc: 'AI assistance with human oversight',
    immediate: 'Immediate',
    immediateDesc: 'Available now',
    today: 'Today',
    todayDesc: 'Within 24 hours',
    week: 'This Week',
    weekDesc: 'Flexible timing',
    budget: 'Budget-Friendly',
    budgetDesc: '$0 - $50',
    standard: 'Standard',
    standardDesc: '$50 - $150',
    premium: 'Premium',
    premiumDesc: '$150+',
    math: 'Mathematics',
    science: 'Science',
    subjectLanguage: 'Languages',
    other: 'Other',

    // AI Page
    tellGideon: 'Tell Gideon anything...',
    ghostProtocol: 'Ghost Protocol Active',
    cycleHistory: 'Cycle History',
    syncingTimeline: 'Syncing Timeline',
    noHistory: 'No cycles preserved in this timeline yet.',
    reviewTimeline: 'Review Universal Timeline',
    copiedClipboard: 'Conversation copied to clipboard',
    processing: 'Universal Processing...',
    gideonMistakes: 'Gideon can make mistakes. Verify important information.',

    // Common & Navbar
    language: 'Language',
    english: 'English',
    hindi: 'हिन्दी',
    searchPlaceholder: 'Search tools, features...',
    shareProfile: 'Share Profile',
    scanToConnect: 'Scan to connect',
    accountDetails: 'Account Details',
    username: 'Username',
    userId: 'User ID',
    shareProfileLink: 'Share Profile Link',
    refreshDemo: 'Refresh Demo',
    logout: 'Logout',
    toolsAndProducts: 'Tools & Products',
    memoryArchive: 'Memory Archive',
    taskSanctuary: 'Task Sanctuary',
    eventArchitect: 'Event Architect',
    unifiedCalendar: 'Unified Calendar',
    noteArchive: 'Note Archive',
    theVault: 'The Vault',
    theNavigator: 'The Navigator',
    theCalculator: 'The Calculator',
    universalToolbox: 'Universal Toolbox',
    homeDashboard: 'Home Dashboard',
    gideonIntelligence: 'Gideon Intelligence',
    activityHistory: 'Activity History',
    accountSettings: 'Account Settings',

    // Categories
    forYou: 'For You',
    services: 'Services',
    education: 'Education',
    health: 'Health',
    homeC: 'Home',
    creative: 'Creative',
    tech: 'Tech',
    entertainment: 'Entertainment',
    products: 'Products',
  },

  hi: {
    // Nav
    home: 'होम',
    search: 'खोज',
    gideon: 'गिदियन',
    tools: 'टूल्स',
    account: 'अकाउंट',
    history: 'इतिहास',

    // Sidebar
    switchAccount: 'अकाउंट बदलें',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',

    // Executive Home Dashboard
    goodMorning: 'सुप्रभात',
    goodAfternoon: 'शुभ दोपहर',
    goodEvening: 'शुभ संध्या',
    aiStatusActive: 'स्थानीय ओलामा इंजन सक्रिय (1.5B) · 100% निजी',
    heroTagline: 'आपके स्थानीय हार्डवेयर पर संचालित व्यक्तिगत AI इंटेलिजेंस और कार्यक्षेत्र।',
    commandPlaceholder: 'गिदियन से कुछ भी पूछें, विचार लिखें या योजना बनाएं...',
    askGideon: 'गिदियन से पूछें',
    quickPrompts: 'सुझाए गए प्रश्न',
    workspaceSuite: 'एकीकृत कार्यक्षेत्र टूल्स',
    workspaceSubtitle: 'गोपनीयता और उच्च उत्पादकता के लिए बने स्थानीय टूल्स',
    systemMetrics: 'कार्यक्षेत्र टेलीमेट्री',
    tasksPending: 'सक्रिय कार्य',
    notesSaved: 'सहेजे गए दस्तावेज़',
    memoriesLogged: 'सहेजे संस्मरण',
    vaultSecured: 'वॉल्ट संपत्तियां',
    quickCapture: 'त्वरित कार्य जोड़ें',
    quickTaskPlaceholder: 'नया कार्य लिखें और Enter दबाएं...',
    addTask: 'कार्य जोड़ें',
    launch: 'टूल खोलें',
    viewAllTools: 'सभी टूल्स देखें',
    prompt1: 'आज के मेरे मुख्य कार्यों का सारांश दें',
    prompt2: 'डायरी के लिए एक विचारशील नोट लिखें',
    prompt3: 'आज का शेड्यूल और कैलेंडर देखें',
    prompt4: 'गहन ध्यान और फोकस के लिए सुझाव दें',
    noTasksYet: 'कोई लंबित कार्य नहीं है। सब पूरा हो गया!',
    taskCompleted: 'पूर्ण',

    // Home page
    featuredServices: 'विशेष सेवाएं',
    seeAll: 'सब देखें',
    allServices: 'सभी सेवाएं',
    noServices: 'इस श्रेणी में कोई सेवा नहीं',
    tryDifferent: 'कोई अलग श्रेणी चुनें',
    customizeService: 'अपनी सेवा कस्टमाइज़ करें',
    recommendedForYou: 'आपके लिए अनुशंसित',
    startOver: 'फिर से शुरू करें',
    install: 'इंस्टॉल करें',
    hire: 'नियुक्त करें',
    book: 'बुक करें',
    order: 'ऑर्डर करें',
    free: 'मुफ्त',
    type: 'प्रकार',
    price: 'कीमत',
    aiPowered: 'AI संचालित',
    humanExpert: 'मानव विशेषज्ञ',
    hybrid: 'हाइब्रिड',

    // Customization questions
    preferenceQ: (name) => `आप किस प्रकार का ${name} पसंद करते हैं?`,
    urgencyQ: 'आपको कितनी जल्दी जरूरत है?',
    budgetQ: 'आपका बजट क्या है?',
    subjectQ: 'आपको किस विषय में मदद चाहिए?',
    aiLabel: 'AI संचालित',
    aiDesc: 'तेज़, 24/7 उपलब्ध, कम लागत',
    humanLabel: 'मानव विशेषज्ञ',
    humanDesc: 'व्यक्तिगत, अनुभवी, उच्च गुणवत्ता',
    hybridLabel: 'हाइब्रिड',
    hybridDesc: 'AI सहायता + मानव निगरानी',
    immediate: 'तुरंत',
    immediateDesc: 'अभी उपलब्ध',
    today: 'आज',
    todayDesc: '24 घंटे के भीतर',
    week: 'इस हफ्ते',
    weekDesc: 'लचीला समय',
    budget: 'किफायती',
    budgetDesc: '₹0 - ₹4,000',
    standard: 'सामान्य',
    standardDesc: '₹4,000 - ₹12,000',
    premium: 'प्रीमियम',
    premiumDesc: '₹12,000+',
    math: 'गणित',
    science: 'विज्ञान',
    subjectLanguage: 'भाषाएं',
    other: 'अन्य',

    // AI Page
    tellGideon: 'गिदियन से कुछ भी कहें...',
    ghostProtocol: 'गुप्त मोड सक्रिय',
    cycleHistory: 'इतिहास',
    syncingTimeline: 'समयरेखा सिंक हो रही है',
    noHistory: 'अभी तक कोई इतिहास नहीं है।',
    reviewTimeline: 'पूरा इतिहास देखें',
    copiedClipboard: 'बातचीत क्लिपबोर्ड पर कॉपी हुई',
    processing: 'प्रोसेस हो रहा है...',
    gideonMistakes: 'गिदियन गलती कर सकता है। महत्वपूर्ण जानकारी जांचें।',

    // Common & Navbar
    language: 'भाषा',
    english: 'English',
    hindi: 'हिन्दी',
    searchPlaceholder: 'टूल्स और सुविधाएं खोजें...',
    shareProfile: 'प्रोफ़ाइल साझा करें',
    scanToConnect: 'कनेक्ट करने के लिए स्कैन करें',
    accountDetails: 'अकाउंट विवरण',
    username: 'यूज़रनेम',
    userId: 'यूज़र आईडी',
    shareProfileLink: 'प्रोफ़ाइल लिंक साझा करें',
    refreshDemo: 'डेमो रीफ्रेश',
    logout: 'लॉगआउट',
    toolsAndProducts: 'टूल्स और उत्पाद',
    memoryArchive: 'मेमोरी आर्काइव',
    taskSanctuary: 'टास्क सैंक्चुअरी',
    eventArchitect: 'इवेंट आर्किटेक्ट',
    unifiedCalendar: 'कैलेंडर',
    noteArchive: 'नोट आर्काइव',
    theVault: 'द वॉल्ट',
    theNavigator: 'द नेविगेटर',
    theCalculator: 'कैलकुलेटर',
    universalToolbox: 'यूनिवर्सल टूलबॉक्स',
    homeDashboard: 'होम डैशबोर्ड',
    gideonIntelligence: 'गिदियन इंटेलिजेंस',
    activityHistory: 'गतिविधि इतिहास',
    accountSettings: 'अकाउंट सेटिंग्स',

    // Categories
    forYou: 'आपके लिए',
    services: 'सेवाएं',
    education: 'शिक्षा',
    health: 'स्वास्थ्य',
    homeC: 'घर',
    creative: 'रचनात्मक',
    tech: 'तकनीक',
    entertainment: 'मनोरंजन',
    products: 'उत्पाद',
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
  }, [lang]);

  const toggleLang = () => setLangState(prev => (prev === 'en' ? 'hi' : 'en'));
  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
};
