
import React, { useState, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import LanguageToggle from './components/LanguageToggle';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import Spinner from './components/Spinner';
import { LocaleContext } from './contexts/LocaleContext';
import { GlobeAltIcon, HomeIcon, PlusCircleIcon, MagnifyingGlassCircleIcon, ChartBarIcon, UserGroupIcon } from './constants';
import AboutUsPage from './pages/AboutUsPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const SubmitComplaintPage = lazy(() => import('./pages/SubmitComplaintPage'));
const TrackStatusPage = lazy(() => import('./pages/TrackStatusPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));


// Simple Localization Context
const translations: Record<string, Record<string, string>> = {
  en: {
    home: "Home",
    submitComplaint: "Submit Complaint",
    trackStatus: "Track Status",
    adminDashboard: "Admin Dashboard",
    analytics: "Analytics",
    portalTitle: "Civic Complaints Portal",
    landingTitle: "Your Voice, Our Action: Fast-Track Civic Complaints",
    landingSubtitle: "Easily report municipal issues, track their progress, and see the impact of your feedback. Powered by AI for faster resolution.",
    processedLastMonth: "Complaints Processed Last 30 Days",
    averageResolution: "Average Resolution Time",
    citizenSatisfaction: "Citizen Satisfaction",
    submitNewComplaint: "Submit a New Complaint",
    trackMyComplaint: "Track My Complaint",
    ourImpact: "Our Impact",
    howItWorks: "How It Works",
    howItWorksDesc: "Our streamlined process ensures your complaints are heard, processed efficiently, and resolved quickly.",
    submitSimple: "Submit Easily",
    aiProcesses: "AI Processes & Routes",
    quickResolution: "Quick Resolution",
    selectCategory: "--- Select a Category ---",
    wasteManagement: "Waste Management",
    roadMaintenance: "Road Maintenance",
    waterSupply: "Water Supply",
    streetLighting: "Street Lighting",
    publicSafety: "Public Safety",
    other: "Other",
    categoryRequired: "Category is required.",
    descriptionMinLength: "Description must be at least 10 characters long.",
    locationRequired: "Location is required.",
    validMobileRequired: "A valid 10-digit mobile number is required.",
    photoSizeError: "Photo must be less than 5MB.",
    complaintSubmittedSuccess: "Complaint Submitted Successfully!",
    yourComplaintIDIs: "Your complaint ID is:",
    youWillReceiveSMS: "You will receive an SMS/WhatsApp with updates.",
    backToHome: "Back to Home",
    complaintCategory: "Complaint Category",
    complaintDescription: "Describe the Issue",
    descriptionPlaceholder: "Please provide as much detail as possible...",
    exactLocation: "Exact Location / Landmark",
    locationPlaceholder: "e.g., Near City Park, Ward 5",
    detectMyLocation: "Detect my location",
    yourMobileNumber: "Your Mobile Number (for updates)",
    uploadPhotoOptional: "Upload Photo (Optional)",
    chooseFile: "Choose File",
    photoSelected: "Photo Selected",
    submit: "Submit Complaint",
    locationNotFound: "Could not determine address. Please enter manually.",
    locationFetchError: "Error fetching location.",
    locationPermissionDenied: "Location permission denied.",
    geolocationNotSupported: "Geolocation is not supported by your browser.",
    // Footer translations
    contactUs: "Contact Us",
    helpline: "Helpline:",
    emailSupport: "Email Support:",
    quickLinks: "Quick Links",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    aboutUs: "About Us",
    disclaimer: "This portal is a prototype for demonstration purposes. Managed by the Municipal Corporation.",
    // Chatbot translations
    chatbotWelcome: "Hello! I'm your virtual assistant. How can I help you today?",
    chatbotChoose: "Please choose an option:",
    chatbotNewComplaint: "New Complaint",
    chatbotTrack: "Track Complaint",
    chatbotAskCategory: "Great! Let's file a new complaint. Please tell me the category (e.g., Waste Management, Road Maintenance).",
    chatbotAskDescription: "Got it. Now, please describe the issue in detail.",
    chatbotAskLocation: "Thank you. Please provide the exact location or a nearby landmark.",
    chatbotAskContact: "Almost done. What is your 10-digit mobile number for updates?",
    chatbotConfirm: "Please review the details below. Does everything look correct?",
    chatbotConfirmComplaint: "Confirm Complaint",
    chatbotCancel: "Cancel",
    chatbotSubmitting: "Submitting your complaint...",
    chatbotSuccess: "Your complaint has been submitted! Your Ticket ID is",
    chatbotAskTrackID: "Please enter your Ticket ID to check its status.",
    chatbotInvalidTrackID: "That doesn't seem like a valid Ticket ID. Please try again.",
    chatbotComplaintNotFound: "Sorry, I couldn't find a complaint with that ID.",
    chatbotStatusIs: "The status for your complaint is:",
    chatbotAnythingElse: "Is there anything else I can help you with?",
    chatbotBye: "Have a great day!",
    chatbotRestart: "Let me know if you need help again!",
    chatbotInvalidInput: "I'm sorry, I didn't understand that. Please choose from the options or describe your issue.",
    // Terms of Service
    termsTitle: "Terms of Service",
    termsLastUpdated: "Last Updated:",
    termsAcceptance: "By accessing or using the Civic Complaints Portal, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.",
    termsUsagePolicyTitle: "Platform Usage Policy",
    termsUsagePolicyContent1: "This platform is intended for submitting genuine civic complaints related to municipal services such as waste management, road maintenance, water supply, etc.",
    termsUsagePolicyContent2: "You agree not to use this platform for:",
    termsUsagePolicyItem1: "Commercial solicitation or advertising.",
    termsUsagePolicyItem2: "Spreading misinformation, defamatory, abusive, or obscene content.",
    termsUsagePolicyItem3: "Submitting false or malicious complaints to harass individuals or authorities.",
    termsUsagePolicyItem4: "Any illegal activities or to violate any applicable laws.",
    termsUserResponsibilitiesTitle: "User Responsibilities",
    termsUserResponsibilitiesContent1: "You are responsible for the accuracy and authenticity of the information you provide.",
    termsUserResponsibilitiesContent2: "Provide a valid contact number for updates and verification.",
    termsUserResponsibilitiesContent3: "Do not upload any content that infringes on third-party intellectual property rights or privacy.",
    termsDataPrivacyTitle: "Data Privacy and Protection",
    termsDataPrivacyContent: "We are committed to protecting your privacy. We collect personal data such as your name, contact number, and location solely for the purpose of processing your complaint. All data is handled in compliance with the Digital Personal Data Protection Act, 2023, and other relevant Indian data protection regulations. We do not share your personal information with third parties for marketing purposes.",
    termsVisibilityTitle: "Complaint Visibility and Transparency",
    termsVisibilityContent: "To promote transparency and for analytical purposes, anonymized details of complaints (such as category, location, and status) may be made publicly visible. Your personal contact information will never be shared publicly.",
    termsDisclaimersTitle: "Disclaimers",
    termsDisclaimersContent: "This portal acts as a facilitation tool to connect citizens with the relevant municipal authorities. While we strive for efficient processing, we do not guarantee a specific outcome or timeline for complaint resolution. The responsibility for acting on a complaint lies with the designated municipal department.",
    termsGoverningLawTitle: "Governing Law and Jurisdiction",
    termsGoverningLawContent: "These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of your use of this platform will be subject to the exclusive jurisdiction of the courts in the respective municipal area.",
    termsContactUsTitle: "Contact Us",
    termsContactUsContent: "If you have any questions about these Terms of Service, please contact us via the details provided in the footer.",
    // About Us
    aboutTitle: "About Our Platform",
    aboutIntro: "A next-generation civic engagement tool designed to bridge the gap between citizens and municipal authorities in India.",
    aboutMissionTitle: "Our Mission",
    aboutMissionContent: "Our mission is to empower every citizen to voice their concerns about public services easily and effectively. We leverage technology to foster transparency, accountability, and collaboration, ultimately leading to faster and more efficient resolution of civic issues and building smarter, more responsive cities.",
    aboutWhatWeDoTitle: "What We Do",
    aboutWhatWeDoContent: "We provide a streamlined, AI-powered platform where you can report local problems, track the resolution process in real-time, and see the tangible impact of your feedback. For municipal bodies, we offer powerful analytics and tools to understand trends, allocate resources efficiently, and improve service delivery.",
    aboutFeaturesTitle: "Our Core Features",
    aboutFeatureAI: "AI-Powered Categorization: Our smart system automatically analyzes, categorizes, and routes your complaint to the correct department, reducing manual effort and speeding up the process.",
    aboutFeatureMultilingual: "Multilingual Support: A fully bilingual interface ensures that language is never a barrier to civic participation.",
    aboutFeatureTracking: "Real-Time Tracking: Stay informed with live status updates from submission to resolution.",
    aboutFeatureAnalytics: "Proactive Analytics: We provide officials with data-driven insights to identify recurring issues and improve urban planning.",
    aboutFeatureAccessibility: "Accessible to All: We are committed to ensuring our platform is user-friendly and accessible to everyone, including persons with disabilities.",
    aboutCommitmentTitle: "Our Commitment",
    aboutCommitmentContent: "Built by a passionate team of civic tech innovators in collaboration with local government bodies, this platform is rooted in the values of public service and democratic participation. We are dedicated to upholding the highest standards of data privacy and security.",
    aboutJoinUsTitle: "Join Us in Building Better Cities",
    aboutJoinUsContent: "Your feedback is invaluable. If you have suggestions or ideas on how we can improve, please reach out. Together, we can make our communities better places to live.",
  },
  hi: {
    home: "मुख्य पृष्ठ",
    submitComplaint: "शिकायत दर्ज करें",
    trackStatus: "स्थिति ट्रैक करें",
    adminDashboard: "एडमिन डैशबोर्ड",
    analytics: "विश्लेषण",
    portalTitle: "नागरिक शिकायत पोर्टल",
    landingTitle: "आपकी आवाज़, हमारी कार्रवाई: नागरिक शिकायतों का त्वरित समाधान",
    landingSubtitle: "नगरपालिका के मुद्दों की आसानी से रिपोर्ट करें, उनकी प्रगति को ट्रैक करें, और अपनी प्रतिक्रिया का प्रभाव देखें। तीव्र समाधान के लिए एआई द्वारा संचालित।",
    processedLastMonth: "पिछले 30 दिनों में संसाधित शिकायतें",
    averageResolution: "औसत समाधान समय",
    citizenSatisfaction: "नागरिक संतुष्टि",
    submitNewComplaint: "नई शिकायत दर्ज करें",
    trackMyComplaint: "मेरी शिकायत ट्रैक करें",
    ourImpact: "हमारा प्रभाव",
    howItWorks: "यह कैसे काम करता है",
    howItWorksDesc: "हमारी सुव्यवस्थित प्रक्रिया सुनिश्चित करती है कि आपकी शिकायतें सुनी जाएं, कुशलता से संसाधित हों और शीघ्रता से हल की जाएं।",
    submitSimple: "आसानी से जमा करें",
    aiProcesses: "एआई प्रक्रिया और मार्ग",
    quickResolution: "त्वरित समाधान",
    selectCategory: "--- एक श्रेणी चुनें ---",
    wasteManagement: "कचरा प्रबंधन",
    roadMaintenance: "सड़क रखरखाव",
    waterSupply: "पानी की आपूर्ति",
    streetLighting: "स्ट्रीट लाइटिंग",
    publicSafety: "सार्वजनिक सुरक्षा",
    other: "अन्य",
    categoryRequired: "श्रेणी आवश्यक है।",
    descriptionMinLength: "विवरण कम से कम 10 अक्षरों का होना चाहिए।",
    locationRequired: "स्थान आवश्यक है।",
    validMobileRequired: "एक वैध 10-अंकीय मोबाइल नंबर आवश्यक है।",
    photoSizeError: "फोटो 5MB से कम होनी चाहिए।",
    complaintSubmittedSuccess: "शिकायत सफलतापूर्वक दर्ज की गई!",
    yourComplaintIDIs: "आपकी शिकायत आईडी है:",
    youWillReceiveSMS: "आपको अपडेट के साथ एक एसएमएस/व्हाट्सएप प्राप्त होगा।",
    backToHome: "होम पर वापस जाएं",
    complaintCategory: "शिकायत श्रेणी",
    complaintDescription: "समस्या का वर्णन करें",
    descriptionPlaceholder: "कृपया जितना हो सके उतना विवरण प्रदान करें...",
    exactLocation: "सटीक स्थान / लैंडमार्क",
    locationPlaceholder: "उदा., सिटी पार्क के पास, वार्ड 5",
    detectMyLocation: "मेरा स्थान पता लगाएँ",
    yourMobileNumber: "आपका मोबाइल नंबर (अपडेट के लिए)",
    uploadPhotoOptional: "फोटो अपलोड करें (वैकल्पिक)",
    chooseFile: "फ़ाइल चुनें",
    photoSelected: "फोटो चुना गया",
    submit: "शिकायत जमा करें",
    locationNotFound: "पता निर्धारित नहीं किया जा सका। कृपया मैन्युअल रूप से दर्ज करें।",
    locationFetchError: "स्थान प्राप्त करने में त्रुटि।",
    locationPermissionDenied: "स्थान की अनुमति अस्वीकार कर दी गई।",
    geolocationNotSupported: "जियोलोकेशन आपके ब्राउज़र द्वारा समर्थित नहीं है।",
    // Footer translations
    contactUs: "हमसे संपर्क करें",
    helpline: "हेल्पलाइन:",
    emailSupport: "ईमेल सहायता:",
    quickLinks: "त्वरित लिंक्स",
    privacyPolicy: "गोपनीयता नीति",
    termsOfService: "सेवा की शर्तें",
    aboutUs: "हमारे बारे में",
    disclaimer: "यह पोर्टल प्रदर्शन उद्देश्यों के लिए एक प्रोटोटाइप है। नगर निगम द्वारा प्रबंधित।",
    // Chatbot translations
    chatbotWelcome: "नमस्ते! मैं आपका वर्चुअल असिस्टेंट हूँ। मैं आज आपकी कैसे मदद कर सकता हूँ?",
    chatbotChoose: "कृपया एक विकल्प चुनें:",
    chatbotNewComplaint: "नई शिकायत",
    chatbotTrack: "शिकायत ट्रैक करें",
    chatbotAskCategory: "बहुत अच्छा! चलिए एक नई शिकायत दर्ज करते हैं। कृपया श्रेणी बताएं (जैसे, कचरा प्रबंधन, सड़क रखरखाव)।",
    chatbotAskDescription: "समझ गया। अब, कृपया समस्या का विस्तार से वर्णन करें।",
    chatbotAskLocation: "धन्यवाद। कृपया सटीक स्थान या पास का कोई लैंडमार्क बताएं।",
    chatbotAskContact: "लगभग हो गया। अपडेट के लिए आपका 10 अंकों का मोबाइल नंबर क्या है?",
    chatbotConfirm: "कृपया नीचे दिए गए विवरण की समीक्षा करें। क्या सब कुछ सही है?",
    chatbotConfirmComplaint: "शिकायत की पुष्टि करें",
    chatbotCancel: "रद्द करें",
    chatbotSubmitting: "आपकी शिकायत जमा की जा रही है...",
    chatbotSuccess: "आपकी शिकायत दर्ज हो गई है! आपकी टिकट आईडी है",
    chatbotAskTrackID: "स्थिति जांचने के लिए कृपया अपनी टिकट आईडी दर्ज करें।",
    chatbotInvalidTrackID: "यह एक वैध टिकट आईडी नहीं लगती। कृपया पुनः प्रयास करें।",
    chatbotComplaintNotFound: "क्षमा करें, मुझे इस आईडी से कोई शिकायत नहीं मिली।",
    chatbotStatusIs: "आपकी शिकायत की स्थिति है:",
    chatbotAnythingElse: "क्या मैं आपकी और कोई मदद कर सकता हूँ?",
    chatbotBye: "आपका दिन शुभ हो!",
    chatbotRestart: "यदि आपको फिर से सहायता की आवश्यकता हो तो मुझे बताएं।",
    chatbotInvalidInput: "मुझे क्षमा करें, मैं यह समझ नहीं पाया। कृपया विकल्पों में से चुनें या अपनी समस्या का वर्णन करें।",
    // Terms of Service - Hindi
    termsTitle: "सेवा की शर्तें",
    termsLastUpdated: "अंतिम अपडेट:",
    termsAcceptance: "नागरिक शिकायत पोर्टल का उपयोग करके, आप इन सेवा की शर्तों से बंधे होने के लिए सहमत हैं। यदि आप इन शर्तों के किसी भी हिस्से से सहमत नहीं हैं, तो आप हमारी सेवाओं का उपयोग नहीं कर सकते।",
    termsUsagePolicyTitle: "प्लेटफ़ॉर्म उपयोग नीति",
    termsUsagePolicyContent1: "यह प्लेटफ़ॉर्म नगरपालिका सेवाओं जैसे कचरा प्रबंधन, सड़क रखरखाव, जलापूर्ति आदि से संबंधित वास्तविक नागरिक शिकायतें दर्ज करने के लिए है।",
    termsUsagePolicyContent2: "आप इस प्लेटफ़ॉर्म का उपयोग निम्नलिखित के लिए नहीं करने के लिए सहमत हैं:",
    termsUsagePolicyItem1: "व्यावसायिक आग्रह या विज्ञापन।",
    termsUsagePolicyItem2: "गलत सूचना, मानहानिकारक, अपमानजनक या अश्लील सामग्री फैलाना।",
    termsUsagePolicyItem3: "व्यक्तियों या अधिकारियों को परेशान करने के लिए झूठी या दुर्भावनापूर्ण शिकायतें दर्ज करना।",
    termsUsagePolicyItem4: "कोई भी अवैध गतिविधि या किसी भी लागू कानून का उल्लंघन करना।",
    termsUserResponsibilitiesTitle: "उपयोगकर्ता की जिम्मेदारियाँ",
    termsUserResponsibilitiesContent1: "आपके द्वारा प्रदान की गई जानकारी की सटीकता और प्रामाणिकता के लिए आप जिम्मेदार हैं।",
    termsUserResponsibilitiesContent2: "अपडेट और सत्यापन के लिए एक वैध संपर्क नंबर प्रदान करें।",
    termsUserResponsibilitiesContent3: "ऐसी कोई भी सामग्री अपलोड न करें जो किसी तीसरे पक्ष के बौद्धिक संपदा अधिकारों या गोपनीयता का उल्लंघन करती हो।",
    termsDataPrivacyTitle: "डेटा गोपनीयता और संरक्षण",
    termsDataPrivacyContent: "हम आपकी गोपनीयता की रक्षा के लिए प्रतिबद्ध हैं। हम आपकी शिकायत के प्रसंस्करण के उद्देश्य से आपका व्यक्तिगत डेटा जैसे नाम, संपर्क नंबर और स्थान एकत्र करते हैं। सभी डेटा को डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 और अन्य प्रासंगिक भारतीय डेटा संरक्षण नियमों के अनुपालन में नियंत्रित किया जाता है। हम आपकी व्यक्तिगत जानकारी को विपणन उद्देश्यों के लिए तीसरे पक्ष के साथ साझा नहीं करते हैं।",
    termsVisibilityTitle: "शिकायत दृश्यता और पारदर्शिता",
    termsVisibilityContent: "पारदर्शिता को बढ़ावा देने और विश्लेषणात्मक उद्देश्यों के लिए, शिकायतों के अनाम विवरण (जैसे श्रेणी, स्थान और स्थिति) सार्वजनिक रूप से दिखाई दे सकते हैं। आपकी व्यक्तिगत संपर्क जानकारी कभी भी सार्वजनिक रूप से साझा नहीं की जाएगी।",
    termsDisclaimersTitle: "अस्वीकरण",
    termsDisclaimersContent: "यह पोर्टल नागरिकों को संबंधित नगरपालिका अधिकारियों से जोड़ने के लिए एक सुविधा उपकरण के रूप में कार्य करता है। यद्यपि हम कुशल प्रसंस्करण के लिए प्रयास करते हैं, हम शिकायत समाधान के लिए किसी विशिष्ट परिणाम या समय-सीमा की गारंटी नहीं देते हैं। शिकायत पर कार्रवाई करने की जिम्मेदारी निर्दिष्ट नगरपालिका विभाग की है।",
    termsGoverningLawTitle: "शासकीय कानून और क्षेत्राधिकार",
    termsGoverningLawContent: "ये शर्तें भारत के कानूनों के अनुसार शासित और मानी जाएंगी। इस प्लेटफ़ॉर्म के आपके उपयोग से उत्पन्न होने वाले किसी भी विवाद संबंधित नगरपालिका क्षेत्र की अदालतों के अनन्य क्षेत्राधिकार के अधीन होंगे।",
    termsContactUsTitle: "हमसे संपर्क करें",
    termsContactUsContent: "यदि इन सेवा की शर्तों के बारे में आपके कोई प्रश्न हैं, तो कृपया फुटर में दिए गए विवरण के माध्यम से हमसे संपर्क करें।",
    // About Us - Hindi
    aboutTitle: "हमारे प्लेटफ़ॉर्म के बारे में",
    aboutIntro: "भारत में नागरिकों और नगरपालिका अधिकारियों के बीच की खाई को पाटने के लिए बनाया गया एक अगली पीढ़ी का नागरिक सहभागिता उपकरण।",
    aboutMissionTitle: "हमारा मिशन",
    aboutMissionContent: "हमारा मिशन प्रत्येक नागरिक को सार्वजनिक सेवाओं के बारे में अपनी चिंताओं को आसानी से और प्रभावी ढंग से व्यक्त करने के लिए सशक्त बनाना है। हम प्रौद्योगिकी का लाभ उठाकर पारदर्शिता, जवाबदेही और सहयोग को बढ़ावा देते हैं, जिससे नागरिक मुद्दों का तेजी से और अधिक कुशल समाधान होता है और बेहतर, अधिक उत्तरदायी शहरों का निर्माण होता है।",
    aboutWhatWeDoTitle: "हम क्या करते हैं",
    aboutWhatWeDoContent: "हम एक सुव्यवस्थित, एआई-संचालित प्लेटफ़ॉर्म प्रदान करते हैं जहां आप स्थानीय समस्याओं की रिपोर्ट कर सकते हैं, समाधान प्रक्रिया को वास्तविक समय में ट्रैक कर सकते हैं, और अपनी प्रतिक्रिया का ठोस प्रभाव देख सकते हैं। नगर निकायों के लिए, हम प्रवृत्तियों को समझने, संसाधनों को कुशलतापूर्वक आवंटित करने और सेवा वितरण में सुधार करने के लिए शक्तिशाली विश्लेषण और उपकरण प्रदान करते हैं।",
    aboutFeaturesTitle: "हमारी मुख्य विशेषताएं",
    aboutFeatureAI: "एआई-संचालित वर्गीकरण: हमारा स्मार्ट सिस्टम स्वचालित रूप से आपकी शिकायत का विश्लेषण, वर्गीकरण और सही विभाग को भेजता है, जिससे मैन्युअल प्रयास कम होते हैं और प्रक्रिया तेज होती है।",
    aboutFeatureMultilingual: "बहुभाषी समर्थन: एक पूरी तरह से द्विभाषी इंटरफ़ेस यह सुनिश्चित करता है कि भाषा नागरिक भागीदारी में कभी बाधा न बने।",
    aboutFeatureTracking: "वास्तविक समय ट्रैकिंग: जमा करने से लेकर समाधान तक लाइव स्थिति अपडेट के साथ सूचित रहें।",
    aboutFeatureAnalytics: "सक्रिय विश्लेषण: हम अधिकारियों को आवर्ती मुद्दों की पहचान करने और शहरी नियोजन में सुधार के लिए डेटा-संचालित अंतर्दृष्टि प्रदान करते हैं।",
    aboutFeatureAccessibility: "सभी के लिए सुलभ: हम यह सुनिश्चित करने के लिए प्रतिबद्ध हैं कि हमारा प्लेटफ़ॉर्म विकलांग व्यक्तियों सहित सभी के लिए उपयोगकर्ता-अनुकूल और सुलभ हो।",
    aboutCommitmentTitle: "हमारी प्रतिबद्धता",
    aboutCommitmentContent: "स्थानीय सरकारी निकायों के सहयोग से नागरिक तकनीक के उत्साही नवप्रवर्तकों की एक टीम द्वारा निर्मित, यह प्लेटफ़ॉर्म सार्वजनिक सेवा और लोकतांत्रिक भागीदारी के मूल्यों में निहित है। हम डेटा गोपनीयता और सुरक्षा के उच्चतम मानकों को बनाए रखने के लिए समर्पित हैं।",
    aboutJoinUsTitle: "बेहतर शहर बनाने में हमारा साथ दें",
    aboutJoinUsContent: "आपकी प्रतिक्रिया अमूल्य है। यदि आपके पास सुधार के लिए कोई सुझाव या विचार हैं, तो कृपया हमसे संपर्क करें। साथ मिलकर, हम अपने समुदायों को रहने के लिए बेहतर स्थान बना सकते हैं।",
  }
};


const Header: React.FC<{ currentLang: string, onToggleLang: (lang: string) => void, t: (key: string) => string }> = ({ currentLang, onToggleLang, t }) => {
  return (
    <header className="bg-neutral-white shadow-sm py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center text-xl md:text-2xl font-bold text-gov-blue-900">
          <GlobeAltIcon className="h-8 w-8 mr-2 text-gov-blue-500" aria-hidden="true" />
          <span className={currentLang === 'hi' ? 'font-sans' : ''}>{t('portalTitle')}</span>
        </Link>
        <div className="flex items-center space-x-4">
          <LanguageToggle currentLang={currentLang} onToggle={onToggleLang} />
        </div>
      </div>
    </header>
  );
};

const Navbar: React.FC<{ t: (key: string) => string, currentLang: string }> = ({ t, currentLang }) => {
  const location = useLocation();
  const navItems = [
    { name: t('home'), path: '/', icon: HomeIcon },
    { name: t('submitComplaint'), path: '/submit', icon: PlusCircleIcon },
    { name: t('trackStatus'), path: '/track', icon: MagnifyingGlassCircleIcon },
    { name: t('adminDashboard'), path: '/admin', icon: UserGroupIcon },
    { name: t('analytics'), path: '/analytics', icon: ChartBarIcon },
  ];

  return (
    <nav className="bg-gov-blue-900 text-neutral-white py-3 shadow-md sticky top-[80px] z-40">
      <div className="container mx-auto flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 px-4 sm:px-6 lg:px-8">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`
              flex items-center px-3 py-2 rounded-lg text-sm font-medium
              hover:bg-gov-blue-500 transition-colors duration-150
              ${location.pathname === item.path ? 'bg-gov-blue-500' : ''}
              ${currentLang === 'hi' ? 'font-sans' : ''} button-link
            `}
            aria-current={location.pathname === item.path ? "page" : undefined}
          >
            <item.icon className="h-5 w-5 mr-2" aria-hidden="true" />
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};


function App() {
  const [lang, setLang] = useState('en');

  const t = (key: string) => translations[lang]?.[key] || key;

  return (
    <LocaleContext.Provider value={{ lang, setLang, t }}>
      <HashRouter>
        <div className={`flex flex-col min-h-screen ${lang === 'hi' ? 'font-sans' : ''}`}>
            <Header currentLang={lang} onToggleLang={setLang} t={t} />
            <Navbar t={t} currentLang={lang} />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 main-content">
              <Suspense fallback={<Spinner />}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/submit" element={<SubmitComplaintPage />} />
                    <Route path="/track" element={<TrackStatusPage />} />
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/about" element={<AboutUsPage />} />
                    <Route path="/terms" element={<TermsOfServicePage />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <Chatbot />
        </div>
      </HashRouter>
    </LocaleContext.Provider>
  );
}

export default App;
