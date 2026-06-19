import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Coffee,
  Heart,
  ChevronRight,
  Info,
  MapPin,
  Clock,
  Menu,
  X,
  Search,
  Trash2,
  Plus,
  Minus,
  Check,
  Award,
  Sparkles,
  Lock,
  LogOut,
  Send,
  Star,
  DollarSign,
  Printer,
  BadgeAlert,
  UserCheck,
  User,
  MessageSquareReply,
  HelpCircle,
  History,
  CreditCard,
  Settings,
  Calendar,
  Filter,
  FileText,
  MessageSquare,
  MessageCircle,
  Calculator,
  Instagram,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';

// Subcomponents
import CustomizerModal from './components/CustomizerModal.tsx';
import CartDrawer from './components/CartDrawer.tsx';
import AdminWorkspace from './components/AdminWorkspace.tsx';
import ClientLoginForm from './components/ClientLoginForm.tsx';

// Firebase & Firestore setup
import { db } from './lib/firebase.ts';
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

// Static initialization details & types
import { OUTPOST_PROFILE, INITIAL_MENU_ITEMS, INITIAL_REVIEWS } from './data.ts';
import { MenuItem, CartItem, GuestReview, CashierOrder, MenuItemCategory } from './types.ts';

// Logo and visual assets generated in previous turns
import OutpostLogo from './assets/images/outpost_logo_1781086686959.png';
import CoverHeroImage from './assets/images/coffee_plant_hero_1781086703853.png';
import AccidentalCupImage from './assets/images/single_origin_cup_1781086719897.png';

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDONESIAN_SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

const parseOrderDate = (timestampStr: string): Date => {
  try {
    const cleanStr = timestampStr.replace(',', '').trim();
    const parts = cleanStr.split(/\s+/);
    
    let day = 1;
    let monthIdx = 0; // default Jan
    let year = new Date().getFullYear(); // default current year (2026)

    if (parts.length >= 1) {
      const parsedDay = parseInt(parts[0], 10);
      if (!isNaN(parsedDay)) day = parsedDay;
    }

    if (parts.length >= 2) {
      const mStr = parts[1].toLowerCase();
      const idxFull = INDONESIAN_MONTHS.findIndex(m => mStr.startsWith(m.toLowerCase()));
      const idxShort = INDONESIAN_SHORT_MONTHS.findIndex(m => mStr.startsWith(m.toLowerCase()));
      
      if (idxFull !== -1) {
        monthIdx = idxFull;
      } else if (idxShort !== -1) {
        monthIdx = idxShort;
      } else {
        const monthsEng = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const idxEng = monthsEng.findIndex(m => mStr.startsWith(m));
        if (idxEng !== -1) {
          monthIdx = idxEng;
        }
      }
    }

    if (parts.length >= 3) {
      const parsedYear = parseInt(parts[2], 10);
      if (!isNaN(parsedYear) && !parts[2].includes(':') && parsedYear > 1000) {
        year = parsedYear;
      }
    }

    return new Date(year, monthIdx, day);
  } catch (err) {
    return new Date();
  }
};

