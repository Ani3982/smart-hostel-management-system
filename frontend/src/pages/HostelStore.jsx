import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  PackageCheck, 
  Printer, 
  ArrowLeft,
  Sparkles,
  Bed,
  Briefcase,
  BookOpen,
  Coffee,
  Building2,
  Tag
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STORE_ITEMS = [
  // 1. Bedding & Linen
  {
    id: 'bed-1',
    category: 'bedding',
    icon: Bed,
    price: 1250,
    nameMr: 'वसतिगृह कॉटन गादी (३x६ फूट)',
    nameEn: 'Hostel Cotton Quilted Mattress (3x6 ft)',
    descMr: 'वसतिगृहाच्या खाटांसाठी योग्य मापाची, आरामदायक व टिकाऊ कॉटन गादी.',
    descEn: 'High density cotton mattress tailored for standard college hostel single beds.',
    inStock: true
  },
  {
    id: 'bed-2',
    category: 'bedding',
    icon: Bed,
    price: 420,
    nameMr: 'सुती चादर व उशी कव्हर संच',
    nameEn: 'Cotton Bed Sheet & Pillow Cover Set',
    descMr: '१००% शुद्ध सुती कापडाची टिकाऊ चादर आणि मॅचिंग उशी कव्हर.',
    descEn: '100% pure breathable cotton bedsheet with standard size matching pillow case.',
    inStock: true
  },
  {
    id: 'bed-3',
    category: 'bedding',
    icon: Bed,
    price: 650,
    nameMr: 'उबदार विंटर फ्लीस ब्लँकेट',
    nameEn: 'Warm Winter Fleece Blanket',
    descMr: 'हिवाळ्याच्या दिवसांसाठी मऊ, उबदार आणि वजनाने हलके ब्लँकेट.',
    descEn: 'Super soft, lightweight, and warm microfleece blanket for hostel rooms.',
    inStock: true
  },
  {
    id: 'bed-4',
    category: 'bedding',
    icon: Bed,
    price: 220,
    nameMr: 'आरामदायी स्लीपिंग पिलो (उशी)',
    nameEn: 'Comfortable Sleeping Pillow',
    descMr: 'उत्कृष्ट प्रतीचे फायबर फिलिंग असलेली आरामदायक उशी.',
    descEn: 'Soft fiber-filled ergonomic sleeping pillow for neck support.',
    inStock: true
  },

  // 2. Daily Utilities & Locks
  {
    id: 'util-1',
    category: 'dailyEssentials',
    icon: Briefcase,
    price: 260,
    nameMr: '२० लिटर प्लास्टिक बादली व १ लिटर मग',
    nameEn: '20L Heavy Plastic Bucket & 1L Mug Set',
    descMr: 'मजबूत प्लास्टिकची टिकाऊ बादली आणि हँडल असलेला मग संच.',
    descEn: 'Heavy duty crack-resistant bathroom bucket with matching measuring mug.',
    inStock: true
  },
  {
    id: 'util-2',
    category: 'dailyEssentials',
    icon: Briefcase,
    price: 190,
    nameMr: 'कपाटासाठी ब्रास कुलूप व ३ चाव्या',
    nameEn: 'Heavy Brass Padlock with 3 Keys',
    descMr: 'वसतिगृहातील कपाट व खोली सुरक्षित ठेवण्यासाठी गंजरोधक कुलूप.',
    descEn: 'Rust-proof secure padlock with 3 laser-cut duplicate keys for lockers.',
    inStock: true
  },
  {
    id: 'util-3',
    category: 'dailyEssentials',
    icon: Briefcase,
    price: 110,
    nameMr: 'कपडे वाळवण्याची दोरी व १२ क्लिप्स संच',
    nameEn: 'Cloth Drying Rope & 12 Pegs Set',
    descMr: 'गॅलरीमध्ये कपडे वाळत घालण्यासाठी नायलॉन दोरी व स्टील क्लिप्स.',
    descEn: 'High-tensile nylon clothesline rope with 12 rust-resistant steel clips.',
    inStock: true
  },
  {
    id: 'util-4',
    category: 'dailyEssentials',
    icon: Briefcase,
    price: 190,
    nameMr: 'कॉटन बाथ टॉवेल (Full Size)',
    nameEn: 'Pure Cotton Bath Towel (Full Size)',
    descMr: 'पाणी पटकन शोषून घेणारा मऊ व टिकाऊ टॉवेल.',
    descEn: 'Highly absorbent 450 GSM pure combed cotton bath towel.',
    inStock: true
  },

  // 3. Study & Stationery
  {
    id: 'stat-1',
    category: 'stationery',
    icon: BookOpen,
    price: 290,
    nameMr: 'महाविद्यालयीन लॉन्ग नोटबुक्स (६ चा संच)',
    nameEn: 'College Ruled Long Notebooks (Set of 6)',
    descMr: 'कला, वाणिज्य व विज्ञान वर्गाच्या अभ्यासासाठी उच्च दर्जाची वही.',
    descEn: 'Premium white 70 GSM paper single ruled long books for degree lectures.',
    inStock: true
  },
  {
    id: 'stat-2',
    category: 'stationery',
    icon: BookOpen,
    price: 480,
    nameMr: 'रिचार्जेबल एलईडी अभ्यास टेबल लॅम्प',
    nameEn: 'Rechargeable LED Study Desk Lamp',
    descMr: '३ प्रकाश मोड असलेला, रात्री शांतपणे अभ्यास करण्यासाठी योग्य लॅम्प.',
    descEn: '3-mode dimmable eye-friendly flexible LED study lamp with USB charging.',
    inStock: true
  },
  {
    id: 'stat-3',
    category: 'stationery',
    icon: BookOpen,
    price: 130,
    nameMr: '१० जेल/बॉल पेन कॉम्बो संच (निळे व काळे)',
    nameEn: '10 Pen Lecture Combo Pack (Blue & Black)',
    descMr: 'हस्तलेखन आणि परीक्षेसाठी अखंड व जलद चालणारे पेन्स.',
    descEn: 'Smooth flow fast-drying exam grade ball & gel pens pack.',
    inStock: true
  },

  // 4. Dining & Mess
  {
    id: 'din-1',
    category: 'messCoupons',
    icon: Coffee,
    price: 2600,
    nameMr: 'मासिक वसतिगृह मेस पास (३० दिवस)',
    nameEn: 'Monthly Hostel Mess Pass (30 Days)',
    descMr: 'दोन वेळचे सकस, चवदार आणि अमर्याद शाकाहारी भोजन.',
    descEn: 'Includes daily healthy lunch and dinner with unlimited chapati and sabzi.',
    inStock: true
  },
  {
    id: 'din-2',
    category: 'messCoupons',
    icon: Coffee,
    price: 950,
    nameMr: '१०-जेवण विशेष मेस कूपन बुकलेट',
    nameEn: '10-Meal Special Dining Coupon Booklet',
    descMr: 'कधीही वापरता येणारे १० जेवणांचे कूपन कार्ड.',
    descEn: 'Flexible 10-meal pass for students wanting on-demand mess meals.',
    inStock: true
  },
  {
    id: 'din-3',
    category: 'messCoupons',
    icon: Coffee,
    price: 240,
    nameMr: 'स्टेनलेस स्टील पाण्याची बाटली (१ लिटर)',
    nameEn: 'Stainless Steel Water Bottle (1000ml)',
    descMr: 'आरोग्यदायी, गंजमुक्त व स्वच्छ पाण्याची बॉटल.',
    descEn: 'Food-grade BPA-free stainless steel eco bottle for college campus use.',
    inStock: true
  }
];

