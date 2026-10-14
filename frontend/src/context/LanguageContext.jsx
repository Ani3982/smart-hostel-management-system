import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  mr: {
    // 🏛️ College Branding (As shown in official emblem)
    societyName: "अहिल्यानगर जिल्हा मराठा विद्या प्रसारक समाज, अहिल्यानगर",
    collegeName: "न्यू आर्ट्स, कॉमर्स अँड सायन्स कॉलेज, अहिल्यानगर",
    collegeFullName: "अहिल्यानगर जिल्हा मराठा विद्या प्रसारक समाज संचलित न्यू आर्ट्स, कॉमर्स अँड सायन्स कॉलेज, अहिल्यानगर (स्वायत्त)",
    collegeAutonomous: "न्यू आर्ट्स, कॉमर्स अँड सायन्स कॉलेज, अहिल्यानगर (स्वायत्त)",
    autonomousBadge: "स्वायत्त (AUTONOMOUS)",
    collegeMotto: "तेजो सि तेजो मे देही",
    collegeSub: "सावित्रीबाई फुले पुणे विद्यापीठाशी संलग्न | कला, वाणिज्य व विज्ञान स्वायत्त महाविद्यालय | नॅक (NAAC) कडून 'A++' श्रेणी",
    hostelSystem: "ऑनलाईन वसतिगृह व्यवस्थापन प्रणाली",
    portalSubtitle: "मुले व मुलींचे वसतिगृह अधिकृत पोर्टल • अहिल्यानगर",
    naacGrade: "नॅक 'A++' मानांकन",
    cityAddress: "लाल टाकी रोड, अहिल्यानगर, महाराष्ट्र - ४१४००१",
    
    // 🏢 Hostels
    boysHostel: "मुलांचे वसतिगृह (छत्रपती शिवाजी महाराज भवन)",
    girlsHostel: "मुलींचे वसतिगृह (सावित्रीबाई फुले भवन)",
    boysHostelShort: "मुलांचे वसतिगृह",
    girlsHostelShort: "मुलींचे वसतिगृह",
    northCampus: "उत्तर संकुल, लाल टाकी रोड, अहिल्यानगर",
    southCampus: "दक्षिण संकुल, लाल टाकी रोड, अहिल्यानगर",
    
    // 🧭 Navigation
    home: "मुख्यपृष्ठ",
    about: "वसतिगृहाबद्दल",
    availability: "जागांची उपलब्धता",
    store: "वसतिगृह भांडार",
    login: "लॉगिन करा",
    register: "विद्यार्थी नोंदणी",
    dashboard: "डॅशबोर्ड",
    applications: "अर्ज यादी",
    pendingApplications: "प्रलंबित अर्ज",
    rooms: "खोल्या व मजले",
    beds: "खाटा व वाटप",
    students: "विद्यार्थी यादी",
    payments: "फी जमा व पावत्या",
    reports: "अहवाल व आकडेवारी",
    profile: "माझे प्रोफाईल",
    logout: "बाहेर पडा (Sign Out)",
    
    // 👨‍🎓 Student Portal
    applicationStatus: "अर्जाची स्थिती",
    myRoomBed: "माझी खोली व खाट",
    feePayment: "वसतिगृह फी भरणा",
    applyNow: "वसतिगृहासाठी अर्ज करा",
    studentPortal: "विद्यार्थी कक्ष (STUDENT PORTAL)",
    residentStudent: "वसतिगृह निवासी विद्यार्थी",
    welcomeBack: "पुन्हा स्वागत आहे",
    stepTimeline: "प्रवेश प्रक्रिया टप्पे",
    
    // 🛡️ Warden / Admin Portal
    wardenDesk: "वसतिगृह प्रमुख कक्ष (WARDEN)",
    superAdminConsole: "मुख्य प्रशासक कक्ष (ADMIN)",
    manageHostels: "वसतिगृह व्यवस्थापन",
    manageHeads: "वसतिगृह रेक्टर / प्रमुख",
    manageRooms: "खोल्यांचे व्यवस्थापन",
    manageBeds: "खाटांचे व्यवस्थापन",
    manageStudents: "विद्यार्थी व्यवस्थापन",
    manageApplications: "सर्व अर्ज व्यवस्थापन",
    managePayments: "फी भरणा व्यवस्थापन",
    allHostels: "सर्व वसतिगृहे",
    allApplications: "सर्व अर्ज",
    allRooms: "सर्व खोल्या",
    allBeds: "सर्व खाटा",
    allStudents: "सर्व विद्यार्थी",
    allPayments: "सर्व फी पावत्या",
    
    // 🏷️ Status Badges
    AVAILABLE: "उपलब्ध",
    OCCUPIED: "व्यापलेले",
    RESERVED: "राखीव",
    MAINTENANCE: "दुरुस्तीत",
    PENDING: "प्रलंबित",
    APPROVED: "मंजूर",
    REJECTED: "नाकारलेले",
    CANCELLED: "रद्द",
    SUCCESS: "यशस्वी",
    FAILED: "अयशस्वी",
    ACTIVE: "सक्रिय",
    INACTIVE: "निष्क्रिय",
    
    // 🌟 Hero & Landing Page
    heroTitle: "ऑनलाईन वसतिगृह प्रवेश व व्यवस्थापन प्रणाली",
    heroSubtitle: "अहिल्यानगर जिल्हा मराठा विद्या प्रसारक समाज संचलित न्यू आर्ट्स, कॉमर्स अँड सायन्स कॉलेजच्या विद्यार्थ्यांसाठी सोपी, सुरक्षित आणि १००% पारदर्शक ऑनलाईन वसतिगृह व्यवस्था.",
    studentLogin: "विद्यार्थी लॉगिन",
    staffLogin: "वसतिगृह प्रमुख / ॲडमिन लॉगिन",
    liveStats: "थेट वसतिगृह स्थिती व आकडेवारी",
    totalHostels: "एकूण वसतिगृहे",
    totalRooms: "एकूण खोल्या",
    totalBeds: "एकूण खाटांची क्षमता",
    availableBeds: "उपलब्ध खाटा",
    occupiedBeds: "प्रवेशित खाटा",
    totalStudents: "एकूण नोंदणीकृत विद्यार्थी",
    totalRevenue: "एकूण जमा फी रक्कम",
    approvedApplications: "मंजूर झालेले अर्ज",
    rejectedApplications: "नाकारलेले अर्ज",
    
    // 📝 Registration & Forms
    personalInfo: "वैयक्तिक माहिती",
    fullName: "विद्यार्थ्याचे पूर्ण नाव",
    dob: "जन्मतारीख",
    gender: "लिंग",
    male: "पुरुष (Male)",
    female: "स्त्री (Female)",
    mobile: "मोबाईल क्रमांक",
    email: "ईमेल पत्ता",
    address: "कायमचा पत्ता",
    city: "गाव / शहर",
    state: "राज्य",
    pincode: "पिन कोड",
    
    academicInfo: "शैक्षणिक माहिती",
    collegeNameField: "महाविद्यालयाचे नाव",
    course: "अभ्यासक्रम / पदवी (उदा. B.Sc. Comp Sci, M.Com)",
    department: "विभाग (Department)",
    academicYear: "शैक्षणिक वर्ष (उदा. 2026-2027)",
    rollNumber: "महाविद्यालयीन हजेरी क्रमांक (Roll No.)",
    studentId: "विद्यार्थी ओळख क्रमांक (PRN)",
    
    parentInfo: "पालकांची माहिती",
    parentName: "पालक / पालकांचे पूर्ण नाव",
    parentMobile: "पालकांचा मोबाईल क्रमांक",
    emergencyContact: "आपत्कालीन संपर्क क्रमांक",
    
    hostelPref: "वसतिगृह निवड व पसंती",
    selectHostel: "वसतिगृह निवडा",
    roomPref: "खोलीचा प्रकार",
    password: "पासवर्ड",
    confirmPassword: "पासवर्ड खात्री करा",
    submitRegistration: "नोंदणी पूर्ण करा",
    alreadyRegistered: "आधीच नोंदणी केली आहे? लॉगिन करा",
    dontHaveAccount: "खाते नाही? येथे नवीन नोंदणी करा",
    
    // 📁 Documents
    documents: "आवश्यक कागदपत्रे",
    uploadPhoto: "विद्यार्थ्याचा पासपोर्ट फोटो",
    uploadCollegeId: "महाविद्यालय ओळखपत्र (ID Card)",
    uploadAadhaar: "आधार कार्ड / राष्ट्रीय ओळख पुरावा",
    uploadAdmission: "महाविद्यालय प्रवेश फी पावती",
    verifyDocument: "कागदपत्र पडताळा",
    verified: "पडताळणी पूर्ण",
    unverified: "पडताळणी बाकी",
    
    // 💳 Allocation & Payment
    allocateRoom: "खोली व खाट वाटप करा",
    allocationSuccess: "खोली व खाट यशस्वीरित्या वाटप झाली",
    paymentTitle: "वसतिगृह प्रवेश शुल्क (फी) भरणा",
    amountToPay: "भरवायची एकूण रक्कम",
    payNow: "ऑनलाईन शुल्क भरा",
    paymentMethod: "पेमेंट पद्धत",
    downloadReceipt: "अधिकृत पावती डाऊनलोड करा",
    printReceipt: "पावती प्रिंट करा",
    receiptNo: "पावती क्रमांक",
    txnId: "व्यवहार क्रमांक (Txn ID)",
    paymentDate: "तारीख आणि वेळ",
    paymentSuccess: "वसतिगृह शुल्क यशस्वीरीत्या जमा झाले!",
    upiQr: "UPI QR कोड स्कॅन करा (Google Pay / PhonePe / Paytm)",
    cardPayment: "डेबिट / क्रेडिट कार्ड",
    netBanking: "नेट बँकिंग",
    
    // 🛒 Hostel Store (वसतिगृह भांडार)
    storeTitle: "वसतिगृह आवश्यक वस्तू भांडार (Hostel Store)",
    storeSubtitle: "वसतिगृहात राहणाऱ्या विद्यार्थ्यांसाठी आवश्यक गाद्या, चादरी, उशी, कुलूप, अभ्यास साहित्य व दैनंदिन वस्तूंची ऑनलाईन मागणी.",
    storeNotice: "येथे मागणी नोंदवलेली सामग्री वसतिगृह अधीक्षकांच्या कार्यालयातून तात्काळ प्राप्त करता येईल.",
    allCategories: "सर्व वस्तू",
    bedding: "बिछाना व गादी (Bedding)",
    dailyEssentials: "दैनंदिन गरजेच्या वस्तू (Utilities)",
    stationery: "अभ्यास व लेखन साहित्य (Study)",
    messCoupons: "मेस व भोजन कूपन (Dining)",
    inStock: "उपलब्ध आहे",
    outOfStock: "स्टॉकमध्ये नाही",
    price: "किंमत",
    quantity: "संख्या",
    addToCart: "कार्टमध्ये जोडा",
    removeFromCart: "काढून टाका",
    cartSummary: "भांडार मागणी गोषवारा",
    cartEmpty: "आपल्या कार्टमध्ये सध्या कोणतीही वस्तू नाही.",
    totalAmount: "एकूण रक्कम",
    proceedToOrder: "मागणी निश्चित करा",
    orderSuccess: "आपली भांडार मागणी यशस्वीरित्या नोंदवली गेली आहे!",
    orderToken: "मागणी संदर्भ क्रमांक (Token)",
    studentRoomNumber: "खोली क्रमांक",
    pickupNotice: "कृपया हा टोकन क्रमांक वसतिगृह कार्यालयात दाखवून वस्तू ताब्यात घ्या.",
    
    // ⏱️ Admission Process Steps
    step1: "ऑनलाईन विद्यार्थी नोंदणी",
    step2: "वसतिगृह अर्ज सादर करणे",
    step3: "कागदपत्र पडताळणी",
    step4: "रेक्टर / वॉर्डन मंजुरी",
    step5: "खोली व खाट वाटप",
    step6: "वसतिगृह शुल्क भरणा",
    step7: "प्रवेश निश्चित व खोली ताबा",
    
    // 🔍 Actions & Common Buttons
    search: "नोंदी शोधा...",
    filter: "वर्गीकरण",
    all: "सर्व",
    view: "तपशील पहा",
    approve: "अर्ज मंजूर करा",
    reject: "अर्ज नाकारा",
    rejectionReason: "नाकारण्याचे कारण",
    rejectionReasonPlaceholder: "अर्ज नाकारण्याचे स्पष्ट कारण येथे प्रविष्ट करा...",
    close: "बंद करा",
    cancel: "रद्द करा",
    confirm: "निश्चित करा",
    save: "जतन करा",
    loading: "माहिती लोड होत आहे...",
    noRecords: "कोणतीही माहिती उपलब्ध नाही.",
    notifications: "सूचना (Notifications)",
    markAllRead: "सर्व सूचना वाचल्या म्हणून चिन्हांकित करा",
    noNotifications: "कोणतीही नवीन सूचना नाही",
    quickDemoAccounts: "१-क्लिक डेमो लॉगिन खाती",
    selectBed: "वाटप करण्यासाठी खाट निवडा",
    roomCapacity: "क्षमता",
    floorNumber: "मजला",
    backToDashboard: "डॅशबोर्डवर परत जा",
    switchLanguagePrompt: "भाषा बदला (Switch Language):"
  },
  
  en: {
    // 🏛️ College Branding
    societyName: "Ahilyanagar Jilha Maratha Vidya Prasarak Samaj's Ahilyanagar",
    collegeName: "New Arts, Commerce & Science College, Ahilyanagar",
    collegeFullName: "Ahilyanagar Jilha Maratha Vidya Prasarak Samaj's New Arts, Commerce & Science College, Ahilyanagar (Autonomous)",
    collegeAutonomous: "NEW ARTS, COMMERCE & SCIENCE COLLEGE, AHILYANAGAR (AUTONOMOUS)",
    autonomousBadge: "AUTONOMOUS",
    collegeMotto: "Tejo Si Tejo Me Dehi",
    collegeSub: "Affiliated to Savitribai Phule Pune University | Re-accredited with 'A++' Grade by NAAC",
    hostelSystem: "Online Hostel Management System",
    portalSubtitle: "Boys & Girls Hostel Official Portal • Ahilyanagar",
    naacGrade: "NAAC 'A++' Grade",
    cityAddress: "Lal Taki Road, Ahilyanagar, Maharashtra - 414001",
    
    // 🏢 Hostels
    boysHostel: "Boys Hostel (Chhatrapati Shivaji Maharaj Bhavan)",
    girlsHostel: "Girls Hostel (Savitribai Phule Bhavan)",
    boysHostelShort: "Boys Hostel",
    girlsHostelShort: "Girls Hostel",
    northCampus: "North Campus, Lal Taki Road, Ahilyanagar",
    southCampus: "South Campus, Lal Taki Road, Ahilyanagar",
    
    // 🧭 Navigation
    home: "Home",
    about: "About Hostels",
    availability: "Hostel Availability",
    store: "Hostel Store",
    login: "Sign In",
    register: "Student Registration",
    dashboard: "Dashboard",
    applications: "Applications",
    pendingApplications: "Pending Applications",
    rooms: "Rooms & Floors",
    beds: "Beds & Allocation",
    students: "Students Directory",
    payments: "Fee Payments",
    reports: "Analytics & Reports",
    profile: "My Profile",
    logout: "Sign Out",
    
    // 👨‍🎓 Student Portal
    applicationStatus: "Application Status",
    myRoomBed: "My Room & Bed",
    feePayment: "Fee Payment",
    applyNow: "Apply for Hostel",
    studentPortal: "STUDENT PORTAL",
    residentStudent: "Resident Student",
    welcomeBack: "Welcome back",
    stepTimeline: "Admission Process Pipeline",
    
    // 🛡️ Warden / Admin Portal
    wardenDesk: "WARDEN DESK",
    superAdminConsole: "SUPER ADMIN CONSOLE",
    manageHostels: "Manage Hostels",
    manageHeads: "Hostel Wardens",
    manageRooms: "Manage Rooms",
    manageBeds: "Manage Beds",
    manageStudents: "Manage Students",
    manageApplications: "Manage Applications",
    managePayments: "Manage Payments",
    allHostels: "All Hostels",
    allApplications: "All Applications",
    allRooms: "All Rooms",
    allBeds: "All Beds",
    allStudents: "All Students",
    allPayments: "All Payments",
    
    // 🏷️ Status Badges
    AVAILABLE: "Available",
    OCCUPIED: "Occupied",
    RESERVED: "Reserved",
    MAINTENANCE: "Maintenance",
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
    SUCCESS: "Success",
    FAILED: "Failed",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    
    // 🌟 Hero & Landing Page
    heroTitle: "Online Hostel Admission & Management System",
    heroSubtitle: "Simple, secure, and 100% transparent residential accommodation management for students of New Arts, Commerce & Science College, Ahilyanagar.",
    studentLogin: "Student Login",
    staffLogin: "Hostel Warden / Admin Login",
    liveStats: "Live Hostel Overview & Statistics",
    totalHostels: "Total Hostels",
    totalRooms: "Total Rooms",
    totalBeds: "Total Bed Capacity",
    availableBeds: "Available Beds",
    occupiedBeds: "Occupied Beds",
    totalStudents: "Registered Residents",
    totalRevenue: "Total Revenue Collected",
    approvedApplications: "Approved Applications",
    rejectedApplications: "Rejected Applications",
    
    // 📝 Registration & Forms
    personalInfo: "Personal Information",
    fullName: "Student's Full Name",
    dob: "Date of Birth",
    gender: "Gender",
    male: "Male",
    female: "Female",
    mobile: "Mobile Number",
    email: "Email Address",
    address: "Permanent Address",
    city: "City / Town",
    state: "State",
    pincode: "PIN Code",
    
    academicInfo: "Academic Details",
    collegeNameField: "College Name",
    course: "Course / Degree (e.g. B.Sc. Comp Sci, M.Com)",
    department: "Department",
    academicYear: "Academic Year (e.g. 2026-2027)",
    rollNumber: "College Roll No.",
    studentId: "Student ID / PRN",
    
    parentInfo: "Parent / Guardian Details",
    parentName: "Parent / Guardian Full Name",
    parentMobile: "Parent Mobile Number",
    emergencyContact: "Emergency Contact Number",
    
    hostelPref: "Hostel Preference & Room Choice",
    selectHostel: "Select Hostel",
    roomPref: "Preferred Room Type",
    password: "Password",
    confirmPassword: "Confirm Password",
    submitRegistration: "Complete Registration",
    alreadyRegistered: "Already registered? Sign in here",
    dontHaveAccount: "Don't have an account? Register now",
    
    // 📁 Documents
    documents: "Required Documents",
    uploadPhoto: "Student Passport Photo",
    uploadCollegeId: "College ID Card",
    uploadAadhaar: "Aadhaar / National ID Proof",
    uploadAdmission: "College Admission Fee Receipt",
    verifyDocument: "Verify Document",
    verified: "Verified",
    unverified: "Pending Verification",
    
    // 💳 Allocation & Payment
    allocateRoom: "Allocate Room & Bed",
    allocationSuccess: "Room & Bed Allocated Successfully",
    paymentTitle: "Hostel Admission Fee Payment",
    amountToPay: "Total Fee Amount",
    payNow: "Proceed to Online Payment",
    paymentMethod: "Payment Method",
    downloadReceipt: "Download Official Receipt",
    printReceipt: "Print Official Receipt",
    receiptNo: "Receipt Number",
    txnId: "Transaction ID",
    paymentDate: "Date & Time",
    paymentSuccess: "Fee Payment Completed Successfully!",
    upiQr: "Scan UPI QR Code (Google Pay / PhonePe / Paytm)",
    cardPayment: "Debit / Credit Card",
    netBanking: "Internet Banking",
    
    // 🛒 Hostel Store
    storeTitle: "Hostel Essentials & Supplies Store",
    storeSubtitle: "Official online store for hostel bedding, study supplies, locks, and daily accommodation essentials.",
    storeNotice: "All requested supplies can be collected from the Hostel Warden Office upon order confirmation.",
    allCategories: "All Items",
    bedding: "Bedding & Linen",
    dailyEssentials: "Daily Utilities & Locks",
    stationery: "Study & Stationery",
    messCoupons: "Mess & Dining Tokens",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    price: "Price",
    quantity: "Quantity",
    addToCart: "Add to Cart",
    removeFromCart: "Remove",
    cartSummary: "Hostel Store Order Summary",
    cartEmpty: "Your cart is currently empty.",
    totalAmount: "Total Amount",
    proceedToOrder: "Confirm Store Order",
    orderSuccess: "Your store order has been placed successfully!",
    orderToken: "Order Token Reference",
    studentRoomNumber: "Room Number",
    pickupNotice: "Please present this Order Token at the Hostel Rector Office to collect your items.",
    
    // ⏱️ Admission Process Steps
    step1: "Online Registration",
    step2: "Application Submission",
    step3: "Document Verification",
    step4: "Warden Approval",
    step5: "Room & Bed Allocation",
    step6: "Hostel Fee Payment",
    step7: "Admission Confirmed",
    
    // 🔍 Actions & Common Buttons
    search: "Search records...",
    filter: "Filter by",
    all: "All",
    view: "View Details",
    approve: "Approve Application",
    reject: "Reject Application",
    rejectionReason: "Reason for Rejection",
    rejectionReasonPlaceholder: "Provide a clear reason for rejecting this application...",
    close: "Close",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save Changes",
    loading: "Loading information...",
    noRecords: "No records found.",
    notifications: "Notifications",
    markAllRead: "Mark all as read",
    noNotifications: "No new notifications",
    quickDemoAccounts: "Quick 1-Click Demo Logins",
    selectBed: "Select Bed to Allocate",
    roomCapacity: "Capacity",
    floorNumber: "Floor",
    backToDashboard: "Back to Dashboard",
    switchLanguagePrompt: "Select Language:"
  }
};

export const LanguageProvider = ({ children }) => {
  // Store language preference in localStorage ("store"): default to Marathi 'mr'
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('hostel_lang');
    return saved || 'mr'; // Defaults to full Marathi website, with instant 1-click English toggle!
  });

  useEffect(() => {
    localStorage.setItem('hostel_lang', lang);
    if (lang === 'mr') {
      document.body.classList.add('lang-mr');
      document.documentElement.lang = 'mr';
    } else {
      document.body.classList.remove('lang-mr');
      document.documentElement.lang = 'en';
    }
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'mr' : 'en'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t, isMr: lang === 'mr', isEn: lang === 'en' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