export default function App() {
  // --- Persistent Storage Systems (Firestore Enabled) ---
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('outpost_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [reviews, setReviews] = useState<GuestReview[]>(() => {
    const saved = localStorage.getItem('outpost_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [orders, setOrders] = useState<CashierOrder[]>([]);

  // 1. Real-time Sync for Menu Items from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "menu"), (snapshot) => {
      if (snapshot.empty) {
        // Smart seed for first-time database creation
        INITIAL_MENU_ITEMS.forEach(async (item) => {
          await setDoc(doc(db, "menu", item.id), item);
        });
        setMenuItems(INITIAL_MENU_ITEMS);
      } else {
        const items: MenuItem[] = [];
        snapshot.forEach(docSnap => {
          items.push(docSnap.data() as MenuItem);
        });
        items.sort((a, b) => a.id.localeCompare(b.id));
        setMenuItems(items);
        localStorage.setItem('outpost_menu', JSON.stringify(items));
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Sync for Guest Reviews from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "reviews"), (snapshot) => {
      if (snapshot.empty) {
        // Smart seed for first-time database creation
        INITIAL_REVIEWS.forEach(async (review) => {
          await setDoc(doc(db, "reviews", review.id), review);
        });
        setReviews(INITIAL_REVIEWS);
      } else {
        const revList: GuestReview[] = [];
        snapshot.forEach(docSnap => {
          revList.push(docSnap.data() as GuestReview);
        });
        // Sort reviews: newest first
        revList.sort((a, b) => b.id.localeCompare(a.id));
        setReviews(revList);
        localStorage.setItem('outpost_reviews', JSON.stringify(revList));
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. Real-time Sync for Cashier Orders from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ordList: CashierOrder[] = [];
      snapshot.forEach(docSnap => {
        ordList.push(docSnap.data() as CashierOrder);
      });
      // Sort newest orders first
      ordList.sort((a, b) => b.id.localeCompare(a.id));
      setOrders(ordList);
      localStorage.setItem('outpost_orders', JSON.stringify(ordList));
    });
    return () => unsubscribe();
  }, []);

  // --- UI Filter & Search state ---
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllMenu, setShowAllMenu] = useState(false);

  // --- Cart System state ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'view' | 'form' | 'success'>('view');

  // Checkout inputs
  const [custName, setCustName] = useState('');
  const [tableOrType, setTableOrType] = useState('Table'); // 'Table', 'Takeaway'
  const [tableNum, setTableNum] = useState('1');
  const [payMethod, setPayMethod] = useState<'Cash' | 'QRIS' | 'Card' | 'Bank Transfer'>('QRIS');
  const [latestSubmittedOrder, setLatestSubmittedOrder] = useState<CashierOrder | null>(null);

  // --- POS Payment Method Admin Configurations ---
  const [qrisConfigMerchantID, setQrisConfigMerchantID] = useState(() => localStorage.getItem('op_pay_qris_merchant') || 'ID102030405060');
  const [qrisManualImageUrl, setQrisManualImageUrl] = useState(() => localStorage.getItem('op_pay_qris_manual_img') || ''); // Empty by default so we generate a beautiful scan code dynamically
  const [useManualQrisImage, setUseManualQrisImage] = useState(() => localStorage.getItem('op_pay_qris_use_manual') === 'true'); // if true, use custom image url
  const [bankAccountName, setBankAccountName] = useState(() => localStorage.getItem('op_pay_bank_name') || 'Bank Mandiri');
  const [bankAccountNumber, setBankAccountNumber] = useState(() => localStorage.getItem('op_pay_bank_number') || '123-456-789-000');
  const [bankAccountHolder, setBankAccountHolder] = useState(() => localStorage.getItem('op_pay_bank_holder') || 'Outpost Coffee Ground');

  // --- QRIS Image Upload Handling ---
  const [isDraggingQris, setIsDraggingQris] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const handleQrisImageChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      displayToast("File yang diunggah harus berupa gambar!");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      displayToast("Ukuran gambar terlalu besar! Maksimal 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setQrisManualImageUrl(reader.result);
        displayToast("Gambar QRIS berhasil diunggah!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQrisFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleQrisImageChange(file);
    }
  };

  const handleQrisDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingQris(true);
  };

  const handleQrisDragLeave = () => {
    setIsDraggingQris(false);
  };

  const handleQrisDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingQris(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleQrisImageChange(file);
    }
  };

  // --- Product Customization Modal state ---
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [customTemp, setCustomTemp] = useState<'Hot' | 'Iced' | 'Normal'>('Iced');
  const [customSugar, setCustomSugar] = useState<'No Sugar' | 'Less Sugar' | 'Normal' | 'Extra Sugar'>('Normal');
  const [customNotes, setCustomNotes] = useState('');
  const [customQty, setCustomQty] = useState(1);

  // --- Write Customer Review State ---
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  // --- Pages & Client Auth State ---
  const [currentPage, setCurrentPage] = useState<'landing' | 'login-client' | 'login-admin' | 'admin-dashboard'>('landing');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientLoggedInName, setClientLoggedInName] = useState('');
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState('');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [menuModalSearch, setMenuModalSearch] = useState('');
  const [menuModalCategory, setMenuModalCategory] = useState<'all' | 'coffee' | 'non-coffee' | 'food'>('all');
  const [isResetPanelOpen, setIsResetPanelOpen] = useState(false);
  const [isCashierOrderFormOpen, setIsCashierOrderFormOpen] = useState(false);
  const [cashierCustName, setCashierCustName] = useState('');
  const [cashierOrderType, setCashierOrderType] = useState<'Table' | 'Takeaway'>('Table');
  const [cashierTableNum, setCashierTableNum] = useState('1');
  const [cashierPayMethod, setCashierPayMethod] = useState<'Cash' | 'QRIS' | 'Card' | 'Bank Transfer'>('Cash');
  const [cashierCart, setCashierCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [cashierSearchTerm, setCashierSearchTerm] = useState('');
  
  const [customConfirm, setCustomConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Yakin',
    cancelText: 'Batal',
    isDanger: false,
  });

  const askConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    isDanger = false,
    confirmText = 'Yakin',
    cancelText = 'Batal'
  ) => {
    setCustomConfirm({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setCustomConfirm(prev => ({ ...prev, isOpen: false }));
      },
      isDanger,
      confirmText,
      cancelText
    });
  };

  useEffect(() => {
    if (clientLoggedInName) {
      setCustName(clientLoggedInName);
      setNewReviewName(clientLoggedInName);
    }
  }, [clientLoggedInName]);

  // Synchronize Live Chat in real-time via Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "chats"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data());
      });
      // Sort messages by id ascending
      list.sort((a, b) => a.id.localeCompare(b.id));

      if (snapshot.empty) {
        const welcomeMsg = {
          id: 'chat_0000_welcome',
          sender: 'admin',
          senderName: 'Barista (POS Kasir)',
          text: 'Halo! Selamat datang di Outpost Coffee. Butuh bantuan, sendok tambahan, tisu, atau ingin menanyakan ketersediaan menu? Silakan tinggalkan pesan Anda di sini ya! 😊',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          guestSessionId: 'all',
          readByGuest: true,
          readByAdmin: true,
        };
        setDoc(doc(db, "chats", welcomeMsg.id), welcomeMsg);
        setChatMessages([welcomeMsg]);
      } else {
        setChatMessages(list);
        localStorage.setItem('outpost_live_chats', JSON.stringify(list));
      }
    });
    return () => unsubscribe();
  }, []);

  const [heroIndex, setHeroIndex] = useState(0);

  // --- Admin Cashier Portal state ---
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');
  
  // Admin selected view inside POS control desk
  const [adminTab, setAdminTab] = useState<'orders' | 'inventory' | 'feedbacks' | 'history' | 'settings' | 'live-chat'>('orders');
  // Order search/filter in Admin Panel
  const [adminOrderFilter, setAdminOrderFilter] = useState<'Belum Bayar' | 'Sudah Bayar'>('Belum Bayar');
  
  // --- Live Chat System states (Firestore Enabled) ---
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const [guestSessionId] = useState<string>(() => {
    let gid = localStorage.getItem('outpost_guest_session_id');
    if (!gid) {
      gid = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('outpost_guest_session_id', gid);
    }
    return gid;
  });

  const [isGuestChatOpen, setIsGuestChatOpen] = useState(false);
  const [guestChatText, setGuestChatText] = useState('');
  const [adminSelectedChatSession, setAdminSelectedChatSession] = useState<string>('all');
  const [adminChatText, setAdminChatText] = useState('');
  
  // History search and filters state
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'All' | 'Pending' | 'On Process' | 'Completed' | 'Cancelled'>('All');
  const [historyPaymentFilter, setHistoryPaymentFilter] = useState<'All' | 'Cash' | 'QRIS' | 'Card' | 'Bank Transfer'>('All');
  const [historyDateDay, setHistoryDateDay] = useState<string>('All');
  const [historyDateMonth, setHistoryDateMonth] = useState<string>('All');
  const [historyDateYear, setHistoryDateYear] = useState<string>('All');
  const [historyCustomDate, setHistoryCustomDate] = useState<string>('');
  // Feedback Reply targets
  const [targetFeedbackId, setTargetFeedbackId] = useState<string | null>(null);
  const [feedbackReplyText, setFeedbackReplyText] = useState('');

  // Printing Receipt system
  const [activeReceiptForPrinting, setActiveReceiptForPrinting] = useState<CashierOrder | null>(null);

  // New Menu Item creation state
  const [showAddNewProductForm, setShowAddNewProductForm] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<MenuItemCategory>('coffee');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(25000);
  const [newProdTags, setNewProdTags] = useState('');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');
  const [newProdIsBest, setNewProdIsBest] = useState(false);

  // Editing Menu Item state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<MenuItemCategory>('coffee');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState(25000);
  const [editTags, setEditTags] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editIsBest, setEditIsBest] = useState(false);

  // --- Toast/Micro interaction indicator ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // --- Product Selection Mode handlers ---
  const handleOpenCustomizer = (item: MenuItem) => {
    setSelectedProduct(item);
    setCustomTemp(item.isIcedAvailable ? 'Iced' : 'Hot');
    setCustomSugar('Normal');
    setCustomNotes('');
    setCustomQty(1);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const newCartItem: CartItem = {
      item: selectedProduct,
      quantity: customQty,
      temperature: selectedProduct.category === 'food' || selectedProduct.category === 'dessert' ? 'Normal' : customTemp,
      sugarLevel: selectedProduct.category === 'food' || selectedProduct.category === 'dessert' ? 'Normal' : customSugar,
      notes: customNotes.trim() || undefined
    };

    setCart(prev => {
      // check duplicates
      const dupIdx = prev.findIndex(c => 
        c.item.id === newCartItem.item.id && 
        c.temperature === newCartItem.temperature && 
        c.sugarLevel === newCartItem.sugarLevel && 
        c.notes === newCartItem.notes
      );
      if (dupIdx > -1) {
        const updated = [...prev];
        updated[dupIdx].quantity += newCartItem.quantity;
        return updated;
      }
      return [...prev, newCartItem];
    });

    displayToast(`${selectedProduct.name} ditambahkan ke order cart!`);
    setSelectedProduct(null);
  };

  const handleUpdateCartQty = (idx: number, delta: number) => {
    setCart(prev => {
      const cloned = [...prev];
      cloned[idx].quantity += delta;
      if (cloned[idx].quantity <= 0) {
        return prev.filter((_, i) => i !== idx);
      }
      return cloned;
    });
  };

  const handleRemoveFromCart = (idx: number) => {
    displayToast(`${cart[idx].item.name} dihapus dari keranjang.`);
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const getSubtotal = () => cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);

  // --- Submit Order Handler ---
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) {
      alert("Mohon masukkan nama pemesan.");
      return;
    }
    if (cart.length === 0) {
      alert("Keranjang belanja sedang kosong.");
      return;
    }

    const orderNumber = 'OPC-' + Math.floor(Math.random() * 9000 + 1000).toString();
    const tableIdentifier = tableOrType === 'Table' ? `Meja ${tableNum}` : 'Takeaway';

    const newOrder: CashierOrder = {
      id: orderNumber,
      items: [...cart],
      customerName: custName.trim(),
      tableNumberOrType: tableIdentifier,
      totalAmount: getSubtotal(),
      status: 'Pending',
      paymentMethod: payMethod,
      timestamp: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ", " + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setDoc(doc(db, "orders", newOrder.id), newOrder);
    setLatestSubmittedOrder(newOrder);
    setCheckoutStep('success');
  };

  const handleResetCheckout = () => {
    setCart([]);
    setCustName('');
    setTableNum('1');
    setCheckoutStep('view');
    setIsCartOpen(false);
  };

  // --- Submit Guest Feedback Handler ---
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) {
      alert("Mohon lengkapi nama dan komentar Anda.");
      return;
    }

    const newReview: GuestReview = {
      id: 'rev-' + Math.floor(Math.random() * 90000 + 10000).toString(),
      name: newReviewName.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    setDoc(doc(db, "reviews", newReview.id), newReview);
    setNewReviewName('');
    setNewReviewRating(5);
    setNewReviewComment('');
    setReviewSubmitSuccess(true);
    displayToast("Feedback Anda berhasil terkirim!");
    setTimeout(() => {
      setReviewSubmitSuccess(false);
    }, 4000);
  };

  // --- Admin Login Handlers ---
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '123') {
      setIsAdminLoggedIn(true);
      setAdminPassword('');
      setAdminLoginError('');
      displayToast("Berhasil masuk sebagai Admin Kasir.");
    } else {
      setAdminLoginError("Sandi salah. Silakan coba lagi.");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setIsAdminMode(false);
    displayToast("Sesi Kasir ditutup.");
  };

  // --- Admin actions: Order queue controllers ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'Pending' | 'On Process' | 'Completed' | 'Cancelled') => {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    displayToast(`Status Order ${orderId} diubah menjadi ${newStatus}.`);
  };

  const handleCashierSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashierCustName.trim()) {
      alert("Mohon masukkan nama pelanggan.");
      return;
    }
    if (cashierCart.length === 0) {
      alert("Harap pilih minimal satu menu.");
      return;
    }

    const orderNumber = 'OPC-KASIR-' + Math.floor(Math.random() * 9000 + 1000).toString();
    const tableIdentifier = cashierOrderType === 'Table' ? `Meja ${cashierTableNum}` : 'Takeaway';
    
    // Calculate total amount
    const totalAmount = cashierCart.reduce((sum, cartItem) => sum + (cartItem.item.price * cartItem.quantity), 0);

    const newOrder: CashierOrder = {
      id: orderNumber,
      items: cashierCart.map(c => ({
        item: c.item,
        quantity: c.quantity,
        temperature: 'Normal',
        sugarLevel: 'Normal',
        notes: ''
      })),
      customerName: cashierCustName.trim(),
      tableNumberOrType: tableIdentifier,
      totalAmount: totalAmount,
      status: 'Pending',
      paymentMethod: cashierPayMethod,
      timestamp: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ", " + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setDoc(doc(db, "orders", newOrder.id), newOrder);
    displayToast(`Pesanan kasir ${newOrder.id} berhasil ditambahkan!`);
    
    // Reset cashier state
    setCashierCustName('');
    setCashierCart([]);
    setIsCashierOrderFormOpen(false);
  };

  // --- Admin actions: Toggle product availability ---
  const handleToggleProductStock = async (id: string) => {
    const itemToToggle = menuItems.find(m => m.id === id);
    if (itemToToggle) {
      const updatedStatus = !itemToToggle.isAvailable;
      await updateDoc(doc(db, "menu", id), { isAvailable: updatedStatus });
      displayToast(`${itemToToggle.name} diubah menjadi: ${updatedStatus ? 'Tersedia' : 'Habis'}`);
    }
  };

  // --- Admin actions: Delete product ---
  const handleDeleteProduct = (id: string) => {
    askConfirmation(
      "Hapus Item Menu",
      "Apakah Anda yakin ingin menghapus item ini dari menu secara permanen?",
      async () => {
        await deleteDoc(doc(db, "menu", id));
        displayToast("Item menu berhasil dihapus.");
      },
      true,
      "Hapus",
      "Batal"
    );
  };

  // --- Filter and query data for Reporting ---
  const getFilteredOrders = () => {
    return orders.filter(o => {
      // 1. Text Search Filter
      const searchLower = historySearchQuery.toLowerCase();
      const matchSearch = 
        o.customerName.toLowerCase().includes(searchLower) ||
        o.id.toLowerCase().includes(searchLower) ||
        o.items.some(it => it.item.name.toLowerCase().includes(searchLower)) ||
        o.tableNumberOrType.toLowerCase().includes(searchLower);
      
      // 2. Status Filter
      const matchStatus = historyStatusFilter === 'All' || o.status === historyStatusFilter;
      
      // 3. Payment Method Filter
      const matchPayment = historyPaymentFilter === 'All' || o.paymentMethod === historyPaymentFilter;

      // 4. Date components Filter
      const parsedDate = parseOrderDate(o.timestamp);
      const matchDay = historyDateDay === 'All' || parsedDate.getDate().toString() === historyDateDay;
      const matchMonth = historyDateMonth === 'All' || parsedDate.getMonth().toString() === historyDateMonth;
      const matchYear = historyDateYear === 'All' || parsedDate.getFullYear().toString() === historyDateYear;

      // 5. Custom Date HTML Picker Filter
      let matchCustomDate = true;
      if (historyCustomDate) {
        const targetDate = new Date(historyCustomDate);
        matchCustomDate = 
          parsedDate.getDate() === targetDate.getDate() &&
          parsedDate.getMonth() === targetDate.getMonth() &&
          parsedDate.getFullYear() === targetDate.getFullYear();
      }

      return matchSearch && matchStatus && matchPayment && matchDay && matchMonth && matchYear && matchCustomDate;
    });
  };

  // --- POS Print Receipt System ---
  const handlePrintReceipt = (order: CashierOrder) => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!iframeDoc) {
        window.print();
        return;
      }

      const receiptHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Struk POS - ${order.id}</title>
            <style>
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                font-family: 'Courier New', Courier, monospace;
                font-size: 11px;
                color: #000;
                margin: 12px;
                line-height: 1.35;
                width: 72mm;
                background-color: #fff;
              }
              .center { text-align: center; }
              .right { text-align: right; }
              .bold { font-weight: bold; }
              .divider { border-top: 1px dashed #000; margin: 6px 0; }
              .double-divider { border-top: 1px double #000; margin: 8px 0; }
              .flex-row { display: flex; justify-content: space-between; gap: 8px; }
              .items-list { margin: 6px 0; }
              .item-row { margin-bottom: 5px; }
              .item-details { font-size: 9px; padding-left: 10px; color: #444; }
              .header-title { font-size: 13px; font-weight: bold; margin-bottom: 2px; letter-spacing: 0.5px; }
              .header-tagline { font-size: 9px; margin-bottom: 3px; font-style: italic; }
              .header-sub { font-size: 9px; margin-bottom: 2px; }
              .footer { margin-top: 15px; font-size: 9.5px; text-align: center; }
              .stamp {
                display: inline-block;
                border: 1.5px solid #000;
                padding: 2px 6px;
                font-size: 9px;
                font-weight: bold;
                transform: rotate(-3deg);
                margin-top: 6px;
                text-transform: uppercase;
              }
            </style>
          </head>
          <body>
            <div class="center">
              <div class="header-title">OUTPOST COFFEE</div>
              <div class="header-tagline">Slow Bar Coffee & Artisan Pastry</div>
              <div class="header-sub">Jl. Harmonika Baru, Medan</div>
              <div class="header-sub">ig @outpost_coffee</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="flex-row">
              <span>BILL ID: <b>#${order.id}</b></span>
              <span>Status: ${order.status.toUpperCase()}</span>
            </div>
            <div class="flex-row">
              <span>Waktu: ${order.timestamp}</span>
            </div>
            <div class="flex-row">
              <span>Pelanggan: <b>${order.customerName}</b></span>
              <span>Meja: ${order.tableNumberOrType}</span>
            </div>
            
            <div class="divider"></div>
            <div class="center bold">RINCIAN PESANAN</div>
            <div class="divider"></div>

            <div class="items-list">
              ${order.items.map(it => `
                <div class="item-row">
                  <div class="flex-row">
                    <span style="flex: 1;">${it.item.name}</span>
                    <span style="white-space: nowrap;">x${it.quantity}</span>
                    <span class="right" style="width: 75px; white-space: nowrap;">Rp ${(it.item.price * it.quantity).toLocaleString('id-ID')}</span>
                  </div>
                  ${(it.temperature || it.sugarLevel || it.notes) ? `
                    <div class="item-details">
                      ${it.temperature ? `[Suhu: ${it.temperature}]` : ''}
                      ${it.sugarLevel ? `[Takaran Gula: ${it.sugarLevel}]` : ''}
                      ${it.notes ? `<br/>* Catatan: "${it.notes}"` : ''}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>

            <div class="divider"></div>
            
            <div class="flex-row">
              <span>Metode Bayar:</span>
              <span class="bold">${order.paymentMethod === 'Bank Transfer' ? `TF - ${bankAccountHolder}` : order.paymentMethod}</span>
            </div>
            
            <div class="double-divider"></div>
            
            <div class="flex-row bold" style="font-size: 11.5px;">
              <span>TOTAL TAGIHAN:</span>
              <span>Rp ${order.totalAmount.toLocaleString('id-ID')}</span>
            </div>

            <div class="double-divider"></div>
            
            <div class="center">
              <span class="stamp">${order.status === 'Completed' ? 'PAID / LUNAS' : order.status}</span>
            </div>

            <div class="footer">
              <p class="bold">Terima Kasih Atas Kunjungan Anda!</p>
              <p>Seduhan terbaik disiapkan dengan dedikasi tinggi.</p>
              <p>Outpost Coffee - Medan Slow Bar</p>
              <p style="font-size: 7.5px; margin-top: 10px; color: #555; letter-spacing: 0.5px;">POWERED BY OUTPOST POS CLOUD</p>
            </div>

            <script>
              window.onload = function() {
                window.focus();
                window.print();
                setTimeout(function() {
                  window.parent.document.body.removeChild(window.frameElement);
                }, 1000);
              };
            </script>
          </body>
        </html>
      `;

      const doc = iframeDoc.open();
      doc?.write(receiptHtml);
      doc?.close();
      displayToast(`Mentransfer struk #${order.id} ke mesin cetak browser...`);
    } catch (err) {
      console.error("Print Iframe Error, trying fallback window.print", err);
      window.print();
    }
  };

  // --- Export POS Reports to CSV ---
  const handleExportReportCSV = (filteredOrdersList: CashierOrder[]) => {
    if (filteredOrdersList.length === 0) {
      displayToast("Gagal ekspor: tidak ada data transaksi yang cocok.");
      return;
    }

    const headers = [
      "ID Transaksi",
      "Sesi Waktu",
      "Nama Tamu",
      "Meja / Tipe",
      "Status",
      "Pembayaran",
      "Deskripsi Pesanan Menu",
      "Total Belanja (IDR)"
    ];
    
    const csvRows = [headers.join(",")];

    filteredOrdersList.forEach(order => {
      const id = `"${order.id.replace(/"/g, '""')}"`;
      const timestamp = `"${order.timestamp.replace(/"/g, '""')}"`;
      const customer = `"${order.customerName.replace(/"/g, '""')}"`;
      const table = `"${order.tableNumberOrType.replace(/"/g, '""')}"`;
      const status = `"${order.status.replace(/"/g, '""')}"`;
      const payment = `"${order.paymentMethod.replace(/"/g, '""')}"`;
      
      const itemsDescription = order.items.map(it => {
        let desc = `${it.item.name} x${it.quantity}`;
        const modifiers = [];
        if (it.temperature && it.temperature !== 'Normal') modifiers.push(it.temperature);
        if (it.sugarLevel && it.sugarLevel !== 'Normal') modifiers.push(it.sugarLevel);
        if (modifiers.length > 0) desc += ` (${modifiers.join('/')})`;
        if (it.notes) desc += ` [Catatan: ${it.notes.replace(/[\[\]]/g, '')}]`;
        return desc;
      }).join("; ");
      const itemsEscaped = `"${itemsDescription.replace(/"/g, '""')}"`;
      
      const amount = order.totalAmount;

      const row = [id, timestamp, customer, table, status, payment, itemsEscaped, amount];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\r\n");
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Kasir_OutpostCoffee_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    displayToast(`Berhasil mengekspor ${filteredOrdersList.length} baris laporan ke CSV.`);
  };

  // --- POS Plain-Text Receipt Generator ---
  const handleDownloadTxtReceipt = (order: CashierOrder) => {
    const lineStr = "========================================\r\n";
    const dashedStr = "----------------------------------------\r\n";
    let txt = "";
    txt += "             OUTPOST COFFEE             \r\n";
    txt += "    Slow Bar Coffee & Artisan Pastry    \r\n";
    txt += "       Jl. Harmonika Baru, Medan        \r\n";
    txt += "          ig @outpost_coffee            \r\n";
    txt += "        Telp: +62 811-1234-5678         \r\n";
    txt += lineStr;
    txt += `BILL ID: #${order.id}\r\n`;
    txt += `Waktu:   ${order.timestamp}\r\n`;
    txt += `Tamu:    ${order.customerName}\r\n`;
    txt += `Meja:    ${order.tableNumberOrType}\r\n`;
    txt += `Status:  ${order.status.toUpperCase()}\r\n`;
    txt += lineStr;
    txt += "            RINCIAN PESANAN             \r\n";
    txt += dashedStr;
    order.items.forEach(it => {
      const itemName = `${it.item.name} x${it.quantity}`;
      const itemPrice = `Rp ${(it.item.price * it.quantity).toLocaleString('id-ID')}`;
      const spaces = 40 - itemName.length - itemPrice.length;
      txt += itemName + " ".repeat(spaces > 0 ? spaces : 1) + itemPrice + "\r\n";
      if (it.temperature && it.temperature !== 'Normal') {
        txt += `  [Suhu: ${it.temperature}]\r\n`;
      }
      if (it.sugarLevel && it.sugarLevel !== 'Normal') {
        txt += `  [Takaran Gula: ${it.sugarLevel}]\r\n`;
      }
      if (it.notes) {
        txt += `  [* Catatan: "${it.notes}"]\r\n`;
      }
    });
    txt += lineStr;
    txt += `Pembayaran: ${order.paymentMethod === 'Bank Transfer' ? `Transfer - ${bankAccountHolder}` : order.paymentMethod}\r\n`;
    txt += dashedStr;
    const totalText = `Rp ${order.totalAmount.toLocaleString('id-ID')}`;
    const totalLineLabel = "TOTAL TAGIHAN:";
    const fillSpaces = 40 - totalLineLabel.length - totalText.length;
    txt += totalLineLabel + " ".repeat(fillSpaces > 0 ? fillSpaces : 1) + totalText + "\r\n";
    txt += lineStr;
    txt += "      Terima Kasih Atas Kunjungan!      \r\n";
    txt += "   Sajian terbaik untuk hari terbaik   \r\n";
    txt += "      Powered by Outpost Coffee POS     \r\n";

    const blob = new Blob([txt], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Struk_Outpost_${order.id}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    displayToast(`Struk #${order.id} diunduh sebagai berkas TXT.`);
  };
  
  // --- Live Chat Helper Functions ---
  const handleSendGuestMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const formattedTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const currentGuestName = custName.trim() || clientLoggedInName || 'Tamu Meja ' + (tableOrType === 'Table' ? tableNum : 'Umum');
    
    const newMessage = {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      sender: 'guest',
      senderName: currentGuestName,
      text: textToSend.trim(),
      timestamp: formattedTime,
      guestSessionId: guestSessionId,
      customerName: custName.trim() || clientLoggedInName || 'Tamu',
      tableNumber: tableOrType === 'Table' ? `Meja ${tableNum}` : 'Takeaway',
      readByGuest: true,
      readByAdmin: false,
    };

    await setDoc(doc(db, "chats", newMessage.id), newMessage);
    setGuestChatText('');

    displayToast("Pesan Anda dikirim ke Kasir!");

    // Barista autoreply simulation for easy standalone testing
    setTimeout(async () => {
      const autoMessage = {
        id: 'auto_' + Date.now(),
        sender: 'admin',
        senderName: 'Barista Antrean POS',
        text: `Halo ${currentGuestName}! Pesan Anda telah kami terima di POS Kasir. Tim kami sedang memproses atau segera menghampiri Anda di ${tableOrType === 'Table' ? `Meja ${tableNum}` : 'area kasir/takeaway'}. 😊`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        guestSessionId: guestSessionId,
        readByGuest: false,
        readByAdmin: true,
      };
      await setDoc(doc(db, "chats", autoMessage.id), autoMessage);
    }, 3500);
  };

  const handleSendAdminMessage = async (textToSend: string, targetSession: string) => {
    if (!textToSend.trim()) return;

    const formattedTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const newMessage = {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      sender: 'admin',
      senderName: 'Barista (POS Kasir)',
      text: textToSend.trim(),
      timestamp: formattedTime,
      guestSessionId: targetSession,
      readByGuest: false,
      readByAdmin: true,
    };

    await setDoc(doc(db, "chats", newMessage.id), newMessage);
    setAdminChatText('');
    displayToast("Balasan chat berhasil dikirim!");
  };

  const handleMarkGuestMessagesAsRead = () => {
    chatMessages.forEach(async m => {
      if (m.sender === 'admin' && m.guestSessionId === guestSessionId && !m.readByGuest) {
        await updateDoc(doc(db, "chats", m.id), { readByGuest: true });
      }
    });
  };

  const handleMarkAdminMessagesAsRead = (sessionId: string) => {
    chatMessages.forEach(async m => {
      if (m.sender === 'guest' && m.guestSessionId === sessionId && !m.readByAdmin) {
        await updateDoc(doc(db, "chats", m.id), { readByAdmin: true });
      }
    });
  };

  // --- Admin actions: Add custom product ---
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdDesc.trim()) {
      alert("Mohon lengkapi info menu.");
      return;
    }

    const newMenuItem: MenuItem = {
      id: 'm-new-' + Math.floor(Math.random() * 9000 + 1000),
      name: newProdName.trim(),
      category: newProdCategory,
      description: newProdDesc.trim(),
      price: newProdPrice,
      tags: newProdTags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      isAvailable: true,
      rating: 5.0,
      imageUrl: newProdImageUrl.trim() || "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600",
      isHotAvailable: newProdCategory !== 'food' && newProdCategory !== 'dessert',
      isIcedAvailable: newProdCategory !== 'food' && newProdCategory !== 'dessert',
      isBest: newProdIsBest
    };

    await setDoc(doc(db, "menu", newMenuItem.id), newMenuItem);
    setShowAddNewProductForm(false);
    setNewProdName('');
    setNewProdDesc('');
    setNewProdPrice(25000);
    setNewProdTags('');
    setNewProdImageUrl('');
    setNewProdIsBest(false);
    displayToast(`${newMenuItem.name} berhasil ditambahkan ke menu!`);
  };

  // --- Admin actions: Start editing product ---
  const handleStartEditProduct = (item: MenuItem) => {
    setEditingItemId(item.id);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditDesc(item.description);
    setEditPrice(item.price);
    setEditTags(item.tags.join(', '));
    setEditImageUrl(item.imageUrl || '');
    setEditIsBest(item.isBest || false);
  };

  // --- Admin actions: Save edited product ---
  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editDesc.trim()) {
      alert("Mohon lengkapi info edit menu.");
      return;
    }

    if (editingItemId) {
      await setDoc(doc(db, "menu", editingItemId), {
        id: editingItemId,
        name: editName.trim(),
        category: editCategory,
        description: editDesc.trim(),
        price: editPrice,
        tags: editTags.split(',').map(t => t.trim()).filter(t => t.length > 0),
        isAvailable: menuItems.find(m => m.id === editingItemId)?.isAvailable ?? true,
        rating: menuItems.find(m => m.id === editingItemId)?.rating ?? 5.0,
        imageUrl: editImageUrl.trim() || "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600",
        isHotAvailable: editCategory !== 'food' && editCategory !== 'dessert',
        isIcedAvailable: editCategory !== 'food' && editCategory !== 'dessert',
        isBest: editIsBest
      });
    }

    setEditingItemId(null);
    displayToast("Perubahan menu berhasil disimpan!");
  };

  // --- Admin actions: Post replies to reviews ---
  const handlePostReply = async (reviewId: string) => {
    if (!feedbackReplyText.trim()) return;
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      await setDoc(doc(db, "reviews", reviewId), {
        ...review,
        reply: feedbackReplyText.trim()
      });
    }
    setFeedbackReplyText('');
    setTargetFeedbackId(null);
    displayToast("Balasan ulasan terkirim.");
  };

  // --- Computed stats inside Cashier panel ---
  const totalCompletedEarnings = orders
    .filter(o => o.status === 'Completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'On Process').length;

  // --- Filtering & search applied to menu lists ---
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AnimatePresence mode="wait">
      {currentPage === 'login-client' ? (
        <motion.div
          key="login-page-view"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          <ClientLoginForm
            initialEmail={clientEmail}
            onLoginSuccess={(email, name) => {
              setClientEmail(email);
              setClientLoggedInName(name);
              setCurrentPage('landing');
              displayToast(`Selamat datang kembali, ${name}!`);
            }}
            onCancel={() => {
              setCurrentPage('landing');
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="landing-page-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="min-h-screen bg-brand-cream text-brand-brown selection:bg-brand-green selection:text-brand-cream font-sans antialiased relative"
        >
      
      {/* Primary Navigation Bar */}
      <header className="sticky top-0 z-30 bg-brand-cream/90 backdrop-blur-md border-b border-brand-green/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand Brand */}
          <a href="#" className="flex items-center gap-3">
            <img
              src={OutpostLogo}
              alt="Logo Outpost Coffee"
              className="w-12 h-12 rounded-full border border-brand-green/20 bg-white object-contain"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="font-serif text-lg tracking-wider font-extrabold text-brand-brown uppercase leading-none">
                OUTPOST COFFEE
              </h1>
              <p className="text-[9px] tracking-widest font-mono font-bold text-brand-green uppercase mt-1">
                Coffee & Beverage Co.
              </p>
            </div>
          </a>

          {/* Navigasi Umum */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-brand-brown">
            <a href="#about" className="hover:text-brand-green transition-colors">Profil Kita</a>
            <button
              onClick={() => setIsMenuModalOpen(true)}
              className="hover:text-brand-green transition-colors cursor-pointer uppercase text-xs font-semibold tracking-wider text-brand-brown bg-transparent border-none p-0 focus:outline-none"
            >
              Menu Kita
            </button>
            <a href="#feedback-section" className="hover:text-brand-green transition-colors">Ulasan Tamu</a>
          </nav>

          {/* Cart Icon & Actions */}
          <div className="flex items-center gap-3">
            {clientLoggedInName ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border border-brand-green/10 shadow-xs">
                <span className="text-xs font-bold text-[#2B1E17] max-w-[100px] truncate">👋 {clientLoggedInName}</span>
                <button
                  id="btn-client-logout"
                  onClick={() => {
                    setClientLoggedInName('');
                    setClientEmail('');
                    displayToast('Berhasil keluar dari akun!');
                  }}
                  className="p-1 rounded-full text-red-650 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
                  title="Keluar Sesi"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-to-client-login"
                onClick={() => setIsGuestModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-[#2B1E17] text-white hover:bg-[#4A533C] text-[10px] sm:text-xs font-bold rounded-full transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:hidden">Masuk</span>
                <span className="hidden sm:inline">Login Guest (Cukup Isi Nama)</span>
              </button>
            )}

            <button
              id="nav-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-white hover:bg-brand-cream-dark/30 border border-brand-green/10 transition-all cursor-pointer flex items-center justify-center shadow-xs"
            >
              <ShoppingBag className="w-5 h-5 text-brand-brown" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-green text-brand-cream font-mono text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {isAdminLoggedIn && (
              <button
                id="btn-fast-pos"
                onClick={() => setIsAdminMode(true)}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-green text-brand-cream text-xs font-mono font-bold rounded-full hover:bg-brand-green-light"
              >
                <DollarSign className="w-3.5 h-3.5 animate-pulse" />
                POS Kasir
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sub-header (Hanya untuk mobile / < md) */}
      <div className="md:hidden sticky top-20 z-20 bg-brand-cream/95 backdrop-blur-md border-b border-brand-green/10 py-2 sm:py-2.5 px-4 flex items-center justify-around text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-brown">
        <a href="#about" className="hover:text-brand-green transition-colors flex items-center gap-1.5 focus:outline-none py-1 px-2 rounded-lg hover:bg-brand-cream-dark/20">
          <User className="w-3.5 h-3.5 text-brand-green" /> Profil Kita
        </a>
        <button
          onClick={() => setIsMenuModalOpen(true)}
          className="hover:text-brand-green transition-colors cursor-pointer uppercase text-[10px] sm:text-xs font-bold tracking-wider text-brand-brown bg-transparent border-none p-0 flex items-center gap-1.5 focus:outline-none py-1 px-2 rounded-lg hover:bg-brand-cream-dark/20"
        >
          <Coffee className="w-3.5 h-3.5 text-brand-green" /> Menu Kita
        </button>
        <a href="#feedback-section" className="hover:text-brand-green transition-colors flex items-center gap-1.5 focus:outline-none py-1 px-2 rounded-lg hover:bg-brand-cream-dark/20">
          <MessageSquare className="w-3.5 h-3.5 text-brand-green" /> Ulasan Tamu
        </a>
      </div>

      {/* 3. Micro notification Toast overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-brand-brown text-brand-cream border border-brand-green-light p-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm"
          >
            <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center text-white shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        
        {/* HERO SECTION - PRESENTING THE CORE OUTPOST PROFILE & LOGO EMBLAZON */}
        <motion.section
          id="about"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="bg-brand-cream-light p-6 md:p-12 rounded-3xl border border-brand-green/10 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-cream-dark/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
            
            {/* Left Narrative Profile: 8 cols */}
            <div className="lg:col-span-8 space-y-6">
              
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-brown leading-tight font-light">
                {OUTPOST_PROFILE.name} <strong className="font-semibold block font-serif text-brand-green-dark mt-2">{OUTPOST_PROFILE.tagline}</strong>
              </h2>

              <p className="text-sm text-brand-brown/85 leading-relaxed">
                {OUTPOST_PROFILE.historyContent}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#menu-selections"
                  className="bg-brand-green hover:bg-brand-green-light text-brand-cream py-3 px-6 rounded-xl text-xs font-bold tracking-wider text-center transition-all shadow-sm"
                >
                  Pesan Menu Sekarang
                </a>
                <a
                  href="#feedback-section"
                  className="bg-white hover:bg-brand-cream-dark/20 border border-brand-green/10 text-brand-green py-3 px-6 rounded-xl text-xs font-bold tracking-wider text-center transition-all"
                >
                  Beri Ulasan Tamu
                </a>
              </div>
            </div>

            {/* Right Mini Callout Info Canvas: 4 cols */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-brand-green/10">
                <div className="flex gap-3 items-start">
                  <Award className="w-8 h-8 text-yellow-600 shrink-0" />
                  <div>
                    <h5 className="font-serif text-xs font-bold text-brand-brown">Produk Higienis & Premium</h5>
                    <p className="text-[11px] text-brand-brown/70 leading-relaxed mt-0.5">
                      Bahan baku susu segar, kopi hasil panen nusantara terpilih, dan higienitas pengerjaan barista kami terjamin berkala.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.section>

        {/* 4. CHOOSE CATEGORY & SEARCH COMPONENT */}
        <motion.section
          id="menu-selections"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="space-y-8"
        >
          
          <div className="border-b border-brand-green/10 pb-6">
            <span className="text-xs font-mono font-bold tracking-wider text-brand-green uppercase">
              Selection Menu & Taste Experience
            </span>
            <h3 className="font-serif text-3xl text-brand-brown mt-1">
              Menu Best Outpost
            </h3>
            <p className="text-xs text-brand-brown/70 mt-1">
              Sajian terpopuler dengan rasa paling autentik dari Outpost Coffee.
            </p>
          </div>

          {/* ACTIVE MENU LISTING */}
          <div className="space-y-8">
            <div id="cafe-menu-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {(() => {
                  const bestItems = menuItems.filter(item => item.isBest);
                  const displayedItems = showAllMenu ? menuItems : (bestItems.length > 0 ? bestItems : menuItems.slice(0, 3));
                  return displayedItems;
                })().map((item, index) => {
                  const isSelectedAvailable = item.isAvailable;
                  
                  return (
                    <motion.div
                      id={`menu-item-card-${item.id}`}
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 24 }}
                      transition={{ 
                        opacity: { duration: 0.35 },
                        y: { type: "spring", stiffness: 100, damping: 15 },
                        delay: index * 0.05
                      }}
                      className={`bg-white rounded-3xl border border-brand-green/10 p-4 pb-5 flex flex-col justify-between shadow-xs transition-all relative ${
                        !isSelectedAvailable ? 'opacity-70 grayscale' : 'hover:shadow-md'
                      }`}
                    >
                      <div>
                        {/* Beautiful Food/Drink Image */}
                        <div className="w-full h-48 overflow-hidden rounded-2xl mb-4 relative bg-brand-cream-light border border-brand-green/5">
                          <img
                            src={item.imageUrl || (
                              item.category === 'coffee' ? "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600" :
                              item.category === 'non-coffee' ? "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600" :
                              item.category === 'food' ? "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600" :
                              "https://images.unsplash.com/photo-1508737027454-e6454ef45afd?auto=format&fit=crop&q=80&w=600"
                            )}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 duration-500 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Top Badges & rating info */}
                        <div className="flex justify-between items-start">
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] font-mono tracking-wide py-0.5 px-2 bg-brand-cream-light text-brand-green rounded-md font-semibold"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          {item.rating && (
                            <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              ★ {item.rating}
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif text-lg font-bold text-brand-brown mt-3">
                          {item.name}
                        </h4>
                        <p className="text-xs text-brand-brown/75 mt-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-brand-green/5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-brand-green/60 block">Harga Satuan</span>
                          <span className="font-mono text-sm font-bold text-brand-brown block">
                            Rp {item.price.toLocaleString('id-ID')}
                          </span>
                        </div>

                        {isSelectedAvailable ? (
                          <button
                            id={`btn-order-item-${item.id}`}
                            onClick={() => handleOpenCustomizer(item)}
                            className="bg-brand-green hover:bg-brand-green-light text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 shadow-xs"
                          >
                            Pesan
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] uppercase font-mono font-bold bg-gray-200 text-gray-500 px-3 py-1.5 rounded-xl border border-gray-300">
                            Habis / Sold Out
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {menuItems.length > 3 && (
              <div className="flex justify-center pt-4">
                <button
                  id="btn-toggle-menu-expand"
                  onClick={() => setShowAllMenu(!showAllMenu)}
                  className="px-8 py-3.5 bg-brand-green hover:bg-brand-green-light text-white font-mono text-xs font-bold uppercase tracking-widest rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95 flex items-center gap-2.5 cursor-pointer"
                >
                  {showAllMenu ? (
                    <>
                      <span>Sembunyikan Menu Lain</span>
                      <span className="text-sm">▲</span>
                    </>
                  ) : (
                    <>
                      <span>Lihat Seluruh Sajian ({menuItems.length})</span>
                      <span className="text-sm">▼</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.section>

        {/* 5. GUEST FEEDBACK / REVIEWS HUB COMPONENT */}
        <motion.section
          id="feedback-section"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          
          {/* Write a review Form: 5 cols */}
          <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-2xl border border-brand-green/12 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-mono font-bold tracking-wider text-brand-green uppercase">
                Give Us Your Feedback
              </span>
              <h3 className="font-serif text-2xl text-brand-brown mt-1">
                Kesan Kunjungan Tamu
              </h3>
              <p className="text-xs text-brand-brown/75 mt-1 leading-relaxed">
                Kepuasan dan senyuman Anda di meja Outpost adalah energi kami. Silakan beri ulasan masukan yang membangun bagi pelayanan kami.
              </p>
            </div>

            {reviewSubmitSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs space-y-1">
                <span className="font-bold block text-sm">Review Dikirim! ✓</span>
                <p>Ulasan Anda langsung terbit di kolom testimoni tamu samping secara real-time.</p>
              </div>
            )}

            <form id="feedback-form" onSubmit={handleSubmitReview} className="space-y-4 text-xs font-medium">
              <div className="space-y-1.5">
                <label className="text-brand-brown font-bold">Nama Tamu & Inisial</label>
                <input
                  id="inp-reviewer-name"
                  type="text"
                  placeholder="Misal: Andi Wijaya"
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-green/15 rounded-xl bg-brand-cream-light/40 text-brand-brown focus:outline-none focus:border-brand-green"
                  required
                />
              </div>

              {/* Star choosing UI */}
              <div className="space-y-2">
                <label className="text-brand-brown font-bold block">Seberapa Puas Anda?</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const activeStar = starVal <= newReviewRating;
                    return (
                      <button
                        id={`btn-star-rating-${starVal}`}
                        type="button"
                        key={starVal}
                        onClick={() => setNewReviewRating(starVal)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${activeStar ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-brand-brown font-bold">Ulasan Anda</label>
                <textarea
                  id="inp-reviewer-comment"
                  rows={4}
                  placeholder="Ceritakan suasana atau cita rasa menu favorit yang Anda pesan..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-green/15 rounded-xl bg-brand-cream-light/40 text-brand-brown focus:outline-none focus:border-brand-green"
                  required
                />
              </div>

              <button
                id="btn-submit-review"
                type="submit"
                className="w-full bg-brand-green hover:bg-brand-green-light text-brand-cream p-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs flex items-center justify-center gap-2"
              >
                Kirim Feedback Tamu
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* List of Feedback Logs: 7 cols */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-mono font-bold tracking-wider text-brand-green uppercase">
                  Tamu Testimonials
                </span>
                <h3 className="font-serif text-2xl text-brand-brown">
                  Suara Pengunjung Setia
                </h3>
              </div>
              <span className="text-xs font-mono bg-brand-cream-light px-3 py-1.5 rounded-full border border-brand-green/10 text-brand-green font-bold">
                {reviews.length} Ulasan Terbit
              </span>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {reviews.map((rev) => (
                <div
                  id={`review-log-${rev.id}`}
                  key={rev.id}
                  className="bg-white p-5 rounded-xl border border-brand-green/10 shadow-xs space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-serif font-bold text-brand-brown text-sm">{rev.name}</h4>
                      <span className="text-[10px] font-mono text-brand-green/60">{rev.date}</span>
                    </div>

                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-brand-brown/85 leading-relaxed italic bg-brand-cream-light/20 p-2.5 rounded-md">
                    "{rev.comment}"
                  </p>

                  {/* Reply from cashier/barista manager */}
                  {rev.reply ? (
                    <div className="bg-brand-brown/5 border-l-2 border-brand-green p-3 rounded-r-lg space-y-1 ml-4">
                      <div className="flex justify-between text-[10px] font-bold text-brand-green">
                        <span className="flex items-center gap-1 uppercase tracking-wide">
                          <UserCheck className="w-3 h-3" />
                          Balasan Barista Outpost
                        </span>
                        <span className="font-mono opacity-60">Manager</span>
                      </div>
                      <p className="text-xs text-brand-brown/95 leading-relaxed">{rev.reply}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

        </motion.section>

      </main>

      {/* FOOTER */}
      <footer className="bg-brand-brown text-brand-cream border-t border-brand-green-dark mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={OutpostLogo}
                  alt="Logo Mini Footer"
                  className="w-10 h-10 rounded-full border border-white/10 bg-white object-contain"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-serif text-base font-extrabold tracking-wider uppercase leading-none text-white">OUTPOST COFFEE</h4>
                  <span className="text-[9px] font-mono tracking-widest text-brand-green-light uppercase">Coffee & Beverage</span>
                </div>
              </div>
              <p className="text-xs text-brand-cream-dark/80 leading-relaxed max-w-sm">
                Sanctuary kumpul hangat di bawah rimbunnya pondok teduh. Kami menghadirkan seduhan kopi nusantara yang ramah, hangat, dan selalu dirindukan.
              </p>
              <div className="text-[10px] text-brand-cream-dark/50 font-mono">
                &copy; 10 Juni 2026 Outpost Coffee Medan. Dibuat dengan penuh dedikasi.
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-serif text-sm font-semibold tracking-wide text-white">Pondok Navigasi</h5>
              <ul className="space-y-1.5 text-xs text-brand-cream-dark/80">
                <li><a href="#about" className="hover:text-amber-300">Profil Outpost</a></li>
                <li>
                  <button
                    onClick={() => setIsMenuModalOpen(true)}
                    className="hover:text-amber-300 cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                  >
                    Daftar Menu Kita
                  </button>
                </li>
                <li><a href="#feedback-section" className="hover:text-amber-300">Beri Ulasan Tamu</a></li>
                <li>
                  <button
                    id="footer-admin-btn"
                    onClick={() => setIsAdminMode(true)}
                    className="inline-flex items-center justify-center p-2 bg-yellow-400 hover:bg-yellow-300 text-brand-brown rounded-xl shadow-xs transition-all cursor-pointer group mt-1"
                    title="Portal Manajemen Kasir (POS)"
                  >
                    <Calculator className="w-4 h-4 transition-transform group-hover:scale-110" />
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="font-serif text-sm font-semibold tracking-wide text-white">Kontak & Reservasi</h5>
              <p className="text-xs text-brand-cream-dark/85 leading-relaxed">
                {OUTPOST_PROFILE.address}
              </p>
              <div>
                <a
                  href="https://maps.app.goo.gl/AdhYxqj146C8DHHu7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-brand-brown rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-95 duration-200 mt-1"
                >
                  <MapPin className="w-3.5 h-3.5 text-brand-brown" />
                  <span>Google Maps Outpost Coffee</span>
                </a>
              </div>
              <div>
                <a
                  href="https://www.instagram.com/out_postcoffee?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:opacity-90 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-95 duration-200 mt-1"
                >
                  <Instagram className="w-3.5 h-3.5 text-white" />
                  <span>Instagram @out_postcoffee</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </footer>


      {/* MODAL GUEST LOGIN */}
      <AnimatePresence>
        {isGuestModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            
            {/* Dark opaque backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGuestModalOpen(false)}
              className="fixed inset-0 bg-brand-brown/70 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-brand-cream border border-brand-green/20 max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6 flex flex-col justify-between"
            >
              
              <button
                id="btn-close-guest-modal"
                onClick={() => setIsGuestModalOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-white border border-brand-green/10 text-brand-brown hover:bg-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                
                <div className="text-center pb-2">
                  <div className="inline-flex p-3 bg-yellow-105 rounded-full text-brand-green bg-amber-100 mb-2">
                    <User className="w-6 h-6 text-[#2B1E17]" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-brand-brown">
                    Login Guest (Tamu)
                  </h3>
                  <p className="text-xs text-brand-brown/65 mt-1 leading-relaxed">
                    Cukup masukkan nama panggilan Anda untuk langsung memesan menu atau memberi ulasan.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!guestNameInput.trim()) {
                      displayToast('Silakan masukkan nama Anda!');
                      return;
                    }
                    setClientLoggedInName(guestNameInput.trim());
                    setIsGuestModalOpen(false);
                    setGuestNameInput('');
                    displayToast(`Selamat bergabung, ${guestNameInput.trim()}!`);
                  }}
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-brand-brown/80 text-left">
                      Nama Panggilan / Guest Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi, Sarah, Andi..."
                      value={guestNameInput}
                      onChange={(e) => setGuestNameInput(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-brand-green/20 hover:border-brand-green focus:border-[#2B1E17] rounded-xl px-4 py-3 text-xs font-semibold text-[#2B1E17] placeholder-[#5A4D41]/40 focus:outline-none transition-all"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-brand-brown py-3 rounded-xl text-xs font-bold uppercase tracking-[0.05em] transition-all shadow-xs cursor-pointer mt-2"
                  >
                    Masuk Sekarang
                  </button>
                </form>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* MODAL MENU KITA */}
      <AnimatePresence>
        {isMenuModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 md:p-8">
            
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuModalOpen(false)}
              className="fixed inset-0 bg-brand-brown/70 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-brand-cream border border-brand-green/20 max-w-5xl w-full h-[90vh] md:h-[85vh] rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col"
            >
              
              {/* Close Button */}
              <button
                id="btn-close-menu-modal"
                onClick={() => setIsMenuModalOpen(false)}
                className="absolute right-5 top-5 p-2 rounded-full bg-white border border-brand-green/10 text-brand-brown hover:bg-brand-cream-light cursor-pointer shadow-xs transition-all duration-200 z-20"
                title="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header & Quick Filters */}
              <div className="p-4 md:p-6 border-b border-brand-green/10 bg-white space-y-3 shrink-0">
                <div className="text-left">
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-brand-brown">
                    Daftar Menu Kita
                  </h3>
                </div>

                {/* Search and Category pills */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1">
                  
                  {/* Category Pills */}
                  <div className="flex flex-row overflow-x-auto whitespace-nowrap gap-1.5 order-2 sm:order-1 max-w-full pb-1 -mx-4 px-4 no-scrollbar scroll-smooth snap-x">
                    {[
                      { key: 'all', title: '🥛 Semua' },
                      { key: 'coffee', title: '☕ Kopi' },
                      { key: 'non-coffee', title: '🍵 Non-Kopi' },
                      { key: 'food', title: '🥐 Camilan' }
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setMenuModalCategory(cat.key as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono transition-all cursor-pointer shrink-0 snap-start ${
                          menuModalCategory === cat.key
                            ? 'bg-brand-brown text-[#FFF9F2] shadow-sm'
                            : 'bg-brand-cream-light text-brand-brown hover:bg-[#FAF8F5]'
                        }`}
                      >
                        {cat.title}
                      </button>
                    ))}
                  </div>

                  {/* Search bar input with icon */}
                  <div className="relative max-w-xs w-full order-1 sm:order-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-brown/40" />
                    <input
                      type="text"
                      placeholder="Cari Menu Favoritmu..."
                      value={menuModalSearch}
                      onChange={(e) => setMenuModalSearch(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-brand-green/15 focus:border-brand-brown/60 hover:border-brand-green rounded-full pl-9 pr-4 py-2 text-xs font-semibold text-[#2B1E17] placeholder-brand-brown/40 focus:outline-none transition-all"
                    />
                    {menuModalSearch && (
                      <button
                        onClick={() => setMenuModalSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-brown hover:text-red-650 text-xs font-bold"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                </div>
              </div>

              {/* Scrollable Menu Items Container */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-brand-cream-light custom-scrollbar">
                
                {menuItems.filter(item => {
                  const matchesSearch = item.name.toLowerCase().includes(menuModalSearch.toLowerCase()) ||
                                        item.description.toLowerCase().includes(menuModalSearch.toLowerCase()) ||
                                        item.tags.some(t => t.toLowerCase().includes(menuModalSearch.toLowerCase()));
                  const matchesCategory = menuModalCategory === 'all' || item.category === menuModalCategory;
                  return matchesSearch && matchesCategory;
                }).length === 0 ? (
                  
                  // Empty state filter
                  <div className="text-center py-16 space-y-3">
                    <div className="inline-flex p-4 rounded-full bg-brand-cream text-brand-brown/30 mb-2">
                      <Coffee className="w-10 h-10" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-brand-brown">Menu Tidak Ditemukan</h4>
                    <p className="text-xs text-brand-brown/60 max-w-sm mx-auto leading-relaxed">
                      Waduh, menu yang Anda cari sepertinya belum tersedia atau Anda bisa mencoba dengan kata kunci lain.
                    </p>
                    <button
                      onClick={() => {
                        setMenuModalSearch('');
                        setMenuModalCategory('all');
                      }}
                      className="px-4 py-2 bg-brand-green hover:bg-brand-green-light text-white text-xs font-mono font-bold uppercase tracking-wider rounded-full transition cursor-pointer mt-1"
                    >
                      Reset Filter
                    </button>
                  </div>

                ) : (
                  
                  // Clean classified modular menu grid
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.filter(item => {
                      const matchesSearch = item.name.toLowerCase().includes(menuModalSearch.toLowerCase()) ||
                                            item.description.toLowerCase().includes(menuModalSearch.toLowerCase()) ||
                                            item.tags.some(t => t.toLowerCase().includes(menuModalSearch.toLowerCase()));
                      const matchesCategory = menuModalCategory === 'all' || item.category === menuModalCategory;
                      return matchesSearch && matchesCategory;
                    }).map((item, index) => {
                      const isSelectedAvailable = item.isAvailable;
                      
                      return (
                        <motion.div
                          id={`modal-menu-card-${item.id}`}
                          key={item.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.3 }}
                          className={`bg-white rounded-2xl border border-brand-green/10 p-4 flex flex-col justify-between shadow-xs transition-all relative ${
                            !isSelectedAvailable ? 'opacity-75 grayscale' : 'hover:shadow-md'
                          }`}
                        >
                          <div>
                            {/* Product Preview Image */}
                            <div className="w-full h-40 overflow-hidden rounded-xl mb-3 relative bg-brand-cream-light border border-brand-green/5">
                              <img
                                src={item.imageUrl || (
                                  item.category === 'coffee' ? "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600" :
                                  item.category === 'non-coffee' ? "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600" :
                                  item.category === 'food' ? "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600" :
                                  "https://images.unsplash.com/photo-1508737027454-e6454ef45afd?auto=format&fit=crop&q=80&w=600"
                                )}
                                alt={item.name}
                                className="w-full h-full object-cover duration-300 transform hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            {/* Badges metadata */}
                            <div className="flex justify-between items-start gap-1">
                              <div className="flex flex-wrap gap-1">
                                {item.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[8px] font-mono tracking-wide py-0.5 px-1.5 bg-brand-cream/80 text-brand-green rounded font-semibold"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              {item.rating && (
                                <div className="flex items-center gap-0.5 shrink-0 bg-yellow-50 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-600">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
                                  <span>{item.rating}</span>
                                </div>
                              )}
                            </div>

                            {/* Name and description text */}
                            <h4 className="font-serif text-base font-bold text-brand-brown mt-2.5 leading-snug">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-brand-brown/70 mt-1 line-clamp-2 leading-relaxed h-8">
                              {item.description}
                            </p>
                          </div>

                          {/* Price label, and Booking CTA button */}
                          <div className="flex items-center justify-between border-t border-brand-green/5 pt-3 mt-3 shrink-0">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-brand-green/70 block leading-none">
                                Harga Sajian
                              </span>
                              <span className="font-serif text-sm font-bold text-[#2B1E17] block mt-1">
                                Rp {item.price.toLocaleString('id-ID')}
                              </span>
                            </div>

                            {isSelectedAvailable ? (
                              <button
                                onClick={() => {
                                  handleOpenCustomizer(item);
                                  setIsMenuModalOpen(false);
                                }}
                                className="px-3.5 py-1.5 bg-[#2B1E17] hover:bg-[#4A533C] text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 hover:scale-102 active:scale-98"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Pesan Baru</span>
                              </button>
                            ) : (
                              <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold font-mono uppercase">
                                Habis
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                )}

              </div>

              {/* Premium Footer summary for Modal */}
              <div className="p-4 md:px-8 border-t border-brand-green/10 bg-white text-center shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[10.5px] text-brand-brown/50 font-mono">
                  Menyajikan seduhan murni dari perkebunan nusantara terbaik ke gelas Anda.
                </span>
                <button
                  onClick={() => setIsMenuModalOpen(false)}
                  className="px-5 py-2 border border-brand-green/20 hover:bg-[#FAF8F5] text-[#2B1E17] text-xs font-bold rounded-full transition cursor-pointer"
                >
                  Kembali Ke Beranda
                </button>
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>


      {/* MODAL 1: ORDER CUSTOMIZATION & CONFIGURATOR PANEL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            
            {/* Dark opaque backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-brand-brown/70 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-brand-cream border border-brand-green/20 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6 flex flex-col justify-between"
            >
              
              <button
                id="btn-close-customizer"
                onClick={() => setSelectedProduct(null)}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-white border border-brand-green/10 text-brand-brown hover:bg-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                
                <div>
                  <span className="text-[9px] font-mono tracking-widest bg-brand-green/15 text-brand-green py-0.5 px-2 rounded-full uppercase">
                    Kustomisasi Sajian
                  </span>
                  <h3 className="font-serif text-xl font-black text-brand-brown mt-2">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-xs text-brand-brown/80 mt-1">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Temperature Controls - only logic for non-food */}
                {selectedProduct.category !== 'food' && selectedProduct.category !== 'dessert' && (
                  <div className="space-y-2 border-t border-brand-green/5 pt-3">
                    <span className="text-xs font-bold text-brand-brown block">Pilihan Suhu:</span>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedProduct.isHotAvailable && (
                        <button
                          id="btn-temp-hot"
                          type="button"
                          onClick={() => setCustomTemp('Hot')}
                          className={`py-2 rounded-xl text-xs font-semibold uppercase text-center transition-all ${
                            customTemp === 'Hot'
                              ? 'bg-amber-700 text-white shadow-xs'
                              : 'bg-white border border-brand-green/15 text-brand-brown'
                          }`}
                        >
                          🔥 Panas / Hot
                        </button>
                      )}
                      {selectedProduct.isIcedAvailable && (
                        <button
                          id="btn-temp-iced"
                          type="button"
                          onClick={() => setCustomTemp('Iced')}
                          className={`py-2 rounded-xl text-xs font-semibold uppercase text-center transition-all ${
                            customTemp === 'Iced'
                              ? 'bg-sky-700 text-white shadow-xs'
                              : 'bg-white border border-brand-green/15 text-brand-brown'
                          }`}
                        >
                          ❄️ Dingin / Es
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Sugar Options - only for non-food */}
                {selectedProduct.category !== 'food' && selectedProduct.category !== 'dessert' && (
                  <div className="space-y-2 border-t border-brand-green/5 pt-3">
                    <span className="text-xs font-bold text-brand-brown block">Tingkat Kemanisan (Gula):</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['No Sugar', 'Less Sugar', 'Normal', 'Extra Sugar'] as const).map((sugar) => (
                        <button
                          id={`btn-sugar-${sugar.replace(' ', '')}`}
                          type="button"
                          key={sugar}
                          onClick={() => setCustomSugar(sugar)}
                          className={`py-2 rounded-lg text-[9px] font-bold text-center transition-all ${
                            customSugar === sugar
                              ? 'bg-brand-green text-brand-cream'
                              : 'bg-white border border-brand-green/10 text-brand-brown'
                          }`}
                        >
                          {sugar === 'No Sugar' ? 'Pahit' : sugar === 'Less Sugar' ? 'Sikit' : sugar === 'Normal' ? 'Normal' : 'Ekstra'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Textarea notes */}
                <div className="space-y-1.5 border-t border-brand-green/5 pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-brand-brown">Catatan Tambahan Barista:</span>
                    <span className="text-brand-brown/60">Opsional</span>
                  </div>
                  <input
                    id="inp-customizer-notes"
                    type="text"
                    placeholder="Contoh: Kurangi es batu / pakai gelas takeaway"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-green/15 rounded-xl bg-white text-xs text-brand-brown focus:outline-none focus:border-brand-green"
                  />
                </div>

                {/* Quantity Controls and Total calculator */}
                <div className="flex justify-between items-center bg-brand-cream-light p-3 rounded-xl border border-brand-green/10">
                  <span className="text-xs font-bold text-brand-brown">Jumlah Pesanan:</span>
                  <div className="flex items-center gap-3">
                    <button
                      id="btn-customizer-minus"
                      onClick={() => setCustomQty(prev => Math.max(1, prev - 1))}
                      className="p-1 rounded bg-white border border-brand-green/15 text-brand-brown hover:bg-brand-cream"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-sm font-bold text-brand-green">{customQty}</span>
                    <button
                      id="btn-customizer-plus"
                      onClick={() => setCustomQty(prev => prev + 1)}
                      className="p-1 rounded bg-white border border-brand-green/15 text-brand-brown hover:bg-brand-cream"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  id="btn-customizer-submit"
                  onClick={handleAddToCart}
                  className="w-full bg-brand-green hover:bg-brand-green-light text-white py-3 rounded-xl text-xs font-bold uppercase transition-all shadow-xs"
                >
                  Tambahkan Pemesanan • Rp {(selectedProduct.price * customQty).toLocaleString('id-ID')}
                </button>
                <button
                  id="btn-customizer-cancel"
                  onClick={() => setSelectedProduct(null)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold"
                >
                  Batalkan
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* MODAL 2: GUEST CART / SLIDEOVER & CHECKOUT FORM PANEL */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-brand-brown/70 backdrop-blur-xs cursor-pointer"
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-brand-cream border-l border-brand-green/20 flex flex-col justify-between shadow-2xl relative"
              >
                
                {/* Cart Header */}
                <div className="p-5 border-b border-brand-green/10 flex justify-between items-center bg-white">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-5 h-5 text-brand-green" />
                    <div>
                      <h3 className="font-serif text-lg font-bold">Keranjang Meja Anda</h3>
                      <span className="text-[10px] font-mono text-brand-brown/60">Daftar Menu yang Dipesan</span>
                    </div>
                  </div>
                  <button
                    id="btn-close-cart"
                    onClick={() => setIsCartOpen(false)}
                    className="p-1 rounded-full border border-brand-green/10 hover:bg-brand-cream cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Main Body - dynamically changes step */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  
                  {checkoutStep === 'view' && (
                    <div className="space-y-4">
                      {cart.length > 0 ? (
                        <>
                          <div className="space-y-3">
                            {cart.map((cartItem, idx) => (
                              <div
                                id={`cart-row-${idx}`}
                                key={idx}
                                className="bg-white p-3.5 rounded-xl border border-brand-green/10 flex justify-between gap-3 shadow-xs"
                              >
                                <div className="space-y-1.5 flex-1">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-serif font-black text-xs text-brand-brown leading-tight">
                                      {cartItem.item.name}
                                    </h4>
                                    <span className="font-mono text-xs font-bold text-brand-green shrink-0 ml-2">
                                      Rp {(cartItem.item.price * cartItem.quantity).toLocaleString('id-ID')}
                                    </span>
                                  </div>

                                  {/* Item selections indicators */}
                                  <div className="flex flex-wrap gap-1.5 text-[9px] font-mono text-brand-brown/70">
                                    {cartItem.temperature && cartItem.temperature !== 'Normal' && (
                                      <span className="bg-sky-50 text-sky-800 border border-sky-200/50 px-1.5 py-0.5 rounded">
                                        ❄️ {cartItem.temperature}
                                      </span>
                                    )}
                                    {cartItem.sugarLevel && cartItem.sugarLevel !== 'Normal' && (
                                      <span className="bg-amber-50 text-amber-800 border border-amber-200/50 px-1.5 py-0.5 rounded">
                                        🍬 {cartItem.sugarLevel}
                                      </span>
                                    )}
                                    {cartItem.notes && (
                                      <span className="bg-brand-cream text-brand-brown border border-brand-green/5 px-1.5 py-0.5 rounded italic col-span-full max-w-full text-ellipsis overflow-hidden">
                                        📝 "{cartItem.notes}"
                                      </span>
                                    )}
                                  </div>

                                  {/* Qty Actions inside cart */}
                                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-brand-green/5">
                                    <button
                                      id={`btn-cartitem-delete-${idx}`}
                                      onClick={() => handleRemoveFromCart(idx)}
                                      className="text-red-600 hover:text-red-700 p-1 font-mono text-[10px] uppercase font-bold flex items-center gap-0.5"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Hapus
                                    </button>

                                    <div className="flex items-center gap-2">
                                      <button
                                        id={`btn-cartitem-minus-${idx}`}
                                        onClick={() => handleUpdateCartQty(idx, -1)}
                                        className="p-1 rounded bg-brand-cream/80 border border-brand-green/10"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="font-mono text-xs font-bold text-brand-green">{cartItem.quantity}</span>
                                      <button
                                        id={`btn-cartitem-plus-${idx}`}
                                        onClick={() => handleUpdateCartQty(idx, 1)}
                                        className="p-1 rounded bg-brand-cream/80 border border-brand-green/10"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="bg-brand-cream-light p-4 rounded-xl border border-brand-green/10 font-mono text-xs text-brand-brown space-y-2">
                            <div className="flex justify-between">
                              <span>Subtotal Menu:</span>
                              <span className="font-bold">Rp {getSubtotal().toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-brand-green font-bold text-sm border-t border-brand-green/10 pt-2 mt-1">
                              <span>Total Pembayaran:</span>
                              <span>Rp {getSubtotal().toLocaleString('id-ID')}</span>
                            </div>
                          </div>

                          <button
                            id="btn-checkout-proceed"
                            onClick={() => setCheckoutStep('form')}
                            className="w-full bg-brand-green hover:bg-brand-green-light text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs mt-4"
                          >
                            Lanjutkan Checkout
                          </button>
                        </>
                      ) : (
                        <div className="py-12 text-center text-brand-brown/60 space-y-3">
                          <ShoppingBag className="w-12 h-12 mx-auto opacity-35 text-brand-brown" />
                          <p className="text-sm font-semibold">Keranjang meja Anda saat ini kosong.</p>
                          <p className="text-xs text-brand-brown/70">Segera pilih sajian kopi & camilan lezat kami di menu utama.</p>
                          <button
                            id="btn-cart-close-empty"
                            onClick={() => setIsCartOpen(false)}
                            className="text-xs text-brand-green font-bold underline"
                          >
                            Kembali ke Menu
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {checkoutStep === 'form' && (
                    <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4 text-xs font-medium">
                      
                      <div className="bg-brand-cream-light p-3.5 rounded-xl border border-brand-green/10 space-y-1.5">
                        <span className="text-[10px] font-mono tracking-widest text-brand-green font-bold block uppercase">Review Order</span>
                        <p className="text-brand-brown font-bold text-sm">Sedang memesan {cart.reduce((sum, item) => sum + item.quantity, 0)} item menu.</p>
                        <button
                          id="btn-back-to-cart-items"
                          type="button"
                          onClick={() => setCheckoutStep('view')}
                          className="text-[11px] text-brand-green hover:underline font-semibold block"
                        >
                          ← Batalkan/Koreksi Item Menu
                        </button>
                      </div>

                      <div className="space-y-2 text-brand-brown">
                        <label className="font-bold block">Nama Pembesan (Atas Nama)</label>
                        <input
                          id="inp-checkout-name"
                          type="text"
                          placeholder="Contoh: Budi Santoso"
                          value={custName}
                          onChange={(e) => setCustName(e.target.value)}
                          className="w-full px-3 py-2 border border-brand-green/15 rounded-xl bg-white text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-2 text-brand-brown">
                        <label className="font-bold block">Metode Layanan</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            id="btn-select-dinein"
                            type="button"
                            onClick={() => setTableOrType('Table')}
                            className={`py-2 rounded-xl text-center text-xs font-bold transition-all ${
                              tableOrType === 'Table'
                                ? 'bg-brand-green text-white'
                                : 'bg-white border border-brand-green/15 text-brand-brown'
                            }`}
                          >
                            🍽️ Makan di Sini
                          </button>
                          <button
                            id="btn-select-takeaway"
                            type="button"
                            onClick={() => setTableOrType('Takeaway')}
                            className={`py-2 rounded-xl text-center text-xs font-bold transition-all ${
                              tableOrType === 'Takeaway'
                                ? 'bg-brand-green text-white'
                                : 'bg-white border border-brand-green/15 text-brand-brown'
                            }`}
                          >
                            🛍️ Bawa Pulang
                          </button>
                        </div>
                      </div>

                      {tableOrType === 'Table' && (
                        <div className="space-y-2 text-brand-brown animate-fade-in">
                          <label className="font-bold block">Pilih Nomor Meja Tamu</label>
                          <div className="grid grid-cols-5 gap-2">
                            {['1', '2', '3', '4', '5'].map(num => (
                              <button
                                id={`btn-table-number-${num}`}
                                type="button"
                                key={num}
                                onClick={() => setTableNum(num)}
                                className={`py-2 rounded-lg font-mono text-xs font-bold text-center transition-all ${
                                  tableNum === num
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-white border border-brand-green/10 text-brand-brown'
                                }`}
                              >
                                Meja {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 text-brand-brown">
                        <label className="font-bold block text-sm">Metode Pembayaran Kasir</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['QRIS', 'Cash'] as const).map(m => (
                            <button
                              id={`btn-pay-method-${m.replace(' ', '-')}`}
                              type="button"
                              key={m}
                              onClick={() => setPayMethod(m)}
                              className={`py-2.5 rounded-xl text-[10px] font-extrabold text-center transition-all cursor-pointer border ${
                                payMethod === m
                                  ? 'bg-brand-green text-white border-brand-green shadow-xs'
                                  : 'bg-white border-brand-green/10 text-brand-brown hover:bg-brand-cream/40'
                              }`}
                            >
                              {m === 'QRIS' ? '📱 QRIS Instan' : '💵 Tunai'}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10.5px] text-brand-brown/70 leading-relaxed mt-2.5 bg-brand-cream/40 p-2.5 rounded-xl border border-brand-green/5">
                          {payMethod === 'QRIS' && <span className="block font-medium">✨ <strong>QRIS Instan:</strong> Scan kode barcode dinamis yang terbit di layar sukses setelah Anda mengirim pesanan.</span>}
                          {payMethod === 'Cash' && <span className="block font-medium">💵 <strong>Tunai:</strong> Silakan bayar langsung dengan uang pas atau pecahan besar di loket kasir Barista kami.</span>}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-brand-green/10">
                        <div className="flex justify-between font-mono text-xs mb-3 font-semibold text-brand-brown">
                          <span>Total Tagihan:</span>
                          <span>Rp {getSubtotal().toLocaleString('id-ID')}</span>
                        </div>
                        <button
                          id="btn-checkout-submit"
                          type="submit"
                          className="w-full bg-brand-green hover:bg-brand-green-light text-brand-cream py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs"
                        >
                          Submit Pesanan ke Kasir
                        </button>
                      </div>

                    </form>
                  )}

                  {checkoutStep === 'success' && latestSubmittedOrder && (
                    <div className="text-center space-y-6 py-6">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mx-auto">
                        <Check className="w-6 h-6 animate-bounce" />
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-mono tracking-widest text-brand-green bg-white border border-brand-green/15 px-3 py-1 rounded-full uppercase font-bold">
                          Order Berhasil Diterima
                        </span>
                        <h4 className="font-serif text-xl font-black text-brand-brown mt-2">
                          Metode Pembayaran Pesanan
                        </h4>
                        <p className="text-xs text-brand-brown/80 max-w-xs mx-auto">
                          Pesanan Anda atas nama <span className="font-bold text-brand-green">{latestSubmittedOrder.customerName}</span> telah diteruskan langsung ke bar barista kami.
                        </p>
                      </div>

                      {/* Clean Invoice Summary Card */}
                      <div className="bg-white p-5 rounded-2xl border border-brand-green/15 max-w-xs mx-auto text-left space-y-3.5 shadow-sm relative">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-green rounded-t-2xl" />
                        <span className="text-[10px] font-mono tracking-widest text-[#CB997E] uppercase font-bold block text-center">Ringkasan Tagihan</span>
                        
                        <div className="font-mono text-[11px] text-brand-brown/85 space-y-2 pt-1">
                          <div className="flex justify-between">
                            <span>Layanan:</span>
                            <span className="font-bold text-brand-green">{latestSubmittedOrder.tableNumberOrType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Metode Bayar:</span>
                            <span className="font-bold">{latestSubmittedOrder.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between text-brand-brown border-t border-brand-green/5 pt-2.5 font-black text-xs">
                            <span>Total Tagihan:</span>
                            <span className="text-brand-green">Rp {latestSubmittedOrder.totalAmount.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>

                      {/* DYNAMIC PAYMENT METHOD DETAIL ACCORDING TO CUSTOMER CHOICE */}
                      <div className="bg-white p-5 rounded-2xl border border-brand-green/15 max-w-xs mx-auto text-center space-y-4 shadow-sm relative">
                        <span className="text-[10px] font-mono tracking-widest text-[#CB997E] uppercase font-bold block">Instruksi Pembayaran POS</span>

                        {latestSubmittedOrder.paymentMethod === 'QRIS' && (
                          <div className="space-y-3">
                            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 p-0.5 rounded-2xl inline-block shadow-sm">
                            <div 
                              onClick={() => setPreviewImageUrl(useManualQrisImage && qrisManualImageUrl ? qrisManualImageUrl : `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=qris-pay-outpost-${latestSubmittedOrder.id}-rp-${latestSubmittedOrder.totalAmount}`)}
                              className="bg-white p-2.5 rounded-[14px] cursor-pointer group relative overflow-hidden"
                              title="Klik untuk memperbesar gambar QR"
                            >
                              <img
                                src={useManualQrisImage && qrisManualImageUrl ? qrisManualImageUrl : `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=qris-pay-outpost-${latestSubmittedOrder.id}-rp-${latestSubmittedOrder.totalAmount}`}
                                alt="QRIS Code"
                                className="w-44 h-44 mx-auto object-contain rounded-lg transition-transform group-hover:scale-105 duration-300"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <span className="bg-white/95 text-[10px] text-brand-brown px-2 py-1 rounded-lg font-bold shadow-xs flex items-center gap-1">
                                  <ImageIcon className="w-3.5 h-3.5" /> Klik perbesar
                                </span>
                              </div>
                            </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-center items-center gap-1.5 text-[11px] font-black text-brand-brown">
                                <span className="text-red-650">Q</span>
                                <span className="text-cyan-600">R</span>
                                <span className="text-amber-500">I</span>
                                <span className="text-blue-700">S</span>
                                <span className="bg-brand-green text-white px-1 py-0.2 rounded text-[8px] font-mono tracking-wider">GPN</span>
                              </div>
                              <p className="text-[10.5px] text-brand-brown/70 leading-relaxed max-w-[220px] mx-auto font-medium">
                                Scan QR di atas senilai <strong className="text-brand-green">Rp {latestSubmittedOrder.totalAmount.toLocaleString('id-ID')}</strong> dengan GoPay, OVO, ShopeePay, Dana, LinkAja, atau m-Banking Anda.
                              </p>
                            </div>
                          </div>
                        )}

                        {latestSubmittedOrder.paymentMethod === 'Bank Transfer' && (
                          <div className="space-y-3 text-brand-brown text-left">
                            <div className="bg-brand-cream/30 p-4 rounded-xl border border-brand-green/5 space-y-2.5">
                              <div className="flex justify-between items-center pb-2 border-b border-brand-green/5">
                                <span className="text-[10px] font-mono font-bold uppercase text-brand-green">Bank Instan</span>
                                <span className="text-xs font-black">{bankAccountName}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-brand-brown/50 block font-bold uppercase">No. Rekening</span>
                                <div className="flex justify-between items-center mt-0.5 gap-2">
                                  <span className="font-mono text-sm font-black text-brand-green tracking-wide break-all">{bankAccountNumber}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(bankAccountNumber);
                                      alert('Nomor Rekening disalin!');
                                    }}
                                    className="bg-brand-green text-white text-[9px] px-2 py-1 rounded-md font-bold uppercase cursor-pointer hover:bg-brand-green-light shrink-0 transition-all"
                                  >
                                    Salin
                                  </button>
                                </div>
                              </div>
                              <div>
                                <span className="text-[9px] text-brand-brown/50 block font-bold uppercase">Atas Nama</span>
                                <span className="text-xs font-bold block mt-0.5">{bankAccountHolder}</span>
                              </div>
                            </div>
                            <div className="bg-emerald-50/80 border border-emerald-400/10 p-2 text-[9.5px] text-emerald-950 font-medium leading-relaxed rounded-xl">
                              📢 Harap transfer senilai <strong className="font-mono">Rp {latestSubmittedOrder.totalAmount.toLocaleString('id-ID')}</strong> dan tunjukkan bukti bayar ke barista.
                            </div>
                          </div>
                        )}

                        {latestSubmittedOrder.paymentMethod === 'Cash' && (
                          <div className="space-y-2 text-center py-1">
                            <div className="text-xl">💵</div>
                            <span className="text-xs font-bold block text-brand-brown">Bayar Tunai di Kasir</span>
                            <p className="text-[10.5px] text-brand-brown/70 leading-relaxed max-w-[200px] mx-auto">
                              Silakan lakukan pembayaran langsung ke barista di loket kasir utama atas nama <strong className="text-brand-green">{latestSubmittedOrder.customerName}</strong>.
                            </p>
                          </div>
                        )}

                        {latestSubmittedOrder.paymentMethod === 'Card' && (
                          <div className="space-y-2 text-center py-1">
                            <div className="text-xl">💳</div>
                            <span className="text-xs font-bold block text-brand-brown">Gesek / Tap EDC Kasir</span>
                            <p className="text-[10.5px] text-brand-brown/70 leading-relaxed max-w-[200px] mx-auto">
                              Siapkan kartu Debit atau Kredit Anda untuk ditransaksikan di mesin EDC kasir utama Barista senilai <strong>Rp {latestSubmittedOrder.totalAmount.toLocaleString('id-ID')}</strong>.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 pt-2 max-w-xs mx-auto">
                        <button
                          id="btn-print-stripe"
                          onClick={() => {
                            if (latestSubmittedOrder) {
                              const itemsList = latestSubmittedOrder.items
                                .map(
                                  (cartItem) =>
                                    `• ${cartItem.item.name} x${cartItem.quantity} (${
                                      cartItem.temperature || 'Normal'
                                    }, ${cartItem.sugarLevel || 'Normal'})${
                                      cartItem.notes ? ` [Catatan: ${cartItem.notes}]` : ''
                                    }`
                                )
                                .join('\n');
                              
                              const detailMessage = `Halo Barista/Kasir! Saya KONFIRMASI SUDAH BAYAR untuk pesanan saya:\n` +
                                `📝 No. Pesanan: #${latestSubmittedOrder.id}\n` +
                                `👤 Nama Tamu: ${latestSubmittedOrder.customerName}\n` +
                                `📍 Meja/Tipe: ${latestSubmittedOrder.tableNumberOrType}\n` +
                                `💳 Pembayaran: ${latestSubmittedOrder.paymentMethod} (Status: SUDAH BAYAR)\n\n` +
                                `🛒 Daftar Menu:\n${itemsList}\n\n` +
                                `💰 Total Tagihan: Rp ${latestSubmittedOrder.totalAmount.toLocaleString('id-ID')}\n` +
                                `---------------------------------\n` +
                                `Saya sudah menyelesaikan pembayaran. Mohon dikonfirmasi dan diproses ya kak! Terima kasih banyak! 🙏✨`;

                              handleSendGuestMessage(detailMessage);
                              setIsCartOpen(false);
                              setIsGuestChatOpen(true);
                              displayToast("Membuka Live Chat & mengirim konfirmasi pembayaran!");
                            }
                          }}
                          className="w-full bg-brand-brown hover:bg-brand-brown-light text-white p-2.5 rounded-xl font-bold uppercase tracking-wider text-[10.5px] flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-300" />
                          Konfirmasi Sudah Bayar
                        </button>
                        <button
                          id="btn-checkout-new"
                          onClick={handleResetCheckout}
                          className="w-full bg-brand-green text-brand-cream hover:bg-brand-green-light py-2 px-4 rounded-xl text-xs font-bold"
                        >
                          Pesan Lagi / Mulai Baru
                        </button>
                      </div>

                    </div>
                  )}

                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>


      {/* MODAL 3: PORTAL MANAJEMEN KASIR & FULL POS WORKSPACE */}
      <AnimatePresence>
        {isAdminMode && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-0">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdminMode(false)}
              className="fixed inset-0 bg-brand-brown/85 backdrop-blur-xs cursor-pointer"
            />

            {/* Portal Core Window */}
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-brand-cream w-full h-full max-w-full max-h-full rounded-none overflow-hidden shadow-2xl relative z-10 flex flex-col"
            >
              
              {/* Header section */}
              <div className="bg-brand-brown px-6 py-4 flex justify-between items-center text-brand-cream border-b border-brand-green/20 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-extrabold tracking-tight">Outpost POS Terminal</h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-brand-green-light">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping inline-block" />
                      <span>Sistem Pengaturan Stok & Antrean Meja • Live Sync</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isAdminLoggedIn && (
                    <button
                      id="btn-admin-logout"
                      onClick={handleAdminLogout}
                      className="px-4 py-2 rounded-xl bg-red-650 hover:bg-red-700 font-mono text-[11px] font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Keluar Sesi
                    </button>
                  )}
                  <button
                    id="btn-close-admin"
                    onClick={() => setIsAdminMode(false)}
                    className="p-1.5 rounded-full border border-white/10 text-brand-cream hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Login State Guardian */}
              {!isAdminLoggedIn ? (
                <div className="flex-1 flex items-center justify-center p-8 bg-brand-cream-light overflow-y-auto">
                  <div className="max-w-sm w-full bg-white p-8 rounded-3xl border border-brand-green/10 text-center shadow-lg space-y-5 my-auto">
                    
                    <div className="w-12 h-12 bg-brand-cream rounded-full flex items-center justify-center mx-auto text-brand-green">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-brand-brown">Autentikasi Barista</h4>
                      <p className="text-xs text-brand-brown/70 mt-1.5 leading-relaxed">
                        Masukkan sandi portal kasir Outpost Anda untuk mengakses antrean meja pembayaran, pengaturan ketersediaan stok, dan membalas ulasan.
                      </p>
                    </div>

                    <form id="admin-login-form" onSubmit={handleAdminLogin} className="space-y-4 font-mono text-xs">
                      <div className="space-y-1">
                        <input
                          id="inp-admin-password"
                          type="password"
                          placeholder="Masukkan sandi..."
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-brand-green/15 rounded-xl bg-brand-cream text-center text-brand-brown font-bold tracking-widest focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green text-sm"
                          required
                          autoFocus
                        />
                        {adminLoginError && (
                          <span className="text-[10px] text-red-600 block pt-1">{adminLoginError}</span>
                        )}
                      </div>
                      <button
                        id="btn-submit-admin-login"
                        type="submit"
                        className="w-full bg-brand-green hover:bg-brand-green-light text-white py-3 rounded-xl font-bold uppercase transition-all shadow-md text-xs cursor-pointer"
                      >
                        Buka Portal Meja
                      </button>
                    </form>

                    <div className="pt-2 border-t border-brand-green/5 text-[10px] text-brand-brown/60">
                      🔐 Keamanan kasir lokal term-validasi sistem internal.
                    </div>

                  </div>
                </div>
              ) : (
                
                // MAIN POS WORKSPACE DRAWER PANEL (Elegant side-by-side desk)
                <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-brand-cream-light overflow-hidden">
                  
                  {/* Responsive Top Horizontal Slider for Mobile View */}
                  <div className="flex md:hidden w-full bg-white border-b border-brand-green/10 px-4 py-2.5 overflow-x-auto gap-2 items-center shrink-0">
                    {[
                      { id: 'orders', label: 'Antrean', icon: ShoppingBag, badge: pendingOrdersCount },
                      { id: 'inventory', label: 'Stok', icon: Coffee, badge: null },
                      { id: 'feedbacks', label: 'Feedback', icon: MessageSquareReply, badge: reviews.filter(r => !r.reply).length },
                      { id: 'history', label: 'Riwayat', icon: History, badge: orders.filter(o => o.status === 'Completed').length },
                      { id: 'live-chat', label: 'Chat', icon: MessageSquare, badge: chatMessages.filter(m => m.sender === 'guest' && !m.readByAdmin).length },
                      { id: 'settings', label: 'Bayar', icon: Settings, badge: null }
                    ].map(tab => {
                      const TabIcon = tab.icon;
                      const isActive = adminTab === tab.id;
                      return (
                        <button
                          id={`btn-admin-tab-mob-${tab.id}`}
                          key={tab.id}
                          onClick={() => setAdminTab(tab.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all border ${
                            isActive
                              ? 'bg-brand-green text-white border-brand-green shadow-xs'
                              : 'text-brand-brown/75 bg-brand-cream/20 hover:bg-brand-cream/40 border-transparent	'
                          }`}
                        >
                          <TabIcon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                          {tab.badge !== null && tab.badge > 0 && (
                            <span className={`font-mono text-[8px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? 'bg-amber-500 text-white' : 'bg-brand-green/15 text-brand-green'}`}>
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Responsive Mini Scoreboard for Mobile View */}
                  <div className="flex md:hidden bg-[#FCFBF9] border-b border-brand-green/10 px-4 py-2 justify-between items-center text-[10px] uppercase font-mono tracking-wider text-brand-brown shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-brand-brown/60">Cash:</span>
                      <span className="font-bold text-brand-green">Rp {totalCompletedEarnings.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="w-px h-3 bg-brand-green/15" />
                    <div className="flex items-center gap-1">
                      <span className="text-brand-brown/60">Bills:</span>
                      <span className="font-bold">{orders.length}</span>
                    </div>
                    <div className="w-px h-3 bg-brand-green/15" />
                    <div className="flex items-center gap-1">
                      <span className="text-brand-brown/60">Antrean:</span>
                      <span className="font-bold text-amber-600 animate-pulse">{pendingOrdersCount} Meja</span>
                    </div>
                  </div>
                  
                  {/* Left Sidebar inside administration desk - Desktop Only */}
                  <div className="hidden md:flex w-64 border-r border-brand-green/10 p-5 flex-col justify-between bg-white overflow-y-auto shrink-0 gap-6">
                    <div className="space-y-5">
                      <span className="text-[9px] font-mono tracking-widest text-brand-green uppercase font-semibold pl-1.5">Menu Navigasi POS</span>
                      
                      <div className="space-y-1.5">
                        {[
                          { id: 'orders', label: 'Antrean Pesanan', icon: ShoppingBag, badge: pendingOrdersCount },
                          { id: 'inventory', label: 'Stok Menu Cafe', icon: Coffee, badge: null },
                          { id: 'feedbacks', label: 'Jawab Feedback', icon: MessageSquareReply, badge: reviews.filter(r => !r.reply).length },
                          { id: 'history', label: 'Riwayat Pesanan', icon: History, badge: orders.filter(o => o.status === 'Completed').length },
                          { id: 'live-chat', label: 'Live Chat Tamu', icon: MessageSquare, badge: chatMessages.filter(m => m.sender === 'guest' && !m.readByAdmin).length },
                          { id: 'settings', label: 'Metode Pembayaran', icon: Settings, badge: null }
                        ].map(tab => {
                          const TabIcon = tab.icon;
                          const isActive = adminTab === tab.id;
                          return (
                            <button
                              id={`btn-admin-tab-${tab.id}`}
                              key={tab.id}
                              onClick={() => setAdminTab(tab.id as any)}
                              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer border ${
                                isActive
                                  ? 'bg-brand-green text-white border-brand-green shadow-xs'
                                  : 'text-brand-brown/75 hover:bg-brand-cream/40 border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <TabIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-brand-brown/65'}`} />
                                <span>{tab.label}</span>
                              </div>
                              {tab.badge !== null && tab.badge > 0 && (
                                <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-amber-500 text-white' : 'bg-brand-green/15 text-brand-green'}`}>
                                  {tab.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Operational summary SCOREBOARD */}
                    <div className="p-4 rounded-2xl bg-brand-cream/40 border border-brand-green/10 font-mono text-[10px] text-brand-brown space-y-3">
                      <span className="font-bold tracking-wider text-brand-green text-[9px] uppercase block">Ringkasan Hari Ini</span>
                      <div className="space-y-1.5 font-sans leading-none">
                        <div className="flex justify-between items-center py-1.5 border-b border-brand-green/5">
                          <span className="text-brand-brown/70 text-xs">Pemasukan</span>
                          <span className="font-bold font-mono text-brand-green text-sm">Rp {totalCompletedEarnings.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-brand-green/5">
                          <span className="text-brand-brown/70 text-xs">Total Bill</span>
                          <span className="font-bold font-mono text-brand-brown text-sm">{orders.length}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-brand-brown/70 text-xs">Layanan Aktif</span>
                          <span className="font-bold font-mono text-amber-600 text-sm animate-pulse">{pendingOrdersCount} Meja</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right dynamic dashboard workspace area */}
                  <div className="flex-1 p-3 sm:p-5 md:p-6 overflow-y-auto bg-[#FCFBF9]">
                    
                    {/* VIEW TAB 1: LIVE ORDERS QUEUE */}
                    {adminTab === 'orders' && (
                      <div className="space-y-5">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-green/5 pb-4">
                          <div>
                            <h4 className="font-serif text-xl font-black text-brand-brown tracking-tight">Antrean Bill Kasir</h4>
                            <p className="text-xs text-brand-brown/60 mt-0.5">Saring dan proses pesanan yang diajukan pengunjung cafe secara langsung.</p>
                          </div>
                          
                          {/* Direct input and filters */}
                          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                            {/* Direct Input button */}
                            <button
                              id="btn-pos-input-direct-order"
                              onClick={() => {
                                setIsCashierOrderFormOpen(!isCashierOrderFormOpen);
                                setCashierCustName('');
                                setCashierCart([]);
                              }}
                              className="bg-brand-green hover:bg-brand-green-light text-[#FAF8F5] px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                            >
                              <Plus className="w-4 h-4" /> Direct Input Kasir
                            </button>

                            {/* Filter orders pills */}
                            <div className="flex bg-white rounded-xl p-1 border border-brand-green/10 font-mono text-[10px] font-bold shadow-xs">
                              {(['Belum Bayar', 'Sudah Bayar'] as const).map(f => (
                                <button
                                  id={`btn-admin-order-filter-${f.replace(' ', '')}`}
                                  key={f}
                                  onClick={() => setAdminOrderFilter(f)}
                                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                    adminOrderFilter === f
                                      ? 'bg-brand-brown text-white shadow-xs'
                                      : 'text-brand-brown/60 hover:bg-brand-cream/50 hover:text-brand-brown'
                                  }`}
                                >
                                  {f}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* DIRECT INPUT KASIR FORM */}
                        <AnimatePresence>
                          {isCashierOrderFormOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-white border border-brand-green/15 rounded-3xl p-5 md:p-6 shadow-sm space-y-4 font-sans">
                                <div className="flex justify-between items-center border-b border-brand-green/5 pb-3">
                                  <div>
                                    <h5 className="font-serif text-sm font-bold text-brand-brown">Form Input Pesanan Sendiri (Kasir)</h5>
                                    <p className="text-[11px] text-brand-brown/60 mt-0.5">Kasir dapat mengisi pesanan offline di sini untuk dimasukkan ke antrean.</p>
                                  </div>
                                  <button
                                    onClick={() => setIsCashierOrderFormOpen(false)}
                                    className="p-1.5 rounded-full hover:bg-brand-cream text-brand-brown/70 transition"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                <form onSubmit={handleCashierSubmitOrder} className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Customer Name */}
                                    <div>
                                      <label className="block text-[10px] font-mono font-bold text-brand-brown uppercase mb-1">Nama Pelanggan *</label>
                                      <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Budi, Meja 5, dsb."
                                        value={cashierCustName}
                                        onChange={(e) => setCashierCustName(e.target.value)}
                                        className="w-full bg-[#FAF8F5] border border-brand-green/15 focus:border-brand-brown/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                                      />
                                    </div>

                                    {/* Order Type (Table or Takeaway) */}
                                    <div>
                                      <label className="block text-[10px] font-mono font-bold text-brand-brown uppercase mb-1">Tipe Pesanan</label>
                                      <select
                                        value={cashierOrderType}
                                        onChange={(e) => setCashierOrderType(e.target.value as any)}
                                        className="w-full bg-[#FAF8F5] border border-brand-green/15 focus:border-brand-brown/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                                      >
                                        <option value="Table">Makan Di Sini (Dine-in)</option>
                                        <option value="Takeaway">Bungkus (Takeaway)</option>
                                      </select>
                                    </div>

                                    {/* Table number if Dine-in */}
                                    {cashierOrderType === 'Table' && (
                                      <div>
                                        <label className="block text-[10px] font-mono font-bold text-brand-brown uppercase mb-1">Nomor Meja</label>
                                        <select
                                          value={cashierTableNum}
                                          onChange={(e) => setCashierTableNum(e.target.value)}
                                          className="w-full bg-[#FAF8F5] border border-brand-green/15 focus:border-brand-brown/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                                        >
                                          {Array.from({ length: 5 }, (_, i) => (
                                            <option key={i + 1} value={(i + 1).toString()}>Meja {i + 1}</option>
                                          ))}
                                        </select>
                                      </div>
                                    )}

                                    {/* Payment Method Selector */}
                                    <div>
                                      <label className="block text-[10px] font-mono font-bold text-brand-brown uppercase mb-1">Metode Pembayaran</label>
                                      <select
                                        value={cashierPayMethod}
                                        onChange={(e) => setCashierPayMethod(e.target.value as any)}
                                        className="w-full bg-[#FAF8F5] border border-brand-green/15 focus:border-brand-brown/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                                      >
                                        <option value="Cash">Tunai (Cash)</option>
                                        <option value="QRIS">QRIS Dinamis</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* Menu Item Selector and Quantities */}
                                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 border-t border-brand-green/5 pt-4">
                                    {/* Available Menu Catalogue Selection (Left 7 Columns) */}
                                    <div className="lg:col-span-12 xl:col-span-7 bg-[#FCFBF9] p-4 rounded-2xl border border-brand-green/5 space-y-3">
                                      <div className="flex justify-between items-center gap-3">
                                        <span className="text-xs font-serif font-black text-brand-brown">Pilih Menu Café</span>
                                        <div className="relative max-w-xs w-full">
                                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-brown/40" />
                                          <input
                                            type="text"
                                            placeholder="Cari..."
                                            value={cashierSearchTerm}
                                            onChange={(e) => setCashierSearchTerm(e.target.value)}
                                            className="w-full bg-white border border-brand-green/15 rounded-lg pl-8 pr-3 py-1 text-[11px] font-semibold text-[#2B1E17] placeholder-brand-brown/40 focus:outline-none"
                                          />
                                        </div>
                                      </div>

                                      {/* Scrollable Small List of products for fast selection */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                                        {menuItems
                                          .filter(item => {
                                            return item.isAvailable && (
                                              item.name.toLowerCase().includes(cashierSearchTerm.toLowerCase()) ||
                                              item.category.toLowerCase().includes(cashierSearchTerm.toLowerCase())
                                            );
                                          })
                                          .map(item => {
                                            const existing = cashierCart.find(c => c.item.id === item.id);
                                            const quantity = existing ? existing.quantity : 0;
                                            return (
                                              <div
                                                key={item.id}
                                                className="bg-white p-2.5 rounded-xl border border-brand-green/5 flex items-center justify-between gap-2 shadow-3xs"
                                              >
                                                <div className="min-w-0 flex-1">
                                                  <p className="font-bold text-xs text-brand-brown truncate">{item.name}</p>
                                                  <p className="text-[10px] font-mono text-brand-green mt-0.5">Rp {item.price.toLocaleString('id-ID')}</p>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                  {quantity > 0 && (
                                                    <>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          setCashierCart(prev => {
                                                            const exists = prev.find(c => c.item.id === item.id);
                                                            if (!exists) return prev;
                                                            if (exists.quantity <= 1) {
                                                              return prev.filter(c => c.item.id !== item.id);
                                                            } else {
                                                              return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity - 1 } : c);
                                                            }
                                                          });
                                                        }}
                                                        className="w-5 h-5 bg-brand-cream hover:bg-brand-cream-dark/35 text-brand-brown rounded-full font-bold flex items-center justify-center text-[10px] select-none"
                                                      >
                                                        -
                                                      </button>
                                                      <span className="font-mono text-xs font-bold text-brand-brown min-w-[12px] text-center">{quantity}</span>
                                                    </>
                                                  )}
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setCashierCart(prev => {
                                                        const exists = prev.find(c => c.item.id === item.id);
                                                        if (exists) {
                                                          return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
                                                        } else {
                                                          return [...prev, { item, quantity: 1 }];
                                                        }
                                                      });
                                                    }}
                                                    className="w-5 h-5 bg-brand-green hover:bg-brand-green-light text-white rounded-full font-bold flex items-center justify-center text-[10px] select-none"
                                                  >
                                                    +
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                      </div>
                                    </div>

                                    {/* Cashier Direct Cart Summary (Right 5 Columns) */}
                                    <div className="lg:col-span-12 xl:col-span-5 bg-[#FCFBF9] p-4 rounded-2xl border border-brand-green/5 flex flex-col justify-between">
                                      <span className="text-xs font-serif font-black text-brand-brown block mb-3 border-b border-brand-green/5 pb-1">Pesanan Terpilih</span>
                                      
                                      <div className="space-y-2 flex-1 max-h-[160px] overflow-y-auto mb-4 pr-1">
                                        {cashierCart.length === 0 ? (
                                          <div className="text-center py-8 text-[11px] text-brand-brown/50">
                                            Belum ada menu yang dipilih.
                                          </div>
                                        ) : (
                                          cashierCart.map(c => (
                                            <div key={c.item.id} className="flex justify-between items-center font-sans text-xs">
                                              <span className="text-brand-brown truncate pr-1">
                                                <strong>{c.item.name}</strong> <span className="text-[10px] font-mono text-brand-brown/55">({c.quantity}x)</span>
                                              </span>
                                              <span className="font-mono font-bold text-brand-green">
                                                Rp {(c.item.price * c.quantity).toLocaleString('id-ID')}
                                              </span>
                                            </div>
                                          ))
                                        )}
                                      </div>

                                      <div className="border-t border-brand-green/5 pt-3">
                                        <div className="flex justify-between items-baseline mb-3">
                                          <span className="text-[10px] font-mono font-bold text-brand-brown uppercase">Total Pembayaran</span>
                                          <span className="font-serif text-base font-black text-[#2B1E17]">
                                            Rp {cashierCart.reduce((s, c) => s + (c.item.price * c.quantity), 0).toLocaleString('id-ID')}
                                          </span>
                                        </div>

                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setIsCashierOrderFormOpen(false);
                                              setCashierCart([]);
                                            }}
                                            className="flex-1 border border-brand-green/10 hover:bg-brand-cream/30 text-brand-brown font-bold py-2 rounded-xl text-xs uppercase cursor-pointer"
                                          >
                                            Batal
                                          </button>
                                          <button
                                            type="submit"
                                            className="flex-1 bg-[#2B1E17] hover:bg-[#4A533C] text-[#FFF9F2] font-semibold py-2 rounded-xl text-xs uppercase shadow-xs transition cursor-pointer"
                                          >
                                            Buat Bill
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </form>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Order grid cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {orders
                            .filter(o => {
                              if (adminOrderFilter === 'Belum Bayar') {
                                return o.status === 'Pending' || o.status === 'On Process';
                              } else {
                                return o.status === 'Completed';
                              }
                            })
                            .map((order) => {
                              const isCompleted = order.status === 'Completed';
                              const isCancelled = order.status === 'Cancelled';
                              const isOnProcess = order.status === 'On Process';
                              
                              return (
                                <div
                                  id={`admin-order-row-${order.id}`}
                                  key={order.id}
                                  className="bg-white p-5 rounded-2xl border border-brand-green/10 shadow-xs hover:border-brand-green/25 transition-all flex flex-col justify-between gap-4 font-sans text-xs"
                                >
                                  {/* Row header */}
                                  <div className="flex justify-between items-start gap-2 border-b border-brand-green/5 pb-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold px-2 py-0.5 bg-brand-cream rounded text-brand-brown text-[11px]">{order.id}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                          isCompleted ? 'bg-emerald-100 text-emerald-800' :
                                          isCancelled ? 'bg-rose-100 text-rose-800' :
                                          isOnProcess ? 'bg-cyan-100 text-cyan-800' : 'bg-amber-100 text-amber-850'
                                        }`}>
                                          {isCompleted ? 'Sudah Bayar' : isOnProcess ? 'Sedang Diseduh' : 'Belum Bayar'}
                                        </span>
                                      </div>
                                      <p className="text-xs text-brand-brown font-semibold mt-1">
                                        Atas Nama: <strong className="text-brand-brown underline decoration-brand-green/30 decoration-2">{order.customerName}</strong>
                                      </p>
                                      <p className="text-[10px] text-brand-brown/50 font-mono font-medium">
                                        {order.tableNumberOrType} • {order.paymentMethod}
                                      </p>
                                    </div>
                                    <span className="text-[9px] font-mono text-brand-brown/40 shrink-0">{order.timestamp}</span>
                                  </div>

                                  {/* Items inside that order */}
                                  <div className="space-y-2.5 bg-[#FDFDFD] p-3 rounded-xl border border-brand-green/5 flex-1 min-h-[60px]">
                                    {order.items.map((cartItem, idx) => (
                                      <div key={idx} className="flex justify-between items-start font-sans text-xs pb-2 border-b last:border-b-0 last:pb-0 border-brand-green/5">
                                        <div>
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-bold text-brand-brown">{cartItem.item.name}</span>
                                            <span className="font-mono text-[10px] bg-brand-green/10 text-brand-green px-1.5 py-0.5 rounded-lg font-bold">x{cartItem.quantity}</span>
                                          </div>
                                          
                                          {/* Options displays */}
                                          {((cartItem.temperature && cartItem.temperature !== 'Normal') || (cartItem.sugarLevel && cartItem.sugarLevel !== 'Normal') || cartItem.notes) && (
                                            <div className="flex flex-wrap gap-1.5 text-[9px] font-mono text-brand-brown/70 mt-1">
                                              {cartItem.temperature && cartItem.temperature !== 'Normal' && <span className="bg-brand-cream/80 px-1 rounded">Suasana: {cartItem.temperature}</span>}
                                              {cartItem.sugarLevel && cartItem.sugarLevel !== 'Normal' && <span className="bg-brand-cream/80 px-1 rounded">🍬: {cartItem.sugarLevel}</span>}
                                              {cartItem.notes && <span className="italic block font-bold text-amber-850">"{cartItem.notes}"</span>}
                                            </div>
                                          )}
                                        </div>

                                        <span className="font-mono text-xs font-bold text-brand-green shrink-0">
                                          Rp {(cartItem.item.price * cartItem.quantity).toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Pricing and Actions control footer */}
                                  <div className="pt-3 border-t border-brand-green/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div className="text-xs font-serif font-black text-brand-brown">
                                      Total Tagihan: <span className="text-brand-green font-mono text-base block sm:inline sm:ml-1 font-extrabold">Rp {order.totalAmount.toLocaleString('id-ID')}</span>
                                    </div>

                                    <div className="flex gap-1.5 flex-wrap justify-end w-full sm:w-auto">
                                      {order.status === 'Pending' && (
                                        <button
                                          id={`btn-pos-process-${order.id}`}
                                          onClick={() => handleUpdateOrderStatus(order.id, 'On Process')}
                                          className="bg-cyan-50 hover:bg-cyan-155 border border-cyan-200 text-cyan-850 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer"
                                        >
                                          ☕ Seduh
                                        </button>
                                      )}
                                      {(order.status === 'Pending' || order.status === 'On Process') && (
                                        <>
                                          <button
                                            id={`btn-pos-complete-${order.id}`}
                                            onClick={() => handleUpdateOrderStatus(order.id, 'Completed')}
                                            className="bg-brand-green hover:bg-brand-green-light text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                                          >
                                            <Check className="w-3.5 h-3.5" /> Selesai / Bayar
                                          </button>
                                          <button
                                            id={`btn-pos-cancel-${order.id}`}
                                            onClick={() => handleUpdateOrderStatus(order.id, 'Cancelled')}
                                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase cursor-pointer transition-all shrink-0"
                                          >
                                            Batal
                                          </button>
                                        </>
                                      )}
                                      <button
                                        id={`btn-pos-print-${order.id}`}
                                        onClick={() => {
                                          setActiveReceiptForPrinting(order);
                                          handlePrintReceipt(order);
                                        }}
                                        className="border border-brand-green/10 hover:bg-brand-cream text-brand-brown px-3 py-1.5 rounded-xl text-[10px] cursor-pointer flex items-center gap-1 transition-all shrink-0"
                                      >
                                        <Printer className="w-3.5 h-3.5 text-brand-green" />
                                        Print POS
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                          {orders.filter(o => {
                            if (adminOrderFilter === 'Belum Bayar') {
                              return o.status === 'Pending' || o.status === 'On Process';
                            } else {
                              return o.status === 'Completed';
                            }
                          }).length === 0 && (
                            <div className="lg:col-span-2 py-16 text-center text-brand-brown/50 bg-white rounded-3xl border border-dashed border-brand-green/20 font-sans">
                              Tidak ada antrean pesanan dalam saringan {adminOrderFilter}.
                            </div>
                          )}
                        </div>
                      </div>
                    )}


                    {/* VIEW TAB 2: INVENTORY / MENU AVAILABILITY AND ADD MANAGE */}
                    {adminTab === 'inventory' && (
                      <div className="space-y-5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-green/5 pb-4">
                          <div>
                            <h4 className="font-serif text-xl font-black text-brand-brown tracking-tight">Ketersediaan Stok Menu</h4>
                            <p className="text-xs text-brand-brown/60 mt-0.5">Toggle status sold-out item cafe atau tambahkan resep masakan anyar.</p>
                          </div>
                          
                          <button
                            id="btn-trigger-add-product"
                            onClick={() => setShowAddNewProductForm(!showAddNewProductForm)}
                            className="bg-brand-brown hover:bg-brand-brown-light text-brand-cream px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            {showAddNewProductForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {showAddNewProductForm ? "Tutup Form" : "Tambah Menu"}
                          </button>
                        </div>

                        {/* Interactive Create form inside Pos drawer */}
                        {showAddNewProductForm && (
                          <form id="add-menu-form" onSubmit={handleCreateProduct} className="bg-white p-5 rounded-3xl border border-brand-green/15 text-xs font-medium space-y-4 shadow-sm">
                            <span className="text-[10px] font-mono tracking-widest text-brand-green font-bold block uppercase border-b border-brand-green/5 pb-2">
                              Formulir Item Baru Cafe
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-brand-brown font-bold text-[10px] uppercase tracking-wider block">Nama Sajian Menu</label>
                                <input
                                  id="inp-newprod-name"
                                  type="text"
                                  placeholder="Misal: Honeycomb Affogato"
                                  value={newProdName}
                                  onChange={(e) => setNewProdName(e.target.value)}
                                  className="w-full px-3 py-2 border border-brand-green/15 rounded-xl text-xs focus:outline-none focus:border-brand-green"
                                  required
                                  autoFocus
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-brand-brown font-bold text-[10px] uppercase tracking-wider block">Kategori Menu</label>
                                <select
                                  id="sel-newprod-category"
                                  value={newProdCategory}
                                  onChange={(e) => setNewProdCategory(e.target.value as any)}
                                  className="w-full px-3 py-2 border border-brand-green/15 rounded-xl bg-white text-xs focus:outline-none focus:border-brand-green"
                                >
                                  <option value="coffee">Kopi / Coffee</option>
                                  <option value="non-coffee">Bukan Kopi / Non-Coffee</option>
                                  <option value="dessert">Pencuci Mulut / Dessert</option>
                                  <option value="food">Makanan / Food</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-brand-brown font-bold text-[10px] uppercase tracking-wider block">Harga Jual (Rupiah)</label>
                                <input
                                  id="inp-newprod-price"
                                  type="number"
                                  placeholder="28000"
                                  value={newProdPrice}
                                  onChange={(e) => setNewProdPrice(parseInt(e.target.value))}
                                  className="w-full px-3 py-2 border border-brand-green/15 rounded-xl text-xs font-mono focus:outline-none focus:border-brand-green"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-brand-brown font-bold text-[10px] uppercase tracking-wider block">Tagging Label (Dipisah koma)</label>
                                <input
                                  id="inp-newprod-tags"
                                  type="text"
                                  placeholder="Espresso, Manis, Dingin"
                                  value={newProdTags}
                                  onChange={(e) => setNewProdTags(e.target.value)}
                                  className="w-full px-3 py-2 border border-brand-green/15 rounded-xl text-xs focus:outline-none focus:border-brand-green"
                                />
                              </div>

                              <div className="sm:col-span-2 space-y-1">
                                <label className="text-brand-brown font-bold text-[10px] uppercase tracking-wider block">Link URL Gambar Menu</label>
                                <input
                                  id="inp-newprod-imageurl"
                                  type="text"
                                  placeholder="https://images.unsplash.com/photo-..."
                                  value={newProdImageUrl}
                                  onChange={(e) => setNewProdImageUrl(e.target.value)}
                                  className="w-full px-3 py-2 border border-brand-green/15 rounded-xl text-xs font-mono text-brand-green focus:outline-none focus:border-brand-green"
                                />
                              </div>

                              <div className="sm:col-span-2 space-y-1">
                                <label className="text-brand-brown font-bold text-[10px] uppercase tracking-wider block">Deskripsi Sajian</label>
                                <textarea
                                  id="inp-newprod-desc"
                                  rows={2}
                                  placeholder="Deskripsi singkat sensasi rasa masakan atau bahan utamanya..."
                                  value={newProdDesc}
                                  onChange={(e) => setNewProdDesc(e.target.value)}
                                  className="w-full px-3 py-2 border border-brand-green/15 rounded-xl text-xs focus:outline-none focus:border-brand-green"
                                  required
                                />
                              </div>

                              <div className="sm:col-span-2 flex items-center gap-3 p-3.5 bg-brand-cream/15 rounded-2xl border border-brand-green/10">
                                <input
                                  id="inp-newprod-isbest"
                                  type="checkbox"
                                  checked={newProdIsBest}
                                  onChange={(e) => setNewProdIsBest(e.target.checked)}
                                  className="w-4 h-4 rounded text-brand-green focus:ring-brand-green border-brand-green/20 cursor-pointer"
                                />
                                <div>
                                  <label htmlFor="inp-newprod-isbest" className="text-brand-brown font-bold text-[11px] uppercase tracking-wider block cursor-pointer select-none">
                                    Tampilkan di "Sajian Utama / Menu Best" Halaman Utama
                                  </label>
                                  <span className="text-[10px] text-brand-brown/60 block leading-tight mt-0.5">
                                    Aktifkan agar menu sajian ini terdaftar dalam jajaran menu terbaik/rekomendasi di halaman depan utama pelanggan.
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              id="btn-newprod-submit"
                              type="submit"
                              className="bg-brand-green hover:bg-brand-green-light text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all shadow-xs cursor-pointer inline-block"
                            >
                              Publikasikan ke Menu Tamu ✓
                            </button>
                          </form>
                        )}

                        {/* Interactive Edit form inside Pos drawer */}
                        {editingItemId && (
                          <form id="edit-menu-form" onSubmit={handleSaveEditProduct} className="bg-amber-50/70 p-5 rounded-3xl border border-amber-500/30 text-xs font-medium space-y-4 shadow-xs">
                            <div className="flex justify-between items-center border-b border-amber-500/10 pb-2">
                              <span className="text-[10px] font-mono tracking-widest text-amber-700 font-bold block uppercase">
                                Edit Item Menu: ID {editingItemId}
                              </span>
                              <button
                                type="button"
                                onClick={() => setEditingItemId(null)}
                                className="text-amber-800 hover:text-amber-950 font-bold text-xs"
                              >
                                Batal
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-brand-brown font-bold text-[10px] uppercase tracking-wider block">Nama Sajian Menu</label>
                                <input
                                  id="inp-editprod-name"
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full px-3 py-2 border border-brand-green/15 rounded-xl text-xs bg-white focus:outline-none focus:border-brand-green"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-brand-brown font-bold text-[10px] uppercase tracking-wider block">Kategori Menu</label>
                                <select
                                  id="sel-editprod-category"
                                  value={editCategory}
                                  onChange={(e) => setEditCategory(e.target.value as any)}
                                  className="w-full px-3 py-2 border border-brand-green/15 rounded-xl bg-white text-xs focus:outline-none focus:border-brand-green"
                                >
                                  <option value="coffee">Kopi / Coffee</option>
                                  <option value="non-coffee">Bukan Kopi / Non-Coffee</option>
                                  <option value="dessert">Pencuci Mulut / Dessert</option>
                                  <option value="food">Makanan / Food</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-brand-brown font-bold text-[10px] uppercase tracking-wider block">Harga Jual (Rupiah)</label>
                                <input
                                  id="inp-editprod-price"
                                  type="number"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(parseInt(e.target.value))}
                                  className="w-full px-3 py-2 border border-brand-green/15 rounded-xl text-xs font-mono bg-white focus:outline-none focus:border-brand-green"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-brand-brown font-bold text-[10px] uppercase tracking-wider block">Tagging Label (Dipisah koma)</label>
                                <input
                                  id="inp-editprod-tags"
                                  type="text"
                                  value={editTags}
                                  onChange={(e) => setEditTags(e.target.value)}
                                  className="w-full px-3 py-2 border border-brand-green/15 rounded-xl text-xs bg-white focus:outline-none focus:border-brand-green"
                                />
                              </div>

                              <div className="sm:col-span-2 space-y-1">
                                <label className="text-brand-brown font-bold text-[10px] uppercase tracking-wider block">Link URL Gambar Menu (Bisa diedit sesuka hati)</label>
                                <input
                                  id="inp-editprod-imageurl"
                                  type="text"
                                  placeholder="https://images.unsplash.com/photo-..."
                                  value={editImageUrl}
                                  onChange={(e) => setEditImageUrl(e.target.value)}
                                  className="w-full px-3 py-2 border border-amber-300 rounded-xl text-xs font-mono text-brand-green bg-white focus:outline-none focus:border-brand-green"
                                />
                              </div>

                              <div className="sm:col-span-2 space-y-1">
                                <label className="text-brand-brown font-bold text-[10px] uppercase tracking-wider block">Deskripsi Sajian</label>
                                <textarea
                                  id="inp-editprod-desc"
                                  rows={2}
                                  value={editDesc}
                                  onChange={(e) => setEditDesc(e.target.value)}
                                  className="w-full px-3 py-2 border border-brand-green/15 rounded-xl text-xs bg-white focus:outline-none focus:border-brand-green"
                                  required
                                />
                              </div>

                              <div className="sm:col-span-2 flex items-center gap-3 p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                                <input
                                  id="inp-editprod-isbest"
                                  type="checkbox"
                                  checked={editIsBest}
                                  onChange={(e) => setEditIsBest(e.target.checked)}
                                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-500/30 cursor-pointer"
                                />
                                <div>
                                  <label htmlFor="inp-editprod-isbest" className="text-brand-brown font-bold text-[11px] uppercase tracking-wider block cursor-pointer select-none">
                                    Tampilkan di "Sajian Utama / Menu Best" Halaman Utama
                                  </label>
                                  <span className="text-[10px] text-brand-brown/60 block leading-tight mt-0.5">
                                    Aktifkan agar menu sajian ini terdaftar dalam jajaran menu terbaik/rekomendasi di halaman depan utama pelanggan.
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                id="btn-editprod-submit"
                                type="submit"
                                className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all shadow-xs"
                              >
                                Simpan Perubahan Menu ✓
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingItemId(null)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all font-mono"
                              >
                                Tutup
                              </button>
                            </div>
                          </form>
                        )}

                        {/* List / Table of current menu items inside desk */}
                        <div className="hidden md:block bg-white rounded-2xl border border-brand-green/10 overflow-hidden shadow-xs">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs min-w-[700px]">
                              <thead className="bg-brand-cream text-brand-green font-mono uppercase text-[10px] tracking-wide border-b border-brand-green/10">
                                <tr>
                                  <th className="p-4">Menu Sajian</th>
                                  <th className="p-4">Kategori</th>
                                  <th className="p-4">Harga Satuan</th>
                                  <th className="p-4">Menu Best (Landing)</th>
                                  <th className="p-4">Kondisi Stok</th>
                                  <th className="p-4 text-right">Tindakan</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-brand-green/5">
                                {menuItems.map((item) => (
                                  <tr key={item.id} className="hover:bg-brand-cream-light/40 transition-colors">
                                    <td className="p-4 flex items-center gap-3">
                                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-brand-cream border border-brand-green/10">
                                        <img
                                          src={item.imageUrl || (
                                            item.category === 'coffee' ? "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=200" :
                                            item.category === 'non-coffee' ? "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=200" :
                                            item.category === 'food' ? "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=200" :
                                            "https://images.unsplash.com/photo-1508737027454-e6454ef45afd?auto=format&fit=crop&q=80&w=200"
                                          )}
                                          alt={item.name}
                                          className="w-full h-full object-cover"
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                      <div>
                                        <span className="font-serif font-black text-sm block text-brand-brown">{item.name}</span>
                                        <span className="text-[10px] text-brand-brown/50 block font-mono mt-0.5">{item.tags.join(', ')}</span>
                                      </div>
                                    </td>
                                    <td className="p-4 pt-6">
                                      <span className="px-2 py-0.5 bg-brand-green/10 text-brand-green rounded-full font-mono font-bold uppercase text-[9px]">
                                        {item.category}
                                      </span>
                                    </td>
                                    <td className="p-4 font-mono font-bold text-brand-brown">
                                      Rp {item.price.toLocaleString('id-ID')}
                                    </td>
                                    <td className="p-4">
                                      <button
                                        id={`btn-pos-toggle-best-${item.id}`}
                                        onClick={() => {
                                          updateDoc(doc(db, "menu", item.id), { isBest: !item.isBest });
                                          displayToast(`Status Best Seller untuk ${item.name} berhasil diperbarui!`);
                                        }}
                                        className={`px-3 py-1.5 rounded-full font-mono text-[10px] tracking-tight font-bold cursor-pointer transition-all border ${
                                          item.isBest
                                            ? 'bg-amber-50 text-amber-850 border-amber-300 hover:bg-amber-100'
                                            : 'bg-stone-50 text-stone-400 border-stone-200 hover:bg-stone-100'
                                        }`}
                                      >
                                        {item.isBest ? '★ Ya' : '☆ Tidak'}
                                      </button>
                                    </td>
                                    <td className="p-4">
                                      <button
                                        id={`btn-pos-toggle-stock-${item.id}`}
                                        onClick={() => handleToggleProductStock(item.id)}
                                        className={`px-3 py-1.5 rounded-full font-mono text-[10px] tracking-tight font-bold cursor-pointer transition-all border ${
                                          item.isAvailable
                                            ? 'bg-emerald-50 text-emerald-850 border-emerald-250 hover:bg-emerald-100'
                                            : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                                        }`}
                                      >
                                        {item.isAvailable ? '● Ready / Ada' : '○ Sold Out / Kosong'}
                                      </button>
                                    </td>
                                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                      <button
                                        id={`btn-pos-edit-product-${item.id}`}
                                        onClick={() => handleStartEditProduct(item)}
                                        className="text-amber-600 hover:text-amber-850 font-mono text-[10px] font-bold p-1 cursor-pointer hover:underline"
                                      >
                                        Edit / Gambar
                                      </button>
                                      <button
                                        id={`btn-pos-delete-product-${item.id}`}
                                        onClick={() => handleDeleteProduct(item.id)}
                                        className="text-red-650 hover:text-red-850 font-mono text-[10px] font-bold p-1 cursor-pointer hover:underline"
                                      >
                                        Hapus
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Mobile view cards - visible only on small screens */}
                        <div className="block md:hidden space-y-3">
                          {menuItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl border border-brand-green/10 p-4 shadow-3xs flex flex-col gap-3">
                              <div className="flex items-start gap-3">
                                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-brand-cream border border-brand-green/10">
                                  <img
                                    src={item.imageUrl || (
                                      item.category === 'coffee' ? "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=200" :
                                      item.category === 'non-coffee' ? "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=200" :
                                      item.category === 'food' ? "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=200" :
                                      "https://images.unsplash.com/photo-1508737027454-e6454ef45afd?auto=format&fit=crop&q=80&w=200"
                                    )}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-1.5">
                                    <span className="font-serif font-black text-sm block text-brand-brown truncate">{item.name}</span>
                                    <span className="px-1.5 py-0.5 bg-brand-green/10 text-brand-green rounded-full font-mono font-bold uppercase text-[8px] shrink-0">
                                      {item.category}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-brand-brown/50 block font-mono mt-0.5 max-w-full truncate">{item.tags.join(', ')}</span>
                                  <div className="mt-1 font-mono font-black text-xs text-brand-brown">
                                    Rp {item.price.toLocaleString('id-ID')}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-t border-brand-green/5 pt-2.5 gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <button
                                    id={`btn-pos-toggle-stock-mob-${item.id}`}
                                    onClick={() => handleToggleProductStock(item.id)}
                                    className={`px-3 py-1.5 rounded-full font-mono text-[9px] tracking-tight font-bold cursor-pointer transition-all border shrink-0 ${
                                      item.isAvailable
                                        ? 'bg-emerald-50 text-emerald-850 border-emerald-250 hover:bg-emerald-100'
                                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                                    }`}
                                  >
                                    {item.isAvailable ? '● Ready' : '○ Sold Out'}
                                  </button>
                                  
                                  <button
                                    id={`btn-pos-toggle-best-mob-${item.id}`}
                                    onClick={() => {
                                      updateDoc(doc(db, "menu", item.id), { isBest: !item.isBest });
                                      displayToast(`Status Best Seller untuk ${item.name} berhasil diperbarui!`);
                                    }}
                                    className={`px-3 py-1.5 rounded-full font-mono text-[9px] tracking-tight font-bold cursor-pointer transition-all border shrink-0 ${
                                      item.isBest
                                        ? 'bg-amber-50 text-amber-850 border-amber-250 hover:bg-amber-100'
                                        : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                                    }`}
                                  >
                                    {item.isBest ? '★ Best' : '☆ Reguler'}
                                  </button>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <button
                                    id={`btn-pos-edit-product-mob-${item.id}`}
                                    onClick={() => handleStartEditProduct(item)}
                                    className="text-amber-600 hover:text-amber-850 font-mono text-[9px] font-bold px-2 py-1 bg-amber-50 rounded-lg cursor-pointer transition hover:bg-amber-100"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    id={`btn-pos-delete-product-mob-${item.id}`}
                                    onClick={() => handleDeleteProduct(item.id)}
                                    className="text-red-650 hover:text-red-850 font-mono text-[9px] font-bold px-2 py-1 bg-red-50 rounded-lg cursor-pointer transition hover:bg-red-100"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}


                    {/* VIEW TAB 3: REPLY TO FEEDBACK LOGS */}
                    {adminTab === 'feedbacks' && (
                      <div className="space-y-5">
                        <div className="border-b border-brand-green/5 pb-4">
                          <h4 className="font-serif text-xl font-black text-brand-brown tracking-tight">Komentar & Ulasan Tamu</h4>
                          <p className="text-xs text-brand-brown/60 mt-0.5">Pantau ulasan dari para pengunjung cafe dan berikan tanggapan resmi barista.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {reviews.map((rev) => (
                            <div key={rev.id} className="bg-white p-5 rounded-2xl border border-brand-green/10 shadow-xs space-y-3 text-xs hover:border-brand-green/20 transition-all">
                              <div className="flex justify-between items-start flex-wrap gap-2">
                                <div>
                                  <h5 className="font-serif font-black text-sm text-brand-brown">{rev.name}</h5>
                                  <span className="text-[10px] font-mono text-brand-brown/50 block mt-0.5">{rev.date}</span>
                                </div>
                                <div className="flex gap-0.5 bg-amber-500/10 px-2 py-1 rounded-lg">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-200'}`} />
                                  ))}
                                </div>
                              </div>

                              <p className="bg-brand-cream/20 p-3.5 rounded-xl text-brand-brown/85 font-sans italic leading-relaxed border border-brand-green/5">
                                "{rev.comment}"
                              </p>

                              {/* Action reply */}
                              {targetFeedbackId === rev.id ? (
                                <div className="space-y-3.5 mt-3 bg-brand-cream-light p-4 rounded-xl border border-brand-green/10 animate-fade-in">
                                  <span className="text-[10px] font-mono uppercase font-bold text-brand-green block">Tulis Balasan Barista:</span>
                                  <textarea
                                    id={`inp-reply-text-${rev.id}`}
                                    rows={3}
                                    placeholder="Tulis ucapan terima kasih atau konfirmasi perbaikan layanan Anda..."
                                    value={feedbackReplyText}
                                    onChange={(e) => setFeedbackReplyText(e.target.value)}
                                    className="w-full p-3 bg-white border border-brand-green/15 rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-green"
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      id={`btn-cancel-reply-${rev.id}`}
                                      onClick={() => { setTargetFeedbackId(null); setFeedbackReplyText(''); }}
                                      className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-[10px] font-bold uppercase cursor-pointer"
                                    >
                                      Batal
                                    </button>
                                    <button
                                      id={`btn-submit-reply-${rev.id}`}
                                      onClick={() => handlePostReply(rev.id)}
                                      className="px-4 py-2 bg-brand-green hover:bg-brand-green-light text-white rounded-xl text-[10px] font-bold uppercase shadow-xs cursor-pointer"
                                    >
                                      Kirim Balasan
                                    </button>
                                  </div>
                                </div>
                              ) : rev.reply ? (
                                <div className="bg-[#FAF8F5] p-4 rounded-xl border-l-4 border-brand-green space-y-1 bg-brand-cream/10 border border-brand-green/5">
                                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-green block">Tanggapan Toko:</span>
                                  <p className="text-brand-brown italic font-medium">"{rev.reply}"</p>
                                </div>
                              ) : (
                                <div className="flex justify-end pt-1">
                                  <button
                                    id={`btn-pos-show-replybox-${rev.id}`}
                                    onClick={() => { setTargetFeedbackId(rev.id); setFeedbackReplyText(''); }}
                                    className="bg-brand-brown hover:bg-brand-brown-light text-white px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                                  >
                                    <MessageSquareReply className="w-3.5 h-3.5" />
                                    Balas Ulasan
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* VIEW TAB 4: RIWAYAT PESANAN */}
                    {adminTab === 'history' && (
                      <div className="space-y-5 animate-fade-in text-brand-brown">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-green/5 pb-4">
                          <div>
                            <h4 className="font-serif text-xl font-black text-brand-brown tracking-tight">Riwayat Transaksi & Struk</h4>
                            <p className="text-xs text-brand-brown/60 mt-0.5">Semua data pesanan masuk, log pembayaran sukses, dan struk kasir yang dibatalkan.</p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2.5">
                            {/* Export button */}
                            <button
                              id="btn-pos-export-summary"
                              onClick={() => handleExportReportCSV(getFilteredOrders())}
                              className="bg-brand-brown hover:bg-brand-brown-light text-brand-cream px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                            >
                              <Printer className="w-4 h-4" /> Ekspor Laporan
                            </button>

                            {/* Reset state controls trigger */}
                            <button
                              id="btn-pos-reset-panel-toggle"
                              onClick={() => setIsResetPanelOpen(!isResetPanelOpen)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                            >
                              <Trash2 className="w-4 h-4 text-rose-650" />
                              {isResetPanelOpen ? 'Tutup Atur & Reset' : 'Reset Omset / Riwayat'}
                            </button>
                          </div>
                        </div>

                        {/* RESET MANAGEMENT PANEL */}
                        <AnimatePresence>
                          {isResetPanelOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-rose-50/45 border border-dashed border-rose-200 rounded-3xl p-5 md:p-6 space-y-4">
                                <div className="flex gap-2.5 items-start">
                                  <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                                    <BadgeAlert className="w-5 h-5 animate-pulse" />
                                  </div>
                                  <div>
                                    <h5 className="font-serif text-sm font-bold text-brand-brown">Pusat Otoritas & Reset Data Kasir</h5>
                                    <p className="text-xs text-brand-brown/70 mt-0.5">
                                      Gunakan tombol di bawah ini untuk mereset nominal omset saat pergantian shift atau membersihkan database antrean yang sudah lampau. Tindakan ini permanen.
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Reset Omset Card */}
                                  <div className="bg-white p-4.5 rounded-2xl border border-rose-100 shadow-2xs space-y-3 flex flex-col justify-between">
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-mono font-bold text-red-750 bg-red-50 px-2 py-0.5 rounded inline-block uppercase">Reset Omset Harian</span>
                                      <p className="text-xs text-brand-brown font-semibold pt-1">Kosongkan Pendapatan Sukses</p>
                                      <p className="text-[10.5px] text-brand-brown/65 leading-relaxed">
                                        Menghapus semua bill yang berstatus <span className="font-bold text-emerald-700">Completed</span> dari database riwayat. Ini otomatis mengembalikan angka nominal Omzet Sukses menjadi <span className="font-bold">Rp 0</span>.
                                      </p>
                                    </div>
                                    <button
                                      id="btn-admin-reset-earnings-only"
                                      onClick={() => {
                                        const completedOrders = orders.filter(o => o.status === 'Completed');
                                        if (completedOrders.length === 0) {
                                          displayToast("Tidak ada transaksi berstatus 'Completed' untuk direset.");
                                          return;
                                        }
                                        askConfirmation(
                                          "Reset Omset Harian",
                                          "Apakah Anda yakin ingin mereset omset dengan menghapus semua transaksi yang sudah sukses ('Completed')?",
                                          async () => {
                                            for (const o of completedOrders) {
                                              await deleteDoc(doc(db, "orders", o.id));
                                            }
                                            displayToast(`Sistem berhasil mengosongkan ${completedOrders.length} bill sukses. Omset kembali Rp 0.`);
                                          },
                                          true,
                                          "Ya, Reset Omset",
                                          "Batal"
                                        );
                                      }}
                                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer shadow-3xs focus:outline-none"
                                    >
                                      Reset Omset (Hapus Completed)
                                    </button>
                                  </div>

                                  {/* Clear All History Card */}
                                  <div className="bg-white p-4.5 rounded-2xl border border-rose-100 shadow-2xs space-y-3 flex flex-col justify-between">
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-mono font-bold text-brand-brown bg-brand-cream-light px-2 py-0.5 rounded inline-block uppercase">Clear All Bills</span>
                                      <p className="text-xs text-brand-brown font-semibold pt-1">Bersihkan Seluruh Riwayat</p>
                                      <p className="text-[10.5px] text-brand-brown/65 leading-relaxed">
                                        Menghapus <strong className="text-red-705">SEMUA</strong> records riwayat bill tanpa pandang status (Pending, Selesai, Proses, Batal). Membersihkan memori cache agar enteng.
                                      </p>
                                    </div>
                                    <button
                                      id="btn-admin-clear-all-orders"
                                      onClick={() => {
                                        if (orders.length === 0) {
                                          displayToast("Database riwayat memang sudah kosong.");
                                          return;
                                        }
                                        askConfirmation(
                                          "Peringatan Penghapusan Riwayat",
                                          "PERINGATAN! Anda akan menghapus SELURUH riwayat pesanan (Semua Bill) dari sistem secara permanen. Penggantian ini tidak dapat dikembalikan. Apakah Anda yakin?",
                                          async () => {
                                            for (const o of orders) {
                                              await deleteDoc(doc(db, "orders", o.id));
                                            }
                                            displayToast("Seluruh database riwayat pesanan dikosongkan.");
                                          },
                                          true,
                                          "Ya, Hapus Semua",
                                          "Batal"
                                        );
                                      }}
                                      className="w-full bg-[#2B1E17] hover:bg-[#1C120D] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer shadow-3xs focus:outline-none"
                                    >
                                      Hapus Seluruh Riwayat Pesanan
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Top Overview Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-white p-4.5 rounded-2xl border border-brand-green/10 shadow-xs">
                            <span className="text-[10px] font-mono tracking-wider text-brand-brown/50 block font-bold uppercase">Total Omzet Sukses</span>
                            <span className="text-lg font-bold font-mono text-brand-green mt-1 block">
                              Rp {orders.filter(o => o.status === 'Completed').reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="bg-white p-4.5 rounded-2xl border border-brand-green/10 shadow-xs">
                            <span className="text-[10px] font-mono tracking-wider text-brand-brown/50 block font-bold uppercase">Pesanan Berhasil</span>
                            <span className="text-lg font-bold font-mono text-brand-brown mt-1 block">
                              {orders.filter(o => o.status === 'Completed').length} Bill
                            </span>
                          </div>
                          <div className="bg-white p-4.5 rounded-2xl border border-brand-green/10 shadow-xs">
                            <span className="text-[10px] font-mono tracking-wider text-brand-brown/50 block font-bold uppercase">Pesanan Dibatalkan</span>
                            <span className="text-lg font-bold font-mono text-rose-650 mt-1 block">
                              {orders.filter(o => o.status === 'Cancelled').length} Bill
                            </span>
                          </div>
                          <div className="bg-white p-4.5 rounded-2xl border border-brand-green/10 shadow-xs">
                            <span className="text-[10px] font-mono tracking-wider text-brand-brown/50 block font-bold uppercase">Metode Terfavorit</span>
                            <span className="text-xs font-bold text-brand-brown mt-1.5 block">
                              {(() => {
                                const counts: Record<string, number> = {};
                                orders.filter(o => o.status === 'Completed').forEach(o => {
                                  counts[o.paymentMethod] = (counts[o.paymentMethod] || 0) + 1;
                                });
                                let fav = 'N/A';
                                let max = 0;
                                Object.entries(counts).forEach(([k, v]) => {
                                  if (v > max) { max = v; fav = k; }
                                });
                                return `${fav === 'Bank Transfer' ? '🏦 Bank Transfer' : fav === 'QRIS' ? '📱 QRIS' : fav === 'Cash' ? '💵 Tunai' : fav === 'Card' ? '💳 Kartu' : 'Belum Ada'}`;
                              })()}
                            </span>
                          </div>
                        </div>

                        {/* Daily Revenue Trend Chart */}
                        {(() => {
                          const currentYearNum = new Date().getFullYear();
                          const currentMonthNum = new Date().getMonth(); // 5 is June
                          const activeChartMonthIdx = historyDateMonth !== 'All' ? parseInt(historyDateMonth, 10) : currentMonthNum;
                          const activeChartYearNum = historyDateYear !== 'All' ? parseInt(historyDateYear, 10) : currentYearNum;
                          
                          const numDays = new Date(activeChartYearNum, activeChartMonthIdx + 1, 0).getDate();
                          const dayData = Array.from({ length: numDays }, (_, i) => {
                            const day = i + 1;
                            return {
                              day,
                              formattedDay: `${day} ${INDONESIAN_SHORT_MONTHS[activeChartMonthIdx]}`,
                              revenue: 0,
                              orderCount: 0,
                            };
                          });

                          let totalMonthlyRevenue = 0;
                          orders.forEach(o => {
                            if (o.status !== 'Completed') return;
                            const d = parseOrderDate(o.timestamp);
                            if (d.getMonth() === activeChartMonthIdx && d.getFullYear() === activeChartYearNum) {
                              const dayVal = d.getDate();
                              if (dayVal >= 1 && dayVal <= numDays) {
                                dayData[dayVal - 1].revenue += o.totalAmount;
                                dayData[dayVal - 1].orderCount += 1;
                                totalMonthlyRevenue += o.totalAmount;
                              }
                            }
                          });

                          // Custom format for Y-Axis labels
                          const formatYAxis = (value: number) => {
                            if (value >= 1000000) {
                              return `Rp ${(value / 1000000).toFixed(1)}jt`;
                            } else if (value >= 1000) {
                              return `Rp ${(value / 1000).toFixed(0)}rb`;
                            }
                            return `Rp ${value}`;
                          };

                          return (
                            <div className="bg-white p-5 rounded-3xl border border-brand-green/10 shadow-sm space-y-4">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-brand-green-light animate-ping" />
                                    <h5 className="font-serif text-lg font-black text-brand-brown tracking-tight">Tren Pendapatan Harian</h5>
                                  </div>
                                  <p className="text-xs text-brand-brown/60">
                                    Menampilkan performa harian untuk bulan <span className="font-bold text-brand-green">{INDONESIAN_MONTHS[activeChartMonthIdx]} {activeChartYearNum}</span>.
                                  </p>
                                </div>
                                <div className="bg-brand-cream/40 border border-brand-green/5 px-4 py-2 rounded-2xl text-right">
                                  <span className="text-[9px] font-mono font-bold uppercase text-brand-brown/50 block">Total Pendapatan Bulan Ini</span>
                                  <span className="text-sm font-bold font-mono text-brand-green">
                                    Rp {totalMonthlyRevenue.toLocaleString('id-ID')}
                                  </span>
                                </div>
                              </div>

                              <div className="h-72 w-full pt-1">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart
                                    data={dayData}
                                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                  >
                                    <defs>
                                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4a533c" stopOpacity={0.25}/>
                                        <stop offset="95%" stopColor="#4a533c" stopOpacity={0.0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE7DF" />
                                    <XAxis 
                                      dataKey="day" 
                                      tickLine={false}
                                      axisLine={false}
                                      stroke="#2B1E17"
                                      fontSize={10}
                                      dy={10}
                                    />
                                    <YAxis 
                                      tickFormatter={formatYAxis}
                                      tickLine={false}
                                      axisLine={false}
                                      stroke="#2B1E17"
                                      fontSize={10}
                                      width={65}
                                    />
                                    <RechartsTooltip 
                                      content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                          const pData = payload[0].payload;
                                          return (
                                            <div className="bg-[#2B1E17] border border-brand-green/25 p-3 rounded-2xl shadow-xl text-[#FAF6F0] text-xs font-sans">
                                              <p className="font-mono font-black text-[#A48E74] mb-1 uppercase text-[9px] tracking-widest">{pData.formattedDay} {activeChartYearNum}</p>
                                              <p className="font-bold mt-0.5">
                                                Omzet: <span className="font-mono text-emerald-400 font-extrabold">Rp {payload[0].value.toLocaleString('id-ID')}</span>
                                              </p>
                                              <p className="text-[10px] text-[#FAF6F0]/70 mt-0.5">
                                                Transaksi: <span className="font-mono text-[#FAF6F0] font-bold">{pData.orderCount} bill</span>
                                              </p>
                                            </div>
                                          );
                                        }
                                        return null;
                                      }}
                                    />
                                    <Area 
                                      type="monotone" 
                                      dataKey="revenue" 
                                      stroke="#4A533C" 
                                      strokeWidth={2.5}
                                      fillOpacity={1} 
                                      fill="url(#colorRevenue)" 
                                      activeDot={{ r: 6, strokeWidth: 1, stroke: '#FAF6F0', fill: '#4A533C' }}
                                    />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Interactive search and filter */}
                        <div className="bg-white p-5 rounded-3xl border border-brand-green/10 space-y-4 shadow-sm">
                          <div className="flex items-center gap-2 text-brand-green">
                            <Filter className="w-4 h-4 text-brand-green" />
                            <span className="text-[10px] font-mono font-black tracking-widest uppercase">Alat Pencarian Riwayat POS & Filter Waktu</span>
                          </div>
                          
                          <div className="flex flex-col gap-3">
                            {/* Baris Pencarian Teks */}
                            <div className="relative">
                              <Search className="w-4 h-4 text-brand-brown/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                id="inp-history-search"
                                type="text"
                                placeholder="Cari nama tamu, ID pesanan, atau menu pesanan..."
                                value={historySearchQuery}
                                onChange={(e) => setHistorySearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-brand-green/10 rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-green"
                              />
                            </div>

                            {/* Baris Filter Umum (Status, Pembayaran, Reset) */}
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex flex-wrap gap-2">
                                {/* Filter status */}
                                <select
                                  id="sel-history-state"
                                  value={historyStatusFilter}
                                  onChange={(e) => setHistoryStatusFilter(e.target.value as any)}
                                  className="px-3 py-2 bg-[#FAF9F6] border border-brand-green/10 rounded-xl text-xs text-brand-brown font-semibold focus:outline-none focus:border-brand-green cursor-pointer"
                                >
                                  <option value="All">Semua Status</option>
                                  <option value="Completed">Completed (Selesai)</option>
                                  <option value="Cancelled">Cancelled (Batal)</option>
                                  <option value="Pending">Pending (Baru)</option>
                                  <option value="On Process">Sedang Diseduh</option>
                                </select>

                                {/* Filter payment method */}
                                <select
                                  id="sel-history-payment"
                                  value={historyPaymentFilter}
                                  onChange={(e) => setHistoryPaymentFilter(e.target.value as any)}
                                  className="px-3 py-2 bg-[#FAF9F6] border border-brand-green/10 rounded-xl text-xs text-brand-brown font-semibold focus:outline-none focus:border-brand-green cursor-pointer"
                                >
                                  <option value="All">Semua Pembayaran</option>
                                  <option value="QRIS">📱 QRIS</option>
                                  <option value="Cash">💵 Tunai (Cash)</option>
                                  <option value="Card">💳 Debit / Gesek</option>
                                  <option value="Bank Transfer">🏦 Bank Transfer</option>
                                </select>
                              </div>

                              {/* Reset Filter Button */}
                              {(historySearchQuery || historyStatusFilter !== 'All' || historyPaymentFilter !== 'All' || historyDateDay !== 'All' || historyDateMonth !== 'All' || historyDateYear !== 'All' || historyCustomDate !== '') && (
                                <button
                                  id="btn-history-clear-filters"
                                  onClick={() => {
                                    setHistorySearchQuery('');
                                    setHistoryStatusFilter('All');
                                    setHistoryPaymentFilter('All');
                                    setHistoryDateDay('All');
                                    setHistoryDateMonth('All');
                                    setHistoryDateYear('All');
                                    setHistoryCustomDate('');
                                  }}
                                  className="px-4 py-2 bg-brand-cream hover:bg-brand-brown hover:text-white transition-all rounded-xl text-xs text-brand-brown font-bold cursor-pointer"
                                >
                                  Reset Semua Filter
                                </button>
                              )}
                            </div>

                            {/* Baris Filter Tanggal Spesifik (Tanggal / Bulan / Tahun) */}
                            <div className="pt-3 border-t border-brand-green/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              {/* Dropdown Tanggal */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-brand-brown/70 block uppercase tracking-wider">Tanggal (Hari)</label>
                                <select
                                  id="sel-history-day"
                                  value={historyDateDay}
                                  onChange={(e) => {
                                    setHistoryDateDay(e.target.value);
                                    setHistoryCustomDate(''); // Reset model manual datepicker
                                  }}
                                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-brand-green/10 rounded-xl text-xs text-brand-brown font-semibold focus:outline-none focus:border-brand-green cursor-pointer"
                                >
                                  <option value="All">Semua Tanggal (1-31)</option>
                                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                    <option key={d} value={d.toString()}>{d}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Dropdown Bulan */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-brand-brown/70 block uppercase tracking-wider">Bulan</label>
                                <select
                                  id="sel-history-month"
                                  value={historyDateMonth}
                                  onChange={(e) => {
                                    setHistoryDateMonth(e.target.value);
                                    setHistoryCustomDate(''); // Reset model manual datepicker
                                  }}
                                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-brand-green/10 rounded-xl text-xs text-brand-brown font-semibold focus:outline-none focus:border-brand-green cursor-pointer"
                                >
                                  <option value="All">Semua Bulan</option>
                                  {INDONESIAN_MONTHS.map((m, idx) => (
                                    <option key={idx} value={idx.toString()}>{m}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Dropdown Tahun */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-brand-brown/70 block uppercase tracking-wider">Tahun</label>
                                <select
                                  id="sel-history-year"
                                  value={historyDateYear}
                                  onChange={(e) => {
                                    setHistoryDateYear(e.target.value);
                                    setHistoryCustomDate(''); // Reset model manual datepicker
                                  }}
                                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-brand-green/10 rounded-xl text-xs text-brand-brown font-semibold focus:outline-none focus:border-brand-green cursor-pointer"
                                >
                                  <option value="All">Semua Tahun</option>
                                  {['2024', '2025', '2026', '2027', '2028'].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Input Kalender Manual */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-brand-brown/70 block uppercase tracking-wider">Atau Cari Lewat Kalender</label>
                                <input
                                  id="inp-history-custom-date"
                                  type="date"
                                  value={historyCustomDate}
                                  onChange={(e) => {
                                    setHistoryCustomDate(e.target.value);
                                    // Reset dropdowns to avoid overlap
                                    setHistoryDateDay('All');
                                    setHistoryDateMonth('All');
                                    setHistoryDateYear('All');
                                  }}
                                  className="w-full px-3 py-1.5 bg-[#FAF9F6] border border-brand-green/10 rounded-xl text-xs text-brand-brown font-semibold focus:outline-none focus:border-brand-green cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order table */}
                        <div className="bg-white rounded-3xl border border-brand-green/10 overflow-hidden shadow-xs">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-sans">
                              <thead>
                                <tr className="bg-brand-brown text-white font-mono text-[10px] tracking-wider uppercase border-b border-brand-green/10">
                                  <th className="p-4">ID Bill</th>
                                  <th className="p-4">Waktu</th>
                                  <th className="p-4">Nama Tamu</th>
                                  <th className="p-4">Tipe/Meja</th>
                                  <th className="p-4">Pesanan Item</th>
                                  <th className="p-4 text-right">Pembayaran</th>
                                  <th className="p-4">Status</th>
                                  <th className="p-4 text-center">Tindakan</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-brand-green/5 text-brand-brown">
                                {(() => {
                                  const filteredOrders = orders.filter(o => {
                                    // 1. Text Search Filter
                                    const searchLower = historySearchQuery.toLowerCase();
                                    const matchSearch = 
                                      o.customerName.toLowerCase().includes(searchLower) ||
                                      o.id.toLowerCase().includes(searchLower) ||
                                      o.items.some(it => it.item.name.toLowerCase().includes(searchLower)) ||
                                      o.tableNumberOrType.toLowerCase().includes(searchLower);
                                    
                                    // 2. Status Filter
                                    const matchStatus = historyStatusFilter === 'All' || o.status === historyStatusFilter;
                                    
                                    // 3. Payment Method Filter
                                    const matchPayment = historyPaymentFilter === 'All' || o.paymentMethod === historyPaymentFilter;

                                    // 4. Date components Filter
                                    const parsedDate = parseOrderDate(o.timestamp);
                                    const matchDay = historyDateDay === 'All' || parsedDate.getDate().toString() === historyDateDay;
                                    const matchMonth = historyDateMonth === 'All' || parsedDate.getMonth().toString() === historyDateMonth;
                                    const matchYear = historyDateYear === 'All' || parsedDate.getFullYear().toString() === historyDateYear;

                                    // 5. Custom Date HTML Picker Filter
                                    let matchCustomDate = true;
                                    if (historyCustomDate) {
                                      const targetDate = new Date(historyCustomDate);
                                      matchCustomDate = 
                                        parsedDate.getDate() === targetDate.getDate() &&
                                        parsedDate.getMonth() === targetDate.getMonth() &&
                                        parsedDate.getFullYear() === targetDate.getFullYear();
                                    }

                                    return matchSearch && matchStatus && matchPayment && matchDay && matchMonth && matchYear && matchCustomDate;
                                  });

                                  // Group filtered orders by complete formatted Date
                                  // Example key: "Rabu, 10 Juni 2026"
                                  const grouped: Record<string, CashierOrder[]> = {};
                                  
                                  filteredOrders.forEach(o => {
                                    const parsed = parseOrderDate(o.timestamp);
                                    // Make a beautiful Indonesian title
                                    const dayName = parsed.toLocaleDateString('id-ID', { weekday: 'long' });
                                    const dateStr = `${dayName}, ${parsed.getDate()} ${INDONESIAN_MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`;
                                    
                                    if (!grouped[dateStr]) {
                                      grouped[dateStr] = [];
                                    }
                                    grouped[dateStr].push(o);
                                  });

                                  const dateKeys = Object.keys(grouped);

                                  if (dateKeys.length === 0) {
                                    return (
                                      <tr>
                                        <td colSpan={8} className="py-16 text-center text-brand-brown/50 font-semibold font-sans">
                                          Belum ada data transaksi yang cocok dengan pencarian / filter tanggal tersebut.
                                        </td>
                                      </tr>
                                    );
                                  }

                                  // Loop through grouped days
                                  return dateKeys.map(dateGroupTitle => {
                                    const orderList = grouped[dateGroupTitle];
                                    
                                    return (
                                      <React.Fragment key={dateGroupTitle}>
                                        {/* Date separation line */}
                                        <tr className="bg-brand-cream/20 border-y border-brand-green/10">
                                          <td colSpan={8} className="px-4 py-2.5 font-sans font-extrabold text-[11px] tracking-wide text-brand-green uppercase bg-[#FAF9F6]">
                                            <span className="inline-flex items-center gap-2">
                                              <Calendar className="w-3.5 h-3.5 text-brand-green" />
                                              {dateGroupTitle}
                                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green">
                                                {orderList.length} Transaksi
                                              </span>
                                            </span>
                                          </td>
                                        </tr>

                                        {/* Row map */}
                                        {orderList.map((order) => {
                                          const isCompleted = order.status === 'Completed';
                                          const isCancelled = order.status === 'Cancelled';
                                          const isPending = order.status === 'Pending';
                                          const isOnProcess = order.status === 'On Process';
                                          
                                          // Time extraction
                                          let timeStr = order.timestamp;
                                          if (order.timestamp.includes(",")) {
                                            const parts = order.timestamp.split(",");
                                            timeStr = parts[parts.length - 1].trim(); // Get only time part e.g. "09:15"
                                          }

                                          return (
                                            <tr key={order.id} className="hover:bg-brand-cream/10 transition-colors">
                                              <td className="p-4 font-mono font-bold whitespace-nowrap">{order.id}</td>
                                              <td className="p-4 text-[10px] font-mono text-brand-brown/60 leading-tight whitespace-nowrap">
                                                {timeStr} WIB
                                              </td>
                                              <td className="p-4 whitespace-nowrap font-bold">{order.customerName}</td>
                                              <td className="p-4 whitespace-nowrap text-brand-brown/85 font-mono text-[11px]">{order.tableNumberOrType}</td>
                                              <td className="p-4 min-w-[200px]">
                                                <div className="space-y-1.5 text-[11px]">
                                                  {order.items.map((cartItem, idx) => (
                                                    <div key={idx} className="flex flex-wrap items-center gap-1">
                                                      <span className="font-semibold text-brand-brown">{cartItem.item.name}</span>
                                                      <span className="text-[9px] font-bold bg-brand-green/5 text-brand-green px-1.5 py-0.5 rounded">x{cartItem.quantity}</span>
                                                      {cartItem.temperature && cartItem.temperature !== 'Normal' && <span className="text-[9px] text-brand-brown/50">({cartItem.temperature})</span>}
                                                    </div>
                                                  ))}
                                                </div>
                                              </td>
                                              <td className="p-4 text-right whitespace-nowrap font-mono font-bold">
                                                <div>Rp {order.totalAmount.toLocaleString('id-ID')}</div>
                                                <div className="text-[8px] font-extrabold text-brand-green bg-brand-green/10 rounded px-1.5 py-0.5 inline-block mt-1">
                                                  {order.paymentMethod === 'Bank Transfer' ? '🏦 BANK' : order.paymentMethod === 'QRIS' ? '📱 QRIS' : order.paymentMethod === 'Cash' ? '💵 TUNAI' : '💳 KARTU'}
                                                </div>
                                              </td>
                                              <td className="p-4 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                                  isCompleted ? 'bg-emerald-100 text-emerald-800' :
                                                  isCancelled ? 'bg-rose-100 text-rose-800' :
                                                  isOnProcess ? 'bg-cyan-100 text-cyan-800' : 'bg-amber-100 text-amber-850'
                                                }`}>
                                                  {order.status}
                                                </span>
                                              </td>
                                              <td className="p-4 whitespace-nowrap text-center">
                                                <div className="flex gap-1.5 justify-center">
                                                  <button
                                                    id={`btn-history-print-${order.id}`}
                                                    onClick={() => {
                                                      setActiveReceiptForPrinting(order);
                                                      handlePrintReceipt(order);
                                                    }}
                                                    title="Cetak Ulang Struk"
                                                    className="p-1.5 rounded-xl border border-brand-green/15 hover:bg-brand-cream text-brand-brown cursor-pointer transition-all shrink-0"
                                                  >
                                                    <Printer className="w-3.5 h-3.5" />
                                                  </button>
                                                  
                                                  {/* Status changers */}
                                                  {!isCompleted && !isCancelled && (
                                                    <button
                                                      id={`btn-history-complete-${order.id}`}
                                                      onClick={() => handleUpdateOrderStatus(order.id, 'Completed')}
                                                      title="Tandai Selesai"
                                                      className="p-1.5 rounded-xl bg-brand-green/10 hover:bg-brand-green hover:text-white text-brand-green cursor-pointer transition-all shrink-0"
                                                    >
                                                      <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                  )}
                                                  
                                                  {!isCancelled && (
                                                    <button
                                                      id={`btn-history-cancel-${order.id}`}
                                                      onClick={() => {
                                                        askConfirmation(
                                                          "Batalkan Transaksi",
                                                          `Apakah Anda yakin ingin mematalkan transaksi ${order.id}?`,
                                                          () => {
                                                            handleUpdateOrderStatus(order.id, 'Cancelled');
                                                          },
                                                          true,
                                                          "Batalkan",
                                                          "Urungkan"
                                                        );
                                                      }}
                                                      title="Batalkan Transaksi"
                                                      className="p-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-650 cursor-pointer transition-all shrink-0"
                                                    >
                                                      <X className="w-3.5 h-3.5" />
                                                    </button>
                                                  )}
                                                  
                                                  {isCancelled && (
                                                    <button
                                                      id={`btn-history-restore-${order.id}`}
                                                      onClick={() => handleUpdateOrderStatus(order.id, 'Pending')}
                                                      title="Pulihkan Transaksi"
                                                      className="p-1.5 rounded-xl border border-cyan-200 hover:bg-cyan-50 text-cyan-850 cursor-pointer transition-all shrink-0"
                                                    >
                                                      <History className="w-3.5 h-3.5" />
                                                    </button>
                                                  )}

                                                  {/* Delete button (Hapus permanen satu riwayat) */}
                                                  <button
                                                    id={`btn-history-delete-item-${order.id}`}
                                                    onClick={() => {
                                                      askConfirmation(
                                                        "Hapus Transaksi Permanen",
                                                        `Apakah Anda yakin ingin menghapus permanen riwayat transaksi ${order.id}? Tindakan ini tidak dapat dikembalikan.`,
                                                        () => {
                                                          deleteDoc(doc(db, "orders", order.id));
                                                          displayToast(`Log transaksi ${order.id} berhasil dihapus secara permanen.`);
                                                        },
                                                        true,
                                                        "Hapus Permanen",
                                                        "Batal"
                                                      );
                                                    }}
                                                    title="Hapus Permanen Dari Riwayat"
                                                    className="p-1.5 rounded-xl border border-red-200 hover:bg-red-50 hover:text-red-700 text-red-500 cursor-pointer transition-all shrink-0"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </React.Fragment>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* VIEW TAB: LIVE CHAT TAMU */}
                    {adminTab === 'live-chat' && (
                      <div className="space-y-6 animate-fade-in text-brand-brown">
                        <div className="border-b border-brand-green/10 pb-4">
                          <h4 className="font-serif text-2xl font-black tracking-tight text-brand-brown">Hub Live Chat Tamu</h4>
                          <p className="text-xs text-brand-brown/65 mt-1">Interaksi langsung secara real-time dengan tamu di area slow-bar atau meja makan.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-brand-green/10 rounded-3xl overflow-hidden min-h-[500px] shadow-sm">
                          {/* SESSIONS LIST PANEL (Left Column - col-span-4) */}
                          <div className="lg:col-span-4 border-r border-brand-green/10 flex flex-col h-[550px] bg-brand-cream-light/20">
                            <div className="p-4 border-b border-brand-green/10 bg-brand-cream-light/45">
                              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#A48E74]">Daftar Percakapan</span>
                              <p className="text-[11px] text-brand-brown/60 leading-tight mt-0.5">Klik nama tamu untuk membuka jendela pesan.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto divide-y divide-brand-green/5">
                              {(() => {
                                // Gather all unique guest sessions
                                const sessionsMap: { [key: string]: any } = {};
                                chatMessages.forEach(m => {
                                  if (m.guestSessionId && m.guestSessionId !== 'all') {
                                    if (!sessionsMap[m.guestSessionId]) {
                                      sessionsMap[m.guestSessionId] = {
                                        sessionId: m.guestSessionId,
                                        customerName: m.customerName || m.senderName || 'Tamu',
                                        tableNumber: m.tableNumber || 'Umum',
                                        lastMessage: m.text,
                                        timestamp: m.timestamp,
                                        unreadCount: 0
                                      };
                                    } else {
                                      sessionsMap[m.guestSessionId].lastMessage = m.text;
                                      sessionsMap[m.guestSessionId].timestamp = m.timestamp;
                                    }
                                    if (m.sender === 'guest' && !m.readByAdmin) {
                                      sessionsMap[m.guestSessionId].unreadCount += 1;
                                    }
                                  }
                                });

                                const sessionsList = Object.values(sessionsMap);

                                if (sessionsList.length === 0) {
                                  return (
                                    <div className="p-10 text-center space-y-2">
                                      <MessageCircle className="w-8 h-8 text-brand-brown/20 mx-auto" />
                                      <span className="text-xs font-bold text-brand-brown/50 block">Belum ada chat aktif</span>
                                      <p className="text-[10px] text-brand-brown/40">Gunakan widget chat di bagian bawah saat menjelajah sebagai Tamu!</p>
                                    </div>
                                  );
                                }

                                return sessionsList.map((session: any) => {
                                  const isSelected = adminSelectedChatSession === session.sessionId;
                                  return (
                                    <button
                                      key={session.sessionId}
                                      onClick={() => {
                                        setAdminSelectedChatSession(session.sessionId);
                                        handleMarkAdminMessagesAsRead(session.sessionId);
                                      }}
                                      className={`w-full text-left p-4 transition-all cursor-pointer block hover:bg-brand-cream/35 ${
                                        isSelected ? 'bg-brand-cream/60 border-l-4 border-brand-green font-semibold' : ''
                                      }`}
                                    >
                                      <div className="flex justify-between items-start gap-1">
                                        <div className="min-w-0 pr-1">
                                          <span className="text-xs font-black block truncate text-brand-brown">{session.customerName}</span>
                                          <span className="inline-block bg-brand-green/10 text-brand-green font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1">
                                            {session.tableNumber}
                                          </span>
                                        </div>
                                        <div className="text-right shrink-0">
                                          <span className="text-[8.5px] text-brand-brown/45 font-mono block">{session.timestamp}</span>
                                          {session.unreadCount > 0 && (
                                            <span className="inline-flex items-center justify-center bg-orange-500 text-white font-mono font-bold text-[8.5px] w-4 h-4 rounded-full mt-1.5 animate-bounce">
                                              {session.unreadCount}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-[10.5px] text-brand-brown/65 truncate mt-2 font-normal">
                                        {session.lastMessage}
                                      </p>
                                    </button>
                                  );
                                });
                              })()}
                            </div>
                          </div>

                          {/* ACTIVE CHAT WORKSPACE PANEL (Right Column - col-span-8) */}
                          <div className="lg:col-span-8 flex flex-col h-[550px] bg-white">
                            {adminSelectedChatSession === 'all' ? (
                              <div className="flex-1 flex flex-col justify-center items-center text-center p-12 bg-gray-50/40">
                                <MessageSquare className="w-12 h-12 text-brand-brown/25 animate-pulse mb-3" />
                                <h5 className="font-serif font-black text-brand-brown text-base">Konsol Chat Barista</h5>
                                <p className="text-xs text-brand-brown/60 max-w-sm mt-1">
                                  Silakan pilih salah satu sesi percakapan aktif dari kolom kiri untuk membalas secara langsung ke layar tamu.
                                </p>
                              </div>
                            ) : (
                              (() => {
                                const selectedSessionMsgs = chatMessages.filter(
                                  m => m.guestSessionId === adminSelectedChatSession || 
                                       (m.guestSessionId === 'all' && m.sender === 'admin' && m.id === 'initial-welcome')
                                );
                                const activeSessionInfo = chatMessages.find(m => m.guestSessionId === adminSelectedChatSession);
                                const displayName = activeSessionInfo?.customerName || activeSessionInfo?.senderName || 'Tamu';
                                const displayLoc = activeSessionInfo?.tableNumber || 'Umum';

                                return (
                                  <div className="flex-1 flex flex-col min-h-0">
                                    {/* Session Header Bar */}
                                    <div className="p-4 border-b border-brand-green/10 bg-brand-cream/15 flex justify-between items-center shrink-0">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-brand-green text-brand-cream flex items-center justify-center text-xs font-black select-none uppercase">
                                          {displayName.substring(0, 2)}
                                        </div>
                                        <div>
                                          <span className="text-xs font-black block text-brand-brown">{displayName}</span>
                                          <span className="text-[9.5px] text-brand-green font-bold">{displayLoc}</span>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => {
                                          setAdminSelectedChatSession('all');
                                        }}
                                        className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                                      >
                                        Tutup Chat
                                      </button>
                                    </div>

                                    {/* Messages list scroller */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-brand-cream-light/10">
                                      {selectedSessionMsgs.map((msg) => {
                                        const isAdmin = msg.sender === 'admin';
                                        return (
                                          <div 
                                            key={msg.id}
                                            className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                                          >
                                            <div className="flex items-center gap-1.5 mb-0.5 select-none text-[8px] text-brand-brown/45 font-mono">
                                              <span>{msg.senderName}</span>
                                              <span>•</span>
                                              <span>{msg.timestamp}</span>
                                            </div>
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-xs leading-normal font-sans ${
                                              isAdmin 
                                                ? 'bg-brand-green text-white rounded-tr-none shadow-xs' 
                                                : 'bg-brand-cream/60 text-brand-brown rounded-tl-none border border-brand-green/5'
                                            }`}>
                                              {msg.text}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Balasan Instan / Shortcut Responses Bar */}
                                    <div className="px-4 py-2 border-t border-brand-green/5 bg-gray-50 shrink-0 select-none overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
                                      {[
                                        "Baik, segera kami antarkan barangnya ke meja.",
                                        "Pesanan Anda sedang kami siapkan ya, mohon ditunggu.",
                                        "Butuh tambahan gula cair atau hal lainnya?",
                                        "Ok siap! Kami proses secepatnya ya."
                                      ].map((scText, scIdx) => (
                                        <button
                                          key={scIdx}
                                          type="button"
                                          onClick={() => handleSendAdminMessage(scText, adminSelectedChatSession)}
                                          className="inline-block bg-white hover:bg-brand-cream/30 text-brand-brown border border-brand-green/10 rounded-full px-3 py-1 text-[10px] font-bold cursor-pointer transition-all shrink-0"
                                        >
                                          + {scText}
                                        </button>
                                      ))}
                                    </div>

                                    {/* Input Message Compose Action Form */}
                                    <form 
                                      onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSendAdminMessage(adminChatText, adminSelectedChatSession);
                                      }}
                                      className="p-3 border-t border-brand-green/10 bg-brand-cream-light/15 flex items-center gap-2.5 shrink-0"
                                    >
                                      <input
                                        type="text"
                                        placeholder="Ketik balasan barista..."
                                        value={adminChatText}
                                        onChange={(e) => setAdminChatText(e.target.value)}
                                        className="flex-1 bg-white border border-brand-green/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-brand-green"
                                      />
                                      <button
                                        type="submit"
                                        className="bg-brand-green hover:bg-brand-green-light text-white p-2.5 rounded-xl cursor-pointer shrink-0 transition-all shadow-xs"
                                      >
                                        <Send className="w-4 h-4" />
                                      </button>
                                    </form>
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* VIEW TAB 5: KONFIGURASI METODE PEMBAYARAN */}
                    {adminTab === 'settings' && (
                      <div className="space-y-6 animate-fade-in text-brand-brown">
                        <div className="border-b border-brand-green/5 pb-4">
                          <h4 className="font-serif text-xl font-black text-brand-brown tracking-tight">Atur Metode Pembayaran Cafe</h4>
                          <p className="text-xs text-brand-brown/60 mt-0.5">Konfigurasikan barcode QRIS, instruksi pembayaran debit, dan rekening Bank Transfer untuk pelanggan online.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          
                          {/* QRIS Configuration Card */}
                          <div className="bg-white p-6 rounded-3xl border border-brand-green/10 shadow-xs space-y-5">
                            <div className="flex items-center gap-2 border-b border-brand-green/5 pb-3">
                              <span className="text-lg">📱</span>
                              <h5 className="font-bold text-sm uppercase tracking-wide">Pengaturan Pembayaran QRIS</h5>
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-brand-brown/85">Merchant Name / ID Virtual</label>
                                <input
                                  id="inp-qris-merchant-id"
                                  type="text"
                                  value={qrisConfigMerchantID}
                                  onChange={(e) => setQrisConfigMerchantID(e.target.value)}
                                  placeholder="Contoh: OUTPOSTCOFFEE@okaxis atau ID1020304"
                                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-brand-green/10 rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-green font-semibold"
                                />
                                <span className="text-[10px] text-brand-brown/50 block font-normal">Kode unik ini digunakan untuk merender payload dynamic QRIS scan-to-pay pelanggan.</span>
                              </div>

                              <div className="space-y-2 pt-2">
                                <label className="text-xs font-bold text-brand-brown/85 block">Metode Gambar QRIS</label>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 text-xs font-bold text-brand-brown/70 cursor-pointer">
                                    <input
                                      id="radio-qris-api"
                                      type="radio"
                                      checked={!useManualQrisImage}
                                      onChange={() => setUseManualQrisImage(false)}
                                      className="accent-brand-green cursor-pointer"
                                    />
                                    Generasi Otomatis (Dynamic API)
                                  </label>
                                  <label className="flex items-center gap-2 text-xs font-bold text-brand-brown/70 cursor-pointer">
                                    <input
                                      id="radio-qris-manual"
                                      type="radio"
                                      checked={useManualQrisImage}
                                      onChange={() => setUseManualQrisImage(true)}
                                      className="accent-brand-green cursor-pointer"
                                    />
                                    Sematkan URL Gambar Manual
                                  </label>
                                </div>
                              </div>

                              {useManualQrisImage && (
                                <div className="space-y-4 animate-fade-in">
                                  {/* UPLOAD BOX */}
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-brand-brown/85">Unggah Berkas Gambar QRIS</label>
                                    <div
                                      id="qris-drag-drop-zone"
                                      onDragOver={handleQrisDragOver}
                                      onDragLeave={handleQrisDragLeave}
                                      onDrop={handleQrisDrop}
                                      className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                                        isDraggingQris
                                          ? 'border-brand-green bg-brand-green/5'
                                          : 'border-brand-green/20 bg-[#FAF9F6] hover:bg-brand-cream/10'
                                      }`}
                                      onClick={() => document.getElementById('file-qris-uploader')?.click()}
                                    >
                                      <input
                                        id="file-qris-uploader"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleQrisFileSelect}
                                        className="hidden"
                                      />
                                      
                                      {qrisManualImageUrl && qrisManualImageUrl.startsWith('data:image/') ? (
                                        <div className="flex flex-col items-center gap-2">
                                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-brand-green/10 bg-white p-1">
                                            <img
                                              src={qrisManualImageUrl}
                                              alt="QRIS Terunggah"
                                              className="w-full h-full object-contain"
                                            />
                                          </div>
                                          <div className="text-[11px] font-bold text-brand-green">✓ Gambar Berhasil Diunggah</div>
                                          <button
                                            id="btn-remove-qris-uploaded"
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setQrisManualImageUrl('');
                                              displayToast("Gambar QRIS berhasil dihapus.");
                                            }}
                                            className="text-[10px] text-red-650 hover:text-red-850 font-bold px-2 py-1 bg-red-50 rounded-lg transition"
                                          >
                                            Hapus / Ganti Gambar
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                                            <Upload className="w-5 h-5" />
                                          </div>
                                          <div>
                                            <p className="text-xs font-bold text-brand-brown">Seret & taruh gambar QRIS di sini</p>
                                            <p className="text-[10px] text-brand-brown/50 mt-0.5">atau klik untuk menelusuri berkas dari perangkat Anda</p>
                                          </div>
                                          <span className="text-[9px] px-2 py-0.5 bg-brand-cream text-brand-green font-mono rounded-full font-bold">PNG, JPG, WEBP • Max 3MB</span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* URL TEXT INPUT */}
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                      <label className="text-xs font-bold text-brand-brown/85">URL Gambar QRIS (Alternatif)</label>
                                      {qrisManualImageUrl && (
                                        <span className="text-[9px] font-mono text-brand-green/70 bg-brand-green/5 px-1.5 py-0.5 rounded">
                                          {qrisManualImageUrl.startsWith('data:') ? 'Tipe: File Terunggah (Base64)' : 'Tipe: URL Eksternal'}
                                        </span>
                                      )}
                                    </div>
                                    <input
                                      id="inp-qris-manual-url"
                                      type="text"
                                      value={qrisManualImageUrl}
                                      onChange={(e) => setQrisManualImageUrl(e.target.value)}
                                      placeholder="Atau tempel link gambar QRIS di sini jika sudah ada"
                                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-brand-green/10 rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-green"
                                    />
                                    <span className="text-[10px] text-brand-brown/50 block font-normal leading-tight">
                                      Anda bisa langsung mengunggah file di atas atau menyematkan public URL gambar QRIS Anda di kolom ini.
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-brand-green/5 flex gap-4 items-center">
                                <div 
                                  onClick={() => setPreviewImageUrl(useManualQrisImage && qrisManualImageUrl ? qrisManualImageUrl : `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=qris-pay-outpost-PREVIEW-rp-50000`)}
                                  className="bg-white p-2.5 rounded-xl border border-brand-green/10 shrink-0 cursor-pointer group relative overflow-hidden"
                                  title="Klik untuk memperbesar gambar QR"
                                >
                                  <img
                                    src={useManualQrisImage && qrisManualImageUrl ? qrisManualImageUrl : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=qris-pay-outpost-PREVIEW-rp-50000`}
                                    alt="QRIS Preview"
                                    className="w-20 h-20 object-contain rounded transition-transform group-hover:scale-110 duration-200"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-[8px] bg-white/90 text-brand-brown px-1 rounded font-bold">Besar</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-mono font-bold tracking-wider text-[#CB997E] uppercase">Live Preview QRIS Pelanggan</span>
                                  <span className="text-xs font-black text-brand-brown block">Uji Coba Tampilan QR</span>
                                  <p className="text-[10.5px] text-brand-brown/65 leading-relaxed font-normal">
                                    Ini adalah kode QRIS yang akan langsung dipindai pelanggan saat checkout berhasil.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bank Transfer Configuration Card */}
                          <div className="bg-white p-6 rounded-3xl border border-brand-green/10 shadow-xs space-y-5">
                            <div className="flex items-center gap-2 border-b border-brand-green/5 pb-3">
                              <span className="text-lg">🏦</span>
                              <h5 className="font-bold text-sm uppercase tracking-wide">Pengaturan Rekening Transfer Bank</h5>
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-brand-brown/85">Nama Bank</label>
                                <input
                                  id="inp-bank-name"
                                  type="text"
                                  value={bankAccountName}
                                  onChange={(e) => setBankAccountName(e.target.value)}
                                  placeholder="Contoh: Bank Mandiri, BCA, atau BRI"
                                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-brand-green/10 rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-green font-semibold"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-brand-brown/85">Nomor Rekening Penerima Cashier</label>
                                <input
                                  id="inp-bank-number"
                                  type="text"
                                  value={bankAccountNumber}
                                  onChange={(e) => setBankAccountNumber(e.target.value)}
                                  placeholder="Contoh: 123-456-7890-123"
                                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-brand-green/10 rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-green font-mono font-bold"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-brand-brown/85">Nama Pemilik Rekening (Atas Nama)</label>
                                <input
                                  id="inp-bank-holder"
                                  type="text"
                                  value={bankAccountHolder}
                                  onChange={(e) => setBankAccountHolder(e.target.value)}
                                  placeholder="Contoh: PT OUTPOST COFFEE GROUND"
                                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-brand-green/10 rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-green font-semibold"
                                />
                              </div>

                              <div className="bg-emerald-50/80 border border-emerald-400/10 p-3.5 rounded-2xl text-emerald-950 font-medium space-y-1">
                                <span className="text-[10px] font-bold text-emerald-800 uppercase block font-mono">💡 Tips Kasir</span>
                                <p className="text-[10px] leading-relaxed font-normal">
                                  Pelanggan dapat langsung menyalin nomor rekening di atas saat melakukan pembayaran online dari meja mereka secara presisi.
                                </p>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Save Action Banner */}
                        <div className="bg-brand-cream/60 rounded-3xl p-5 border border-brand-green/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div className="text-left">
                            <span className="text-xs font-bold text-brand-brown block">Sinkronisasi Instan Aktif</span>
                            <p className="text-[11px] text-brand-brown/65 mt-0.5 leading-normal font-normal">Semua konfigurasi metode pembayaran di atas disimpan secara lokal di POS dan langsung termuat di layar sukses pelanggan.</p>
                          </div>
                          <button
                            id="btn-save-payment-config"
                            onClick={() => {
                              localStorage.setItem('op_pay_qris_merchant', qrisConfigMerchantID);
                              localStorage.setItem('op_pay_qris_manual_img', qrisManualImageUrl);
                              localStorage.setItem('op_pay_qris_use_manual', String(useManualQrisImage));
                              localStorage.setItem('op_pay_bank_name', bankAccountName);
                              localStorage.setItem('op_pay_bank_number', bankAccountNumber);
                              localStorage.setItem('op_pay_bank_holder', bankAccountHolder);
                              displayToast("Pengaturan pembayaran berhasil dipublikasikan & aktif di layar POS pelanggan!");
                            }}
                            className="bg-brand-green hover:bg-brand-green-light text-white px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                          >
                            <Check className="w-4 h-4" /> Publikasikan Perubahan
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              )}

              {/* POS Footer controls */}
              <div className="bg-brand-cream border-t border-brand-green/10 p-4 flex flex-col sm:flex-row justify-between items-center text-xs text-brand-brown/70 gap-3 shrink-0">
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Outpost POS Terminal • Versi POS 2.6 Alpha</span>
                </div>
                <button
                  id="btn-admin-pos-close"
                  onClick={() => setIsAdminMode(false)}
                  className="bg-brand-green hover:bg-brand-green-light text-white py-2 px-5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
                >
                  Tutup Sesi
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING GUEST LIVE CHAT WIDGET */}
      {!isAdminMode && (
        <div className="fixed bottom-6 right-6 z-45 font-sans">
          <AnimatePresence>
            {isGuestChatOpen ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-brand-cream border border-brand-green/20 w-[92vw] sm:w-[360px] h-[485px] rounded-3xl shadow-2xl overflow-hidden flex flex-col border-brand-green/10"
              >
                {/* Header */}
                <div className="bg-brand-green text-white p-4 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping shrink-0" />
                    <div>
                      <h5 className="text-xs font-black tracking-tight leading-none uppercase">Live Chat Kasir</h5>
                      <span className="text-[9px] text-[#A2DEC0] mt-0.5 block">Terhubung langsung ke POS Utama</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsGuestChatOpen(false)}
                    className="text-white hover:text-gray-200 text-xs font-bold leading-none px-2 py-1 select-none cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>

                {/* Info Bar */}
                <div className="bg-brand-cream-light/40 border-b border-brand-green/5 px-4 py-2 shrink-0 flex items-center justify-between">
                  <span className="text-[10px] text-brand-brown/55 font-serif">
                    {custName.trim() || clientLoggedInName || 'Tamu'} — {tableOrType === 'Table' ? `Meja ${tableNum}` : 'Takeaway'}
                  </span>
                  <span className="text-[9px] bg-brand-brown/10 text-brand-brown font-mono font-bold px-1.5 py-0.5 rounded-md">
                    Sesi ID: {guestSessionId.substring(6, 12)}
                  </span>
                </div>

                {/* Messages Scroller */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF9F5]">
                  {(() => {
                    const guestConversation = chatMessages.filter(
                      m => m.guestSessionId === guestSessionId || 
                           (m.guestSessionId === 'all' && m.sender === 'admin' && m.id === 'initial-welcome')
                    );
                    return guestConversation.map(msg => {
                      const isMe = msg.sender === 'guest';
                      return (
                        <div 
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5 text-[8px] text-brand-brown/50 select-none">
                            <span className="font-bold">{msg.senderName}</span>
                            <span>•</span>
                            <span className="font-mono">{msg.timestamp}</span>
                          </div>
                          <div className={`max-w-[85%] rounded-2xl px-3.5 py-1.5 text-[11.5px] leading-relaxed ${
                            isMe 
                              ? 'bg-brand-brown text-white rounded-tr-none shadow-xs' 
                              : 'bg-brand-cream-light border border-brand-green/10 text-brand-brown rounded-tl-none shadow-2xs'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Quick Requests shortcuts */}
                <div className="px-4 py-2 border-t border-brand-green/5 bg-[#FAF9F5] select-none overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0">
                  {[
                    "Minta sendok tambahan",
                    "Minta tisu tambahan",
                    "Boleh minta sedotan?",
                    "Cek status pesanan saya"
                  ].map((scText, scIdx) => (
                    <button
                      key={scIdx}
                      type="button"
                      onClick={() => handleSendGuestMessage(scText)}
                      className="inline-block bg-white hover:bg-brand-cream text-brand-brown border border-brand-green/10 rounded-full px-2.5 py-1 text-[9.5px] font-bold cursor-pointer transition-all shrink-0"
                    >
                      + {scText}
                    </button>
                  ))}
                </div>

                {/* Compose Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendGuestMessage(guestChatText);
                  }}
                  className="p-3 border-t border-brand-green/5 bg-brand-cream/10 shrink-0 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ketik pesan atau minta bantuan..."
                    value={guestChatText}
                    onChange={(e) => setGuestChatText(e.target.value)}
                    className="flex-1 bg-white border border-brand-green/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-green"
                  />
                  <button
                    type="submit"
                    className="bg-brand-brown hover:bg-brand-brown-light text-white p-2 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.button
                key="chat-trigger-btn"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => {
                  setIsGuestChatOpen(true);
                  handleMarkGuestMessagesAsRead();
                }}
                className="bg-brand-brown hover:bg-brand-brown-light text-brand-cream p-4 rounded-full shadow-2xl flex items-center justify-center relative cursor-pointer group transition-all"
                title="Hubungi Admin / Kasir"
              >
                <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
                
                {/* Unread Indicator Badge */}
                {(() => {
                  const guestUnreadCount = chatMessages.filter(
                    m => m.sender === 'admin' && m.guestSessionId === guestSessionId && !m.readByGuest
                  ).length;
                  if (guestUnreadCount > 0) {
                    return (
                      <span className="absolute -top-1 -right-1 bg-orange-600 border-2 border-white text-white font-mono font-bold text-[9px] w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                        {guestUnreadCount}
                      </span>
                    );
                  }
                  return null;
                })()}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ZOOMABLE IMAGE PREVIEW MODAL */}
      <AnimatePresence>
        {previewImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="modal-image-preview-overlay"
            onClick={() => setPreviewImageUrl(null)}
            className="fixed inset-0 z-[100] bg-[#16120F]/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="relative max-w-sm w-full bg-white rounded-3xl p-6 border border-brand-green/10 shadow-2xl flex flex-col items-center gap-4 text-center cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex justify-between items-center border-b border-brand-green/5 pb-3">
                <span className="text-[10px] font-mono tracking-widest text-[#CB997E] uppercase font-bold">Zoom Kode QRIS</span>
                <button
                  id="btn-close-zoom-modal"
                  onClick={() => setPreviewImageUrl(null)}
                  className="w-7 h-7 rounded-full bg-brand-cream/40 flex items-center justify-center text-brand-brown/70 hover:bg-brand-cream/80 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-brand-green/10 w-full max-w-[280px]">
                <img
                  src={previewImageUrl}
                  alt="QRIS Zoomed In"
                  className="w-full h-auto object-contain rounded-lg shadow-xs"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-brand-brown">Pindai QR Untuk Menyelesaikan Pesanan</p>
                <p className="text-[10px] text-brand-brown/60 leading-tight">
                  Arahkan kamera HP / aplikasi dompet digital Anda secara tegak lurus pada gambar kode QR di atas.
                </p>
              </div>
              <button
                id="btn-dismiss-zoom-modal"
                onClick={() => setPreviewImageUrl(null)}
                className="w-full bg-brand-green hover:bg-brand-green-light text-white font-extrabold uppercase tracking-wide py-2.5 rounded-xl text-[10px] transition-all cursor-pointer shadow-xs mt-1"
              >
                Kembali ke Layar POS
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* THERMAL RECEIPT DISPLAY MODAL */}
      <AnimatePresence>
        {activeReceiptForPrinting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="modal-print-receipt-overlay"
            className="fixed inset-0 bg-[#16120F]/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto font-sans"
            onClick={() => setActiveReceiptForPrinting(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white text-brand-brown w-full max-w-sm rounded-3xl shadow-xl overflow-hidden border border-brand-green/10 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header actions bar */}
              <div className="bg-brand-brown text-[#FAF8F5] p-4 flex justify-between items-center select-none">
                <div className="flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-[#FAF8F5]/80 animate-pulse" />
                  <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase">Pratinjau Struk Digital</span>
                </div>
                <button
                  id="btn-close-receipt-modal"
                  onClick={() => setActiveReceiptForPrinting(null)}
                  className="p-1 text-white/75 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="p-3.5 bg-brand-cream/30 border-b border-brand-green/10 grid grid-cols-2 gap-2 text-center text-xs">
                <button
                  id="btn-receipt-modal-print"
                  onClick={() => handlePrintReceipt(activeReceiptForPrinting)}
                  className="bg-brand-green hover:bg-brand-green-light text-white py-2 px-3 rounded-lg font-bold uppercase text-[9.5px] tracking-wide cursor-pointer flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Struk POS
                </button>
                <button
                  id="btn-receipt-modal-download"
                  onClick={() => handleDownloadTxtReceipt(activeReceiptForPrinting)}
                  className="bg-brand-brown hover:bg-brand-brown-light text-[#FAF8F5] py-2 px-3 rounded-lg font-bold uppercase text-[9.5px] tracking-wide cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <FileText className="w-3.5 h-3.5" /> Unduh Struk.txt
                </button>
              </div>

              {/* Physical Receipt replica paper body */}
              <div className="p-5 bg-brand-cream-light/35 flex justify-center">
                <div 
                  id={`thermal-receipt-${activeReceiptForPrinting.id}`}
                  className="w-full bg-white border border-brand-green/10 p-5 font-mono text-[10.5px] leading-relaxed shadow-sm rounded-xl relative overflow-hidden"
                  style={{ fontFamily: "'Courier New', Courier, monospace" }}
                >
                  {/* Jagged tear paper decoration */}
                  <div className="absolute top-0 inset-x-0 h-1 space-x-1 flex justify-center opacity-40 select-none">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 bg-brand-cream-light border-brand-green/5 rotate-45 transform -translate-y-1.5" />
                    ))}
                  </div>

                  <div className="text-center pt-2 select-none">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-brown">OUTPOST COFFEE</h3>
                    <p className="text-[9px] text-brand-brown/70 font-bold">Slow Bar & Handcrafted Coffee</p>
                    <p className="text-[8px] text-brand-brown/50 mt-1">Jl. Harmonika Baru, Medan</p>
                    <p className="text-[8px] text-brand-brown/50">ig @outpost_coffee</p>
                  </div>

                  <div className="border-t border-dashed border-brand-brown/15 my-3" />

                  <div className="space-y-0.5 text-[9px] text-brand-brown/80">
                    <div className="flex justify-between">
                      <span>No Transaksi:</span>
                      <span className="font-bold text-brand-green">#{activeReceiptForPrinting.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Metode:</span>
                      <span className="font-bold">{activeReceiptForPrinting.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waktu:</span>
                      <span>{activeReceiptForPrinting.timestamp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pelanggan:</span>
                      <span className="font-bold">{activeReceiptForPrinting.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meja/Antrean:</span>
                      <span className="font-bold">{activeReceiptForPrinting.tableNumberOrType}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-brand-brown/15 my-3" />
                  <div className="text-center font-bold text-[9px] text-brand-brown/60 uppercase tracking-widest bg-brand-cream/20 py-0.5 rounded">Rincian Seduhan</div>
                  <div className="border-t border-dashed border-brand-brown/15 my-3" />

                  <div className="space-y-3.5">
                    {activeReceiptForPrinting.items.map((cartItem, idx) => (
                      <div key={idx} className="space-y-0.5 text-xs">
                        <div className="flex justify-between items-start gap-2 text-[10.5px]">
                          <span className="font-bold leading-tight text-brand-brown">{cartItem.item.name}</span>
                          <span className="shrink-0 font-bold text-brand-brown/60">x{cartItem.quantity}</span>
                        </div>
                        {cartItem.temperature && cartItem.temperature !== 'Normal' && (
                          <div className="text-[8.5px] text-brand-brown/50 pl-2">• Suhu: {cartItem.temperature}</div>
                        )}
                        {cartItem.sugarLevel && cartItem.sugarLevel !== 'Normal' && (
                          <div className="text-[8.5px] text-brand-brown/50 pl-2">• Gula: {cartItem.sugarLevel}</div>
                        )}
                        {cartItem.notes && (
                          <div className="text-[8px] text-brand-brown/60 italic pl-2 pr-1 break-words leading-tight bg-brand-cream/15 p-1 rounded mt-0.5">* "{cartItem.notes}"</div>
                        )}
                        <div className="text-right text-[10px] font-bold text-brand-brown/85">
                          Rp {(cartItem.item.price * cartItem.quantity).toLocaleString('id-ID')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-dashed border-brand-brown/15 my-3.5" />
                  
                  <div className="space-y-1 text-[9px] text-brand-brown/70">
                    <div className="flex justify-between">
                      <span>Pembayaran:</span>
                      <span className="font-bold uppercase">{activeReceiptForPrinting.paymentMethod === 'Bank Transfer' ? `TF - ${bankAccountName}` : activeReceiptForPrinting.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-extrabold underline text-brand-green">{activeReceiptForPrinting.status.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="border-t-2 border-double border-brand-brown/15 my-3.5" />

                  <div className="flex justify-between text-[11px] font-black bg-brand-cream/15 p-1.5 rounded items-center">
                    <span>TOTAL TAGIHAN:</span>
                    <span className="text-brand-green font-mono text-xs font-black">Rp {activeReceiptForPrinting.totalAmount.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="border-t-2 border-double border-brand-brown/15 my-3.5" />

                  <div className="text-center space-y-1 text-brand-brown/50" style={{ fontSize: "7.5px" }}>
                    <p className="font-bold uppercase tracking-wider text-brand-brown/70 text-[8px]">☕ Terimakasih ☕</p>
                    <p>Seduhan terbaik disiapkan dengan dedikasi tinggi.</p>
                    <p>Simpan tanda bukti ini sebagai rekap belanja Anda.</p>
                    <p className="font-bold tracking-widest text-brand-green opacity-70 mt-1.5 uppercase text-[7px]" style={{ letterSpacing: "1.5px" }}>Outpost Coffee Slow-Bar</p>
                  </div>

                  {/* Jagged tear paper decoration - bottom */}
                  <div className="absolute bottom-0 inset-x-0 h-1 space-x-1 flex justify-center opacity-40 select-none">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 bg-[#FAF9F5] rotate-45 transform translate-y-1.5" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Small dismiss button on footer */}
              <div className="p-4 bg-gray-50 border-t border-brand-green/5 text-center flex justify-center">
                <button
                  id="btn-receipt-modal-dismiss"
                  onClick={() => setActiveReceiptForPrinting(null)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-brand-brown rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer"
                >
                  Kembali ke Portal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        </motion.div>
      )}

      {/* CUSTOM CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {customConfirm.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white border border-brand-green/10 w-full max-w-sm rounded-3xl p-6 shadow-xl space-y-4 text-left"
            >
              <div className="space-y-2">
                <h4 className="font-serif text-base font-black text-[#2B1E17] tracking-tight">
                  {customConfirm.title}
                </h4>
                <p className="text-xs text-brand-brown/75 leading-relaxed font-medium">
                  {customConfirm.message}
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomConfirm(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 border border-brand-green/10 hover:bg-brand-cream/30 text-brand-brown font-bold py-2 rounded-xl text-xs uppercase cursor-pointer transition"
                >
                  {customConfirm.cancelText || 'Batal'}
                </button>
                <button
                  type="button"
                  onClick={customConfirm.onConfirm}
                  className={`flex-1 font-bold py-2 rounded-xl text-xs uppercase transition text-white cursor-pointer ${
                    customConfirm.isDanger 
                      ? 'bg-rose-600 hover:bg-rose-700' 
                      : 'bg-brand-green hover:bg-brand-green-light'
                  }`}
                >
                  {customConfirm.confirmText || 'Yakin'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