export const HostelStore = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  // Student checkout form state
  const [studentName, setStudentName] = useState(user?.name || '');
  const [studentPrn, setStudentPrn] = useState(user?.studentId || '');
  const [roomNumber, setRoomNumber] = useState('');
  const [contactMobile, setContactMobile] = useState('');

  const categories = [
    { id: 'all', label: t('allCategories'), icon: Sparkles },
    { id: 'bedding', label: t('bedding'), icon: Bed },
    { id: 'dailyEssentials', label: t('dailyEssentials'), icon: Briefcase },
    { id: 'stationery', label: t('stationery'), icon: BookOpen },
    { id: 'messCoupons', label: t('messCoupons'), icon: Coffee },
  ];

  const filteredItems = STORE_ITEMS.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const itemTitle = lang === 'mr' ? item.nameMr : item.nameEn;
    const itemDesc = lang === 'mr' ? item.descMr : item.descEn;
    const matchesSearch = itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          itemDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item.id]: {
        item,
        quantity: (prev[item.id]?.quantity || 0) + 1
      }
    }));
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prev => {
      const current = prev[itemId]?.quantity || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          quantity: next
        }
      };
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  };

  const cartList = Object.values(cart);
  const totalCartCount = cartList.reduce((acc, c) => acc + c.quantity, 0);
  const totalAmount = cartList.reduce((acc, c) => acc + (c.item.price * c.quantity), 0);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert(lang === 'mr' ? 'कृपया विद्यार्थ्याचे नाव प्रविष्ट करा' : 'Please enter student name');
      return;
    }

    const orderData = {
      token: `NACSC-STORE-${Math.floor(100000 + Math.random() * 900000)}`,
      studentName,
      studentPrn: studentPrn || 'PRN-' + Math.floor(1000 + Math.random() * 9000),
      roomNumber: roomNumber || 'Pending Allocation',
      contactMobile,
      date: new Date().toLocaleString(),
      items: cartList,
      totalAmount
    };

    setOrderConfirmed(orderData);
    setCart({});
    setShowCheckout(false);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '4rem' }}>
      
      {/* College Branded Masthead Header */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1b3b6f 55%, #0284c7 100%)',
        color: 'white',
        padding: 'clamp(1.5rem, 4vw, 3rem) 1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <img 
              src="/college-logo-transparent.png" 
              alt="NACSC Logo" 
              style={{
                width: '76px',
                height: '76px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
                backgroundColor: 'white',
                borderRadius: '50%',
                padding: '3px'
              }}
            />
            <div>
              <div style={{ fontSize: '0.825rem', color: '#cbd5e1', fontWeight: 700, letterSpacing: '0.04em' }}>
                {t('societyName')}
              </div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 800, margin: '0.2rem 0', letterSpacing: '-0.02em' }}>
                {t('collegeAutonomous')}
              </h1>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                <span>✨ {t('collegeMotto')}</span>
                <span>•</span>
                <span>{t('autonomousBadge')}</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{t('storeTitle')}</h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginTop: '0.2rem', maxWidth: '650px' }}>
                {t('storeSubtitle')}
              </p>
            </div>

            {/* Cart Trigger Badge */}
            <button
              onClick={() => setShowCheckout(true)}
              style={{
                backgroundColor: '#f59e0b',
                color: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                padding: '0.65rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                transition: 'transform 0.15s ease'
              }}
            >
              <ShoppingCart size={18} />
              <span>{t('cartSummary')}</span>
              {totalCartCount > 0 && (
                <span style={{
                  backgroundColor: '#0f172a',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 900
                }}>
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <div className="container" style={{ maxWidth: '1100px' }}>

        {/* Order Confirmation Slip Modal / View */}
        {orderConfirmed && (
          <div className="card print-receipt" style={{
            padding: 'clamp(1rem, 3vw, 2.5rem)',
            backgroundColor: '#ffffff',
            border: '2px solid #10b981',
            borderRadius: '16px',
            marginBottom: '2.5rem',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src="/college-logo-transparent.png" alt="College Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{t('societyName')}</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary)' }}>{t('collegeAutonomous')}</h3>
                  <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800, marginTop: '2px' }}>
                    ✓ {t('orderSuccess')}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('orderToken')}</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'monospace' }}>
                  {orderConfirmed.token}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{orderConfirmed.date}</div>
              </div>
            </div>

            {/* Student & Token Meta */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
              gap: '1rem',
              backgroundColor: '#f8fafc',
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.5rem',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{t('fullName')}: </span>
                <strong>{orderConfirmed.studentName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{t('studentId')}: </span>
                <strong>{orderConfirmed.studentPrn}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{t('studentRoomNumber')}: </span>
                <strong>{orderConfirmed.roomNumber}</strong>
              </div>
            </div>

            {/* Items Table */}
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left', backgroundColor: '#f1f5f9' }}>
                    <th style={{ padding: '0.65rem 1rem' }}>#</th>
                    <th style={{ padding: '0.65rem 1rem' }}>{lang === 'mr' ? 'वस्तूचे नाव' : 'Item Description'}</th>
                    <th style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>{t('quantity')}</th>
                    <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>{t('price')}</th>
                    <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>{lang === 'mr' ? 'उपएकूण' : 'Subtotal'}</th>
                  </tr>
                </thead>
                <tbody>
                  {orderConfirmed.items.map((cartEntry, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.65rem 1rem' }}>{idx + 1}</td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>
                        {lang === 'mr' ? cartEntry.item.nameMr : cartEntry.item.nameEn}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'center', fontWeight: 700 }}>
                        {cartEntry.quantity}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                        ₹{cartEntry.item.price}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                        ₹{cartEntry.item.price * cartEntry.quantity}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#ecfdf5', fontWeight: 800 }}>
                    <td colSpan={4} style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#047857' }}>
                      {t('totalAmount')}:
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '1.15rem', color: '#047857' }}>
                      ₹{orderConfirmed.totalAmount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#92400e', marginBottom: '1.5rem' }}>
              📢 <strong>{t('pickupNotice')}</strong> {t('storeNotice')}
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={handlePrintSlip} className="btn btn-primary btn-sm">
                <Printer size={16} />
                <span>{lang === 'mr' ? 'टोकन पावती प्रिंट करा' : 'Print Order Slip'}</span>
              </button>
              <button onClick={() => setOrderConfirmed(null)} className="btn btn-outline btn-sm">
                <span>{lang === 'mr' ? 'नवीन खरेदी करा' : 'Continue Shopping'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Search & Category Filter Toolbar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder={lang === 'mr' ? 'गादी, चादर, कुलूप, वही, लॅम्प, मेस पास शोधा...' : 'Search mattress, bedsheet, locks, study lamp, mess pass...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.85rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                fontSize: '0.95rem',
                backgroundColor: 'white',
                boxShadow: 'var(--shadow-sm)'
              }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 1.1rem',
                    borderRadius: '9999px',
                    border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isActive ? 'var(--primary)' : 'white',
                    color: isActive ? 'white' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 2px 8px rgba(27, 59, 111, 0.25)' : 'none'
                  }}
                >
                  <Icon size={15} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: '1.5rem'
        }}>
          {filteredItems.map(item => {
            const Icon = item.icon;
            const inCartCount = cart[item.id]?.quantity || 0;
            const title = lang === 'mr' ? item.nameMr : item.nameEn;
            const desc = lang === 'mr' ? item.descMr : item.descEn;

            return (
              <div 
                key={item.id} 
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  border: inCartCount > 0 ? '2px solid var(--primary)' : '1px solid var(--border)',
                  position: 'relative',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={24} />
                    </div>

                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      backgroundColor: '#ecfdf5',
                      color: '#047857'
                    }}>
                      {t('inStock')}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                    {title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {desc}
                  </p>
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{t('price')}</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)' }}>
                      ₹{item.price}
                    </div>
                  </div>

                  {inCartCount === 0 ? (
                    <button
                      onClick={() => addToCart(item)}
                      className="btn btn-primary btn-sm"
                      style={{ gap: '0.4rem', padding: '0.5rem 1rem' }}
                    >
                      <Plus size={15} />
                      <span>{t('addToCart')}</span>
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '8px' }}>
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        style={{ border: 'none', background: 'white', borderRadius: '4px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: 800, minWidth: '20px', textAlign: 'center' }}>{inCartCount}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        style={{ border: 'none', background: 'white', borderRadius: '4px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Cart & Checkout Modal */}
      {showCheckout && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: 'min(94vw, 560px)',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 'clamp(1.25rem, 3vw, 2rem)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={20} />
                <span>{t('cartSummary')}</span>
              </h3>
              <button 
                onClick={() => setShowCheckout(false)}
                style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            {cartList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <PackageCheck size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{t('cartEmpty')}</p>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Cart Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {cartList.map(entry => (
                    <div key={entry.item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          {lang === 'mr' ? entry.item.nameMr : entry.item.nameEn}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          ₹{entry.item.price} × {entry.quantity} = ₹{entry.item.price * entry.quantity}
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeFromCart(entry.item.id)}
                        style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.3rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', backgroundColor: '#ecfdf5', borderRadius: '8px', fontWeight: 800 }}>
                  <span style={{ color: '#047857' }}>{t('totalAmount')}:</span>
                  <span style={{ fontSize: '1.35rem', color: '#047857' }}>₹{totalAmount}</span>
                </div>

                {/* Student Details Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {lang === 'mr' ? 'मागणी नोंदणी तपशील' : 'Student Requisition Details'}
                  </h4>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {t('fullName')} *
                    </label>
                    <input 
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="उदा. राहुल सचिन पवार"
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                    />
                  </div>

                  <div className="responsive-grid-2" style={{ gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {t('studentId')}
                      </label>
                      <input 
                        type="text"
                        value={studentPrn}
                        onChange={(e) => setStudentPrn(e.target.value)}
                        placeholder="PRN / Roll No."
                        style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {t('studentRoomNumber')}
                      </label>
                      <input 
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="उदा. B-104 / G-201"
                        style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {t('mobile')}
                    </label>
                    <input 
                      type="tel"
                      value={contactMobile}
                      onChange={(e) => setContactMobile(e.target.value)}
                      placeholder="९८७६५४३२१०"
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowCheckout(false)} className="btn btn-outline" style={{ flex: 1 }}>
                    {t('cancel')}
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                    {t('proceedToOrder')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
