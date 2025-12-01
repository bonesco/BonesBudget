import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingDown, TrendingUp, DollarSign, CreditCard, Lightbulb, Target, Calendar, Plus, ChevronRight, CheckCircle2, AlertCircle, Sparkles, X, Trash2, LayoutDashboard, Receipt, Map, Brain, Settings, Edit3, Save, History, PartyPopper, Cloud, CloudOff } from 'lucide-react';

// ============ ANIMATED NUMBER COMPONENT ============
function AnimatedNumber({ value, duration = 500, prefix = '', suffix = '' }: { value: number; duration?: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{prefix}{Math.round(displayValue).toLocaleString()}{suffix}</>;
}

// ============ CONFETTI COMPONENT ============
function Confetti({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      color: string; size: number; rotation: number; rotationSpeed: number;
    }> = [];

    const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

    // Create particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    let animationId: number;
    let frame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      frame++;
      if (frame < 180) {
        animationId = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
}

// ============ TOAST NOTIFICATION ============
function Toast({ message, visible, type = 'success' }: { message: string; visible: boolean; type?: 'success' | 'info' }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '12px 20px',
      backgroundColor: type === 'success' ? '#10b981' : '#3b82f6',
      color: '#ffffff',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      transform: visible ? 'translateY(0)' : 'translateY(100px)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s ease',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <CheckCircle2 style={{ width: '16px', height: '16px' }} />
      {message}
    </div>
  );
}

// Types
interface Payment {
  id: number;
  debtId: number;
  debtName: string;
  amount: number;
  date: string;
  note?: string;
}

interface Debt {
  id: number;
  name: string;
  balance: number;
  originalBalance: number;
  rate: number;
  minPayment: number;
  promoEnd?: string;
  priority: number;
  payoffDate?: string;
  color: string;
}

interface Expense {
  id: number;
  name: string;
  amount: number;
  category: string;
  recurring: boolean;
}

interface AITip {
  type: 'urgent' | 'strategy' | 'tip' | 'opportunity';
  title: string;
  description: string;
  savings: string;
}

// Default data
const defaultDebts: Debt[] = [
  { id: 1, name: 'CareCredit', balance: 8600, originalBalance: 8600, rate: 32.99, minPayment: 300, promoEnd: '2026-04-24', priority: 1, payoffDate: 'Sep 2026', color: '#dc2626' },
  { id: 2, name: 'USAA', balance: 22500, originalBalance: 22500, rate: 19.15, minPayment: 700, priority: 3, payoffDate: 'Aug 2027', color: '#ea580c' },
  { id: 3, name: 'EnerBank', balance: 11512, originalBalance: 11512, rate: 19.99, minPayment: 250, priority: 4, payoffDate: 'Feb 2028', color: '#ca8a04' },
  { id: 4, name: 'RoundPoint HELOC', balance: 69000, originalBalance: 69000, rate: 10.24, minPayment: 600, priority: 2, payoffDate: 'Mar 2031', color: '#16a34a' },
  { id: 5, name: 'Flagstar Mortgage', balance: 195000, originalBalance: 195000, rate: 3.49, minPayment: 1700, priority: 5, payoffDate: 'Oct 2036', color: '#2563eb' },
];

const defaultExpenses: Expense[] = [
  { id: 1, name: 'Mortgage', amount: 1700, category: 'Housing', recurring: true },
  { id: 2, name: 'HELOC Loan', amount: 600, category: 'Debt', recurring: true },
  { id: 3, name: 'USAA', amount: 700, category: 'Debt', recurring: true },
  { id: 4, name: 'EnerBank (Sewer)', amount: 250, category: 'Debt', recurring: true },
  { id: 5, name: 'CareCredit', amount: 300, category: 'Debt', recurring: true },
  { id: 6, name: 'Groceries', amount: 1000, category: 'Food', recurring: true },
  { id: 7, name: 'Phone Bill', amount: 260, category: 'Utilities', recurring: true },
  { id: 8, name: 'MUD', amount: 205, category: 'Utilities', recurring: true },
  { id: 9, name: 'OPPD', amount: 180, category: 'Utilities', recurring: true },
  { id: 10, name: 'Gas', amount: 200, category: 'Transportation', recurring: true },
  { id: 11, name: 'Prescriptions', amount: 150, category: 'Health', recurring: true },
  { id: 12, name: 'Internet', amount: 110, category: 'Utilities', recurring: true },
  { id: 13, name: 'Car Insurance', amount: 100, category: 'Transportation', recurring: true },
  { id: 14, name: 'Jazzercise', amount: 100, category: 'Health', recurring: true },
  { id: 15, name: 'Hulu', amount: 100, category: 'Entertainment', recurring: true },
  { id: 16, name: 'Patricia', amount: 130, category: 'Personal', recurring: true },
  { id: 17, name: 'Spotify', amount: 16, category: 'Entertainment', recurring: true },
  { id: 18, name: 'Greenlights', amount: 5, category: 'Subscriptions', recurring: true },
];

const categoryColors: Record<string, string> = {
  Housing: '#3b82f6',
  Debt: '#ef4444',
  Food: '#22c55e',
  Utilities: '#f97316',
  Transportation: '#8b5cf6',
  Health: '#ec4899',
  Entertainment: '#06b6d4',
  Personal: '#eab308',
  Subscriptions: '#6366f1',
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'debts', label: 'Debts', icon: CreditCard },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'plan', label: 'Payoff Plan', icon: Map },
  { id: 'insights', label: 'AI Insights', icon: Brain },
];

// Import Firebase helpers
import { isFirebaseConfigured, saveToFirestore, subscribeToFirestore } from './firebase';

// Unique family ID - change this to create separate "accounts"
const FAMILY_ID = 'bones-family';

// Helper to load from localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Helper to save to localStorage (and Firestore if configured)
function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Also save to Firestore if configured
    if (isFirebaseConfigured()) {
      saveToFirestore('budgets', `${FAMILY_ID}-${key}`, value);
    }
  } catch (e) {
    console.error('Failed to save:', e);
  }
}

// Generate dynamic AI tips based on actual debt data
function generateAITips(debts: Debt[], expenses: Expense[], extraPayment: number): AITip[] {
  const tips: AITip[] = [];
  const sortedByRate = [...debts].sort((a, b) => b.rate - a.rate);
  const highestRateDebt = sortedByRate[0];
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayments = debts.reduce((sum, d) => sum + d.minPayment, 0);

  // Check for promotional rate debts expiring soon
  const promoDebts = debts.filter(d => d.promoEnd);
  promoDebts.forEach(debt => {
    const promoDate = new Date(debt.promoEnd!);
    const now = new Date();
    const monthsUntilExpiry = (promoDate.getFullYear() - now.getFullYear()) * 12 + (promoDate.getMonth() - now.getMonth());

    if (monthsUntilExpiry <= 18 && monthsUntilExpiry > 0) {
      const monthlyPaymentNeeded = Math.ceil(debt.balance / monthsUntilExpiry);
      const potentialInterest = Math.round(debt.balance * (debt.rate / 100) * (monthsUntilExpiry / 12));
      tips.push({
        type: 'urgent',
        title: `${debt.name} Promotional Rate Ends ${promoDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
        description: `Pay off the $${debt.balance.toLocaleString()} before the promotional rate expires to avoid ${debt.rate}% deferred interest. You need ~$${monthlyPaymentNeeded.toLocaleString()}/month to pay it off in time.`,
        savings: `$${potentialInterest.toLocaleString()} in potential interest avoided`
      });
    }
  });

  // Avalanche method recommendation
  if (highestRateDebt && highestRateDebt.rate > 10) {
    const monthlyInterest = Math.round(highestRateDebt.balance * (highestRateDebt.rate / 100) / 12);
    tips.push({
      type: 'strategy',
      title: `Focus on ${highestRateDebt.name} (${highestRateDebt.rate}% APR)`,
      description: `This is your highest interest debt. Every month you carry this balance, you're losing $${monthlyInterest.toLocaleString()} to interest. Direct your extra $${extraPayment}/month here for maximum savings.`,
      savings: `$${(monthlyInterest * 12).toLocaleString()}+ potential annual savings`
    });
  }

  // Check for interest-only payments (HELOC alert)
  debts.forEach(debt => {
    const monthlyInterest = debt.balance * (debt.rate / 100) / 12;
    if (monthlyInterest > debt.minPayment * 0.8) {
      tips.push({
        type: 'tip',
        title: `${debt.name} - Mostly Interest Payments`,
        description: `Your $${debt.minPayment}/month payment is ${Math.round((monthlyInterest / debt.minPayment) * 100)}% interest. Consider adding principal payments when higher-rate debts are cleared to reduce payoff time.`,
        savings: 'Could reduce payoff by 3-5+ years'
      });
    }
  });

  // Subscription audit
  const subscriptions = expenses.filter(e =>
    e.category === 'Entertainment' || e.category === 'Subscriptions'
  );
  const totalSubscriptions = subscriptions.reduce((sum, e) => sum + e.amount, 0);
  if (totalSubscriptions > 100) {
    tips.push({
      type: 'opportunity',
      title: 'Subscription Audit',
      description: `You have $${totalSubscriptions}/month in subscriptions/entertainment (${subscriptions.map(s => s.name).join(', ')}). Review if all are needed—even $50/month extra toward debt accelerates payoff significantly.`,
      savings: `$${(totalSubscriptions * 12).toLocaleString()}/year potential reallocation`
    });
  }

  // Extra payment impact
  if (extraPayment > 0) {
    const yearsWithExtra = Math.ceil(totalDebt / ((totalMinPayments + extraPayment) * 12));
    const yearsWithoutExtra = Math.ceil(totalDebt / (totalMinPayments * 12));
    const yearsSaved = yearsWithoutExtra - yearsWithExtra;
    if (yearsSaved > 0) {
      tips.push({
        type: 'strategy',
        title: `Your Extra $${extraPayment}/Month Is Making a Difference`,
        description: `By paying $${extraPayment} extra each month, you're on track to be debt-free approximately ${yearsSaved} year${yearsSaved > 1 ? 's' : ''} sooner than if you paid minimums only.`,
        savings: `${yearsSaved}+ years of payments saved`
      });
    }
  }

  // Debt-to-income check
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const debtExpenses = expenses.filter(e => e.category === 'Debt').reduce((sum, e) => sum + e.amount, 0);
  const debtRatio = Math.round((debtExpenses / totalExpenses) * 100);
  if (debtRatio > 30) {
    tips.push({
      type: 'tip',
      title: 'Debt Payments Are High',
      description: `${debtRatio}% of your monthly expenses go to debt payments ($${debtExpenses.toLocaleString()} of $${totalExpenses.toLocaleString()}). This is above the recommended 30%. The good news: each debt you eliminate frees up significant cash flow.`,
      savings: 'Stay the course - it gets easier!'
    });
  }

  // Quick wins based on debt amounts
  const smallDebts = debts.filter(d => d.balance < 5000 && d.balance > 0);
  if (smallDebts.length > 0) {
    const smallest = [...smallDebts].sort((a, b) => a.balance - b.balance)[0];
    const monthsToPayoff = Math.ceil(smallest.balance / (smallest.minPayment + extraPayment));
    tips.push({
      type: 'opportunity',
      title: `Quick Win: ${smallest.name}`,
      description: `This $${smallest.balance.toLocaleString()} balance could be eliminated in ~${monthsToPayoff} months with your current strategy. Paying this off will free up $${smallest.minPayment}/month for your next target!`,
      savings: `$${smallest.minPayment}/month freed up`
    });
  }

  return tips.slice(0, 6); // Return top 6 most relevant tips
}

export default function DebtTracker() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [debts, setDebts] = useState<Debt[]>(() => loadFromStorage('debts', defaultDebts));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage('expenses', defaultExpenses));
  const [extraPayment, setExtraPayment] = useState<number>(() => loadFromStorage('extraPayment', 500));
  const [payments, setPayments] = useState<Payment[]>(() => loadFromStorage('payments', []));
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', rate: '', minPayment: '' });
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: 'Personal' });
  const [newPayment, setNewPayment] = useState({ debtId: '', amount: '', note: '' });
  const [editingDebt, setEditingDebt] = useState<number | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'info' });
  const [milestoneReached, setMilestoneReached] = useState<string | null>(null);

  // Show toast helper
  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }, []);

  // Check for milestones
  const checkMilestones = useCallback((oldTotal: number, newTotal: number, originalTotal: number) => {
    const oldPercent = Math.floor((1 - oldTotal / originalTotal) * 100);
    const newPercent = Math.floor((1 - newTotal / originalTotal) * 100);

    const milestones = [25, 50, 75, 100];
    for (const milestone of milestones) {
      if (oldPercent < milestone && newPercent >= milestone) {
        setMilestoneReached(`${milestone}% of debt eliminated!`);
        setShowConfetti(true);
        return;
      }
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => { saveToStorage('debts', debts); }, [debts]);
  useEffect(() => { saveToStorage('expenses', expenses); }, [expenses]);
  useEffect(() => { saveToStorage('extraPayment', extraPayment); }, [extraPayment]);
  useEffect(() => { saveToStorage('payments', payments); }, [payments]);

  // Subscribe to Firestore updates for real-time sync
  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    const unsubDebts = subscribeToFirestore<Debt[]>('budgets', `${FAMILY_ID}-debts`, (data) => {
      if (data) setDebts(data);
    });
    const unsubExpenses = subscribeToFirestore<Expense[]>('budgets', `${FAMILY_ID}-expenses`, (data) => {
      if (data) setExpenses(data);
    });
    const unsubExtra = subscribeToFirestore<number>('budgets', `${FAMILY_ID}-extraPayment`, (data) => {
      if (data !== null) setExtraPayment(data);
    });
    const unsubPayments = subscribeToFirestore<Payment[]>('budgets', `${FAMILY_ID}-payments`, (data) => {
      if (data) setPayments(data);
    });

    return () => {
      unsubDebts();
      unsubExpenses();
      unsubExtra();
      unsubPayments();
    };
  }, []);

  const totalDebt = useMemo(() => debts.reduce((sum, d) => sum + d.balance, 0), [debts]);
  const totalMinPayments = useMemo(() => debts.reduce((sum, d) => sum + d.minPayment, 0), [debts]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const monthlyInterest = useMemo(() => debts.reduce((sum, d) => sum + (d.balance * (d.rate / 100) / 12), 0), [debts]);

  // Generate dynamic AI tips
  const aiTips = useMemo(() => generateAITips(debts, expenses, extraPayment), [debts, expenses, extraPayment]);

  const expensesByCategory = useMemo(() => {
    const grouped: Record<string, number> = {};
    expenses.forEach(e => {
      grouped[e.category] = (grouped[e.category] || 0) + e.amount;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value, color: categoryColors[name] || '#525252' }));
  }, [expenses]);

  // Calculate payoff timeline dynamically
  const payoffTimeline = useMemo(() => {
    const timeline: { month: string; debt: string; amount: number }[] = [];
    const debtsCopy = debts.map(d => ({ ...d }));
    let currentDate = new Date();

    const sortedDebts = [...debtsCopy].sort((a, b) => a.priority - b.priority);

    sortedDebts.forEach(debt => {
      if (debt.balance <= 0) return;

      const monthlyInterestRate = debt.rate / 100 / 12;
      let balance = debt.balance;
      let months = 0;
      const payment = debt.minPayment + (debt.priority === 1 ? extraPayment : 0);

      while (balance > 0 && months < 240) {
        const interest = balance * monthlyInterestRate;
        const principal = Math.min(payment - interest, balance);
        balance -= principal;
        months++;
      }

      const payoffDate = new Date(currentDate);
      payoffDate.setMonth(payoffDate.getMonth() + months);

      timeline.push({
        month: payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        debt: debt.name,
        amount: debt.balance
      });
    });

    return timeline;
  }, [debts, extraPayment]);

  const projectedPayoff = useMemo(() => {
    const months: { month: string; balance: number; paid: number }[] = [];
    let remaining = totalDebt;
    const monthlyPayment = totalMinPayments + extraPayment;
    for (let i = 0; i <= 120 && remaining > 0; i += 12) {
      months.push({ month: `Year ${i/12}`, balance: Math.max(0, remaining), paid: totalDebt - remaining });
      remaining -= (monthlyPayment * 12) - (remaining * 0.08);
    }
    return months;
  }, [totalDebt, totalMinPayments, extraPayment]);

  const handleAddDebt = () => {
    if (newDebt.name && newDebt.balance && newDebt.rate && newDebt.minPayment) {
      const colors = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#7c3aed', '#db2777'];
      setDebts([...debts, {
        id: Date.now(),
        name: newDebt.name,
        balance: parseFloat(newDebt.balance),
        originalBalance: parseFloat(newDebt.balance),
        rate: parseFloat(newDebt.rate),
        minPayment: parseFloat(newDebt.minPayment),
        priority: debts.length + 1,
        color: colors[debts.length % colors.length]
      }]);
      setNewDebt({ name: '', balance: '', rate: '', minPayment: '' });
      setShowAddDebt(false);
    }
  };

  const handleAddExpense = () => {
    if (newExpense.name && newExpense.amount) {
      setExpenses([...expenses, {
        id: Date.now(),
        name: newExpense.name,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        recurring: true
      }]);
      setNewExpense({ name: '', amount: '', category: 'Personal' });
      setShowAddExpense(false);
    }
  };

  const handleAddPayment = () => {
    if (newPayment.debtId && newPayment.amount) {
      const debtId = parseInt(newPayment.debtId);
      const amount = parseFloat(newPayment.amount);
      const debt = debts.find(d => d.id === debtId);

      if (debt) {
        const oldTotal = totalDebt;
        const newBalance = Math.max(0, debt.balance - amount);
        const originalTotal = debts.reduce((sum, d) => sum + d.originalBalance, 0);

        // Add payment record
        setPayments([...payments, {
          id: Date.now(),
          debtId,
          debtName: debt.name,
          amount,
          date: new Date().toISOString(),
          note: newPayment.note || undefined
        }]);

        // Update debt balance
        setDebts(debts.map(d =>
          d.id === debtId ? { ...d, balance: newBalance } : d
        ));

        // Check if debt is paid off
        if (newBalance === 0 && debt.balance > 0) {
          setMilestoneReached(`${debt.name} is PAID OFF!`);
          setShowConfetti(true);
        } else {
          // Check for percentage milestones
          const newTotal = oldTotal - amount;
          checkMilestones(oldTotal, newTotal, originalTotal);
        }

        showToast(`Payment of $${amount.toLocaleString()} recorded!`);
        setNewPayment({ debtId: '', amount: '', note: '' });
        setShowAddPayment(false);
      }
    }
  };

  const handleUpdateBalance = (debtId: number) => {
    if (editBalance) {
      const debt = debts.find(d => d.id === debtId);
      const newBalance = parseFloat(editBalance);

      if (debt) {
        const oldTotal = totalDebt;
        const originalTotal = debts.reduce((sum, d) => sum + d.originalBalance, 0);
        const paymentAmount = debt.balance - newBalance;

        // Log as a payment if balance decreased
        if (paymentAmount > 0) {
          setPayments([...payments, {
            id: Date.now(),
            debtId,
            debtName: debt.name,
            amount: paymentAmount,
            date: new Date().toISOString(),
            note: 'Balance update'
          }]);

          // Check if debt is paid off
          if (newBalance === 0 && debt.balance > 0) {
            setMilestoneReached(`${debt.name} is PAID OFF!`);
            setShowConfetti(true);
          } else {
            const newTotal = debts.reduce((sum, d) => sum + (d.id === debtId ? newBalance : d.balance), 0);
            checkMilestones(oldTotal, newTotal, originalTotal);
          }

          showToast(`Balance updated! $${paymentAmount.toLocaleString()} payment recorded.`);
        }

        setDebts(debts.map(d =>
          d.id === debtId ? { ...d, balance: newBalance } : d
        ));
      }
    }
    setEditingDebt(null);
    setEditBalance('');
  };

  const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);

  return (
    <div className="flex min-h-screen" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif', backgroundColor: '#000000', color: '#e5e5e5' }}>
      {/* Confetti Effect */}
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Toast Notification */}
      <Toast message={toast.message} visible={toast.visible} type={toast.type} />

      {/* Milestone Modal */}
      {milestoneReached && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setMilestoneReached(null)}>
          <div style={{
            backgroundColor: '#0a0a0a',
            borderRadius: '24px',
            padding: '48px',
            textAlign: 'center',
            border: '1px solid #262626',
            maxWidth: '400px',
            animation: 'scaleIn 0.3s ease'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
            }}>
              <PartyPopper style={{ width: '40px', height: '40px', color: '#ffffff' }} />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fafafa', margin: '0 0 12px' }}>
              Congratulations!
            </h2>
            <p style={{ fontSize: '18px', color: '#10b981', fontWeight: '600', margin: '0 0 24px' }}>
              {milestoneReached}
            </p>
            <p style={{ fontSize: '14px', color: '#737373', margin: '0 0 24px' }}>
              Keep up the amazing work! You're making incredible progress on your debt-free journey.
            </p>
            <button
              onClick={() => setMilestoneReached(null)}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(90deg, #059669, #10b981)',
                borderRadius: '12px',
                border: 'none',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showPaymentHistory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowPaymentHistory(false)}>
          <div style={{
            backgroundColor: '#0a0a0a',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid #262626'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fafafa', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History style={{ width: '20px', height: '20px', color: '#10b981' }} />
                Payment History
              </h3>
              <button onClick={() => setShowPaymentHistory(false)} style={{ background: 'none', border: 'none', color: '#525252', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
            {payments.length === 0 ? (
              <p style={{ color: '#525252', textAlign: 'center', padding: '40px 0' }}>No payments recorded yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[...payments].reverse().map(payment => (
                  <div key={payment.id} style={{
                    backgroundColor: '#141414',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #262626'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontWeight: '500', color: '#fafafa', margin: '0 0 4px' }}>{payment.debtName}</p>
                        <p style={{ fontSize: '12px', color: '#525252', margin: 0 }}>
                          {new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {payment.note && <p style={{ fontSize: '12px', color: '#737373', margin: '4px 0 0', fontStyle: 'italic' }}>{payment.note}</p>}
                      </div>
                      <p style={{ fontFamily: 'ui-monospace, monospace', fontWeight: '600', color: '#10b981', margin: 0 }}>
                        ${payment.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #262626' }}>
              <p style={{ fontSize: '14px', color: '#737373', margin: 0 }}>
                Total Paid: <span style={{ color: '#10b981', fontWeight: '600' }}>${payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 60,
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          backgroundColor: '#141414',
          border: '1px solid #262626',
          color: '#fafafa',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        className="mobile-menu-btn"
      >
        {sidebarOpen ? <X size={20} /> : <LayoutDashboard size={20} />}
      </button>

      {/* Sidebar */}
      <aside style={{
        width: '256px',
        backgroundColor: '#0a0a0a',
        borderRight: '1px solid #171717',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100%',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        zIndex: 50
      }} className="sidebar">
        {/* Logo */}
        <div style={{ padding: '24px', borderBottom: '1px solid #171717' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #059669, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)' }}>
              <TrendingDown style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#fafafa', letterSpacing: '-0.025em', margin: 0 }}>BonesBudget</h1>
              <p style={{ fontSize: '10px', color: '#525252', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Financial Freedom</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: isActive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
                    background: isActive ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.08))' : 'transparent',
                    color: isActive ? '#10b981' : '#737373',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#141414';
                      e.currentTarget.style.color = '#e5e5e5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#737373';
                    }
                  }}
                >
                  <Icon style={{ width: '20px', height: '20px' }} />
                  {item.label}
                  {item.id === 'insights' && aiTips.some(t => t.type === 'urgent') && (
                    <span style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 2s infinite' }} />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid #171717' }}>
          <div style={{ background: 'linear-gradient(90deg, #141414, #171717)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>
                BB
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#fafafa', margin: 0 }}>Family Budget</p>
                <p style={{ fontSize: '12px', color: '#525252', margin: 0 }}>2 members</p>
              </div>
            </div>
            <div style={{ height: '6px', backgroundColor: '#262626', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.max(5, Math.round((1 - totalDebt / (defaultDebts.reduce((sum, d) => sum + d.originalBalance, 0))) * 100))}%`, background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
            </div>
            <p style={{ fontSize: '10px', color: '#525252', marginTop: '8px', marginBottom: 0 }}>
              {Math.round((1 - totalDebt / (defaultDebts.reduce((sum, d) => sum + d.originalBalance, 0))) * 100)}% debt eliminated
            </p>
          </div>
          <p style={{ fontSize: '10px', color: '#404040', textAlign: 'center', margin: 0 }}>
{isFirebaseConfigured() ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                <Cloud style={{ width: '12px', height: '12px' }} /> Synced to cloud
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CloudOff style={{ width: '12px', height: '12px' }} /> Local storage only
              </span>
            )}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: sidebarOpen ? '256px' : '0', transition: 'margin-left 0.3s ease' }} className="main-content">
        {/* Top Bar */}
        <header style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #171717' }}>
          <div style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fafafa', margin: 0 }}>
                {navItems.find(n => n.id === activeTab)?.label}
              </h2>
              <p style={{ fontSize: '14px', color: '#525252', margin: '4px 0 0 0' }}>
                {activeTab === 'dashboard' && 'Overview of your financial journey'}
                {activeTab === 'debts' && 'Manage and track all your debts'}
                {activeTab === 'expenses' && 'Track your monthly spending'}
                {activeTab === 'plan' && 'Your path to debt freedom'}
                {activeTab === 'insights' && 'AI-powered recommendations'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right', marginRight: '16px' }} className="hide-mobile">
                <p style={{ fontSize: '12px', color: '#525252', margin: 0 }}>Net Worth Goal</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#fafafa', margin: 0 }}>Debt Free by 2036</p>
              </div>
              <button style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#141414', border: '1px solid #262626', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#525252', cursor: 'pointer' }}>
                <Settings style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
          </div>
        </header>

        <div style={{ padding: '32px' }} className="content-padding">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowAddPayment(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: 'linear-gradient(90deg, #059669, #10b981)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} /> Log Payment
                </button>
                <button
                  onClick={() => setShowPaymentHistory(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#141414',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: '1px solid #262626',
                    color: '#a3a3a3',
                    cursor: 'pointer'
                  }}
                >
                  <History style={{ width: '16px', height: '16px' }} /> Payment History ({payments.length})
                </button>
              </div>

              {/* Add Payment Modal */}
              {showAddPayment && (
                <div style={{ backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '24px', border: '1px solid #10b981' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontWeight: '600', color: '#fafafa', margin: 0 }}>Log a Payment</h3>
                    <button onClick={() => setShowAddPayment(false)} style={{ color: '#525252', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <X style={{ width: '20px', height: '20px' }} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                    <select
                      value={newPayment.debtId}
                      onChange={(e) => setNewPayment({...newPayment, debtId: e.target.value})}
                      style={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#fafafa', outline: 'none' }}
                    >
                      <option value="">Select Debt</option>
                      {debts.filter(d => d.balance > 0).map(debt => (
                        <option key={debt.id} value={debt.id}>{debt.name} (${debt.balance.toLocaleString()})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Payment Amount"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                      style={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#fafafa', outline: 'none' }}
                    />
                    <input
                      type="text"
                      placeholder="Note (optional)"
                      value={newPayment.note}
                      onChange={(e) => setNewPayment({...newPayment, note: e.target.value})}
                      style={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#fafafa', outline: 'none' }}
                    />
                  </div>
                  <button
                    onClick={handleAddPayment}
                    style={{ marginTop: '16px', width: '100%', padding: '12px', background: 'linear-gradient(90deg, #059669, #10b981)', borderRadius: '12px', fontSize: '14px', fontWeight: '500', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                  >
                    Record Payment
                  </button>
                </div>
              )}

              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '20px', border: '1px solid #171717' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#525252', backgroundColor: '#141414', padding: '4px 8px', borderRadius: '8px' }}>Total</span>
                  </div>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: '#fafafa', margin: 0, fontFamily: 'ui-monospace, monospace' }}>
                    $<AnimatedNumber value={totalDebt} />
                  </p>
                  <p style={{ fontSize: '12px', color: '#525252', marginTop: '4px', marginBottom: 0 }}>{debts.filter(d => d.balance > 0).length} active accounts</p>
                </div>

                <div style={{ backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '20px', border: '1px solid #171717' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign style={{ width: '20px', height: '20px', color: '#10b981' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '8px' }}>+${extraPayment} extra</span>
                  </div>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: '#fafafa', margin: 0, fontFamily: 'ui-monospace, monospace' }}>
                    $<AnimatedNumber value={totalMinPayments + extraPayment} />
                  </p>
                  <p style={{ fontSize: '12px', color: '#525252', marginTop: '4px', marginBottom: 0 }}>Monthly payments</p>
                </div>

                <div style={{ backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '20px', border: '1px solid #171717' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(249, 115, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp style={{ width: '20px', height: '20px', color: '#f97316' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)', padding: '4px 8px', borderRadius: '8px' }}>Interest</span>
                  </div>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: '#fafafa', margin: 0, fontFamily: 'ui-monospace, monospace' }}>
                    $<AnimatedNumber value={Math.round(monthlyInterest)} />
                  </p>
                  <p style={{ fontSize: '12px', color: '#525252', marginTop: '4px', marginBottom: 0 }}>Lost monthly to interest</p>
                </div>

                <div style={{ backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '20px', border: '1px solid #171717' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Target style={{ width: '20px', height: '20px', color: '#06b6d4' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.1)', padding: '4px 8px', borderRadius: '8px' }}>Paid</span>
                  </div>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: '#10b981', margin: 0, fontFamily: 'ui-monospace, monospace' }}>
                    $<AnimatedNumber value={payments.reduce((sum, p) => sum + p.amount, 0)} />
                  </p>
                  <p style={{ fontSize: '12px', color: '#525252', marginTop: '4px', marginBottom: 0 }}>Total payments logged</p>
                </div>
              </div>

              {/* Main Content Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* Debt Overview */}
                <div style={{ backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '24px', border: '1px solid #171717' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fafafa', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      <CreditCard style={{ width: '16px', height: '16px', color: '#525252' }} />
                      Debt Breakdown
                    </h3>
                    <button onClick={() => setActiveTab('debts')} style={{ fontSize: '12px', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      View all <ChevronRight style={{ width: '12px', height: '12px' }} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[...debts].sort((a, b) => a.priority - b.priority).slice(0, 5).map((debt) => (
                      <div key={debt.id}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: debt.color }} />
                            <span style={{ fontWeight: '500', color: '#fafafa', fontSize: '14px' }}>{debt.name}</span>
                            {debt.priority === 1 && (
                              <span style={{ padding: '2px 8px', borderRadius: '999px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '10px', fontWeight: '500', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                FOCUS
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '12px', color: '#525252' }}>{debt.rate}% APR</span>
                            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '14px', color: '#fafafa' }}>{formatCurrency(debt.balance)}</span>
                          </div>
                        </div>
                        <div style={{ height: '8px', backgroundColor: '#171717', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: '999px', transition: 'all 0.5s', width: `${Math.max(2, (1 - debt.balance / debt.originalBalance) * 100)}%`, backgroundColor: debt.color }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#404040' }}>
                          <span>{formatCurrency(debt.minPayment)}/mo minimum</span>
                          <span>{Math.round((1 - debt.balance / debt.originalBalance) * 100)}% paid</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expense Breakdown */}
                <div style={{ backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '24px', border: '1px solid #171717' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fafafa', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      <Receipt style={{ width: '16px', height: '16px', color: '#525252' }} />
                      Monthly Spending
                    </h3>
                  </div>
                  <div style={{ height: '176px', marginBottom: '16px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={expensesByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(value as number)}
                          contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px', fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#fafafa' }}
                          itemStyle={{ color: '#fafafa' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ textAlign: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #171717' }}>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: '#fafafa', margin: 0, fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(totalExpenses)}</p>
                    <p style={{ fontSize: '12px', color: '#525252', marginTop: '4px', marginBottom: 0 }}>Total Monthly</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '144px', overflowY: 'auto' }}>
                    {[...expensesByCategory].sort((a, b) => b.value - a.value).map((cat) => (
                      <div key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', padding: '4px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color }} />
                          <span style={{ color: '#737373', fontSize: '12px' }}>{cat.name}</span>
                        </div>
                        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '12px', color: '#fafafa' }}>{formatCurrency(cat.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Insights Banner */}
              {aiTips.length > 0 && (
                <div style={{ background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.08), rgba(139, 92, 246, 0.05), rgba(6, 182, 212, 0.08))', borderRadius: '16px', padding: '24px', border: '1px solid rgba(124, 58, 237, 0.15)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '256px', height: '256px', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1), transparent)', borderRadius: '50%', filter: 'blur(40px)' }} />
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}>
                      <Sparkles style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontWeight: '600', color: '#fafafa', margin: 0, fontSize: '16px' }}>AI Insight</h3>
                        <span style={{ padding: '2px 8px', borderRadius: '999px', backgroundColor: aiTips[0].type === 'urgent' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: aiTips[0].type === 'urgent' ? '#ef4444' : '#10b981', fontSize: '10px', fontWeight: '500' }}>{aiTips[0].type.toUpperCase()}</span>
                      </div>
                      <p style={{ color: '#a3a3a3', fontSize: '14px', marginBottom: '12px', lineHeight: '1.6', marginTop: '8px' }}>{aiTips[0].description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <DollarSign style={{ width: '16px', height: '16px' }} />
                          {aiTips[0].savings}
                        </span>
                        <button onClick={() => setActiveTab('insights')} style={{ color: '#8b5cf6', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                          View all insights <ChevronRight style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Debts Tab */}
          {activeTab === 'debts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <p style={{ color: '#525252', fontSize: '14px', margin: 0 }}>Total Outstanding</p>
                  <p style={{ fontSize: '32px', fontWeight: '700', color: '#fafafa', margin: '4px 0 0 0', fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(totalDebt)}</p>
                </div>
                <button onClick={() => setShowAddDebt(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(90deg, #059669, #10b981)', borderRadius: '12px', fontSize: '14px', fontWeight: '500', border: 'none', color: '#ffffff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                  <Plus style={{ width: '16px', height: '16px' }} /> Add Debt
                </button>
              </div>

              {showAddDebt && (
                <div style={{ backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '24px', border: '1px solid #262626' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontWeight: '600', color: '#fafafa', margin: 0 }}>Add New Debt</h3>
                    <button onClick={() => setShowAddDebt(false)} style={{ color: '#525252', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <X style={{ width: '20px', height: '20px' }} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                    <input type="text" placeholder="Debt Name" value={newDebt.name} onChange={(e) => setNewDebt({...newDebt, name: e.target.value})} style={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#fafafa', outline: 'none' }} />
                    <input type="number" placeholder="Balance" value={newDebt.balance} onChange={(e) => setNewDebt({...newDebt, balance: e.target.value})} style={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#fafafa', outline: 'none' }} />
                    <input type="number" placeholder="Interest Rate (%)" value={newDebt.rate} onChange={(e) => setNewDebt({...newDebt, rate: e.target.value})} style={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#fafafa', outline: 'none' }} />
                    <input type="number" placeholder="Min Payment" value={newDebt.minPayment} onChange={(e) => setNewDebt({...newDebt, minPayment: e.target.value})} style={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#fafafa', outline: 'none' }} />
                  </div>
                  <button onClick={handleAddDebt} style={{ marginTop: '16px', width: '100%', padding: '12px', background: 'linear-gradient(90deg, #059669, #10b981)', borderRadius: '12px', fontSize: '14px', fontWeight: '500', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                    Add Debt
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[...debts].sort((a, b) => a.priority - b.priority).map((debt) => (
                  <div key={debt.id} style={{ backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '24px', border: '1px solid #171717' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${debt.color}15`, flexShrink: 0 }}>
                          <CreditCard style={{ width: '28px', height: '28px', color: debt.color }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h3 style={{ fontWeight: '600', fontSize: '18px', color: '#fafafa', margin: 0 }}>{debt.name}</h3>
                            {debt.priority === 1 && (
                              <span style={{ padding: '2px 8px', borderRadius: '999px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '10px', fontWeight: '500', border: '1px solid rgba(239, 68, 68, 0.2)' }}>CURRENT FOCUS</span>
                            )}
                          </div>
                          <p style={{ color: '#525252', fontSize: '14px', marginTop: '4px', marginBottom: 0 }}>{debt.rate}% APR • {formatCurrency(debt.minPayment)}/month minimum</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {editingDebt === debt.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="number"
                              value={editBalance}
                              onChange={(e) => setEditBalance(e.target.value)}
                              placeholder={debt.balance.toString()}
                              style={{ width: '120px', backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px', padding: '8px 12px', fontSize: '16px', color: '#fafafa', outline: 'none', fontFamily: 'ui-monospace, monospace' }}
                              autoFocus
                            />
                            <button onClick={() => handleUpdateBalance(debt.id)} style={{ padding: '8px', backgroundColor: '#10b981', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Save style={{ width: '16px', height: '16px', color: '#ffffff' }} />
                            </button>
                            <button onClick={() => { setEditingDebt(null); setEditBalance(''); }} style={{ padding: '8px', backgroundColor: '#262626', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <X style={{ width: '16px', height: '16px', color: '#737373' }} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                              <p style={{ fontSize: '24px', fontWeight: '700', color: '#fafafa', margin: 0, fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(debt.balance)}</p>
                              <button onClick={() => { setEditingDebt(debt.id); setEditBalance(debt.balance.toString()); }} style={{ padding: '6px', backgroundColor: 'transparent', border: '1px solid #262626', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Update balance">
                                <Edit3 style={{ width: '14px', height: '14px', color: '#525252' }} />
                              </button>
                            </div>
                            <p style={{ fontSize: '14px', color: '#525252', marginTop: '4px', marginBottom: 0 }}>Payoff: {debt.payoffDate || 'Calculating...'}</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                        <span style={{ color: '#525252' }}>Progress</span>
                        <span style={{ color: '#525252' }}>{Math.round((1 - debt.balance / debt.originalBalance) * 100)}% paid</span>
                      </div>
                      <div style={{ height: '10px', backgroundColor: '#171717', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '999px', transition: 'all 0.5s', width: `${Math.max(2, (1 - debt.balance / debt.originalBalance) * 100)}%`, backgroundColor: debt.color }} />
                      </div>
                    </div>

                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #171717', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '32px', fontSize: '14px', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ color: '#404040' }}>Monthly Interest</span>
                          <span style={{ marginLeft: '8px', fontFamily: 'ui-monospace, monospace', color: '#f97316' }}>{formatCurrency(debt.balance * (debt.rate / 100) / 12)}</span>
                        </div>
                        <div>
                          <span style={{ color: '#404040' }}>Goes to Principal</span>
                          <span style={{ marginLeft: '8px', fontFamily: 'ui-monospace, monospace', color: '#10b981' }}>{formatCurrency(Math.max(0, debt.minPayment - (debt.balance * (debt.rate / 100) / 12)))}</span>
                        </div>
                      </div>
                      <button onClick={() => setDebts(debts.filter(d => d.id !== debt.id))} style={{ color: '#404040', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <p style={{ color: '#525252', fontSize: '14px', margin: 0 }}>Total Monthly Expenses</p>
                  <p style={{ fontSize: '32px', fontWeight: '700', color: '#fafafa', margin: '4px 0 0 0', fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(totalExpenses)}</p>
                </div>
                <button onClick={() => setShowAddExpense(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(90deg, #059669, #10b981)', borderRadius: '12px', fontSize: '14px', fontWeight: '500', border: 'none', color: '#ffffff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                  <Plus style={{ width: '16px', height: '16px' }} /> Add Expense
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div style={{ backgroundColor: '#0a0a0a', borderRadius: '12px', padding: '20px', border: '1px solid #171717' }}>
                  <p style={{ color: '#525252', fontSize: '14px', marginBottom: '4px', margin: 0 }}>Total Expenses</p>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#fafafa', margin: '8px 0 0 0', fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(totalExpenses)}</p>
                </div>
                <div style={{ backgroundColor: '#0a0a0a', borderRadius: '12px', padding: '20px', border: '1px solid #171717' }}>
                  <p style={{ color: '#525252', fontSize: '14px', marginBottom: '4px', margin: 0 }}>Debt Payments</p>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444', margin: '8px 0 0 0', fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(totalMinPayments)}</p>
                </div>
                <div style={{ backgroundColor: '#0a0a0a', borderRadius: '12px', padding: '20px', border: '1px solid #171717' }}>
                  <p style={{ color: '#525252', fontSize: '14px', marginBottom: '4px', margin: 0 }}>Living Expenses</p>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#10b981', margin: '8px 0 0 0', fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(totalExpenses - totalMinPayments)}</p>
                </div>
              </div>

              {showAddExpense && (
                <div style={{ backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '24px', border: '1px solid #262626' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontWeight: '600', color: '#fafafa', margin: 0 }}>Add New Expense</h3>
                    <button onClick={() => setShowAddExpense(false)} style={{ color: '#525252', background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: '20px', height: '20px' }} /></button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                    <input type="text" placeholder="Expense Name" value={newExpense.name} onChange={(e) => setNewExpense({...newExpense, name: e.target.value})} style={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#fafafa', outline: 'none' }} />
                    <input type="number" placeholder="Amount" value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} style={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#fafafa', outline: 'none' }} />
                    <select value={newExpense.category} onChange={(e) => setNewExpense({...newExpense, category: e.target.value})} style={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#fafafa', outline: 'none' }}>
                      {Object.keys(categoryColors).map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                  </div>
                  <button onClick={handleAddExpense} style={{ marginTop: '16px', width: '100%', padding: '12px', background: 'linear-gradient(90deg, #059669, #10b981)', borderRadius: '12px', fontSize: '14px', fontWeight: '500', border: 'none', color: '#ffffff', cursor: 'pointer' }}>Add Expense</button>
                </div>
              )}

              <div style={{ backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '24px', border: '1px solid #171717' }}>
                <h3 style={{ fontWeight: '600', color: '#fafafa', marginBottom: '16px', marginTop: 0 }}>Spending by Category</h3>
                <div style={{ height: '256px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[...expensesByCategory].sort((a, b) => b.value - a.value)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                      <XAxis type="number" tickFormatter={(v) => `$${v}`} stroke="#404040" axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" stroke="#525252" width={100} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px', color: '#fafafa' }} />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {expensesByCategory.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: '#0a0a0a', borderRadius: '16px', border: '1px solid #171717', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 40px', gap: '16px', padding: '16px', borderBottom: '1px solid #171717', fontSize: '14px', fontWeight: '500', color: '#525252' }}>
                  <span>Expense</span><span>Category</span><span>Amount</span><span></span>
                </div>
                <div>
                  {expenses.map((expense) => (
                    <div key={expense.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 40px', gap: '16px', padding: '16px', alignItems: 'center', borderBottom: '1px solid #171717' }}>
                      <span style={{ fontWeight: '500', color: '#fafafa' }}>{expense.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: categoryColors[expense.category] }} />
                        <span style={{ color: '#525252', fontSize: '14px' }}>{expense.category}</span>
                      </div>
                      <span style={{ fontFamily: 'ui-monospace, monospace', color: '#fafafa' }}>{formatCurrency(expense.amount)}</span>
                      <button onClick={() => setExpenses(expenses.filter(e => e.id !== expense.id))} style={{ color: '#404040', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Plan Tab */}
          {activeTab === 'plan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.03), rgba(6, 182, 212, 0.08))', borderRadius: '16px', padding: '24px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontWeight: '600', color: '#fafafa', fontSize: '18px', margin: 0 }}>Extra Monthly Payment</h3>
                    <p style={{ fontSize: '14px', color: '#525252', marginTop: '4px', marginBottom: 0 }}>Above minimum payments — accelerate your debt freedom</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '40px', fontWeight: '700', color: '#10b981', margin: 0, fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(extraPayment)}</p>
                    <p style={{ fontSize: '12px', color: '#525252', marginTop: '4px', marginBottom: 0 }}>per month</p>
                  </div>
                </div>
                <input type="range" min="0" max="2000" step="50" value={extraPayment} onChange={(e) => setExtraPayment(parseInt(e.target.value))} style={{ width: '100%', height: '8px', backgroundColor: '#262626', borderRadius: '999px', appearance: 'none', cursor: 'pointer', accentColor: '#10b981' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#404040', marginTop: '12px' }}>
                  <span>$0</span><span>$500</span><span>$1,000</span><span>$1,500</span><span>$2,000</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '24px', border: '1px solid #171717' }}>
                <h3 style={{ fontWeight: '600', color: '#fafafa', marginBottom: '20px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target style={{ width: '20px', height: '20px', color: '#10b981' }} />
                  Current Strategy: Hybrid Approach
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    'Pay minimums on all accounts each month',
                    `Direct extra $${extraPayment} toward highest-priority debt`,
                    'CareCredit first (avoid deferred interest), then avalanche method',
                    'Keep low-rate mortgage for last (3.49%)'
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: 'rgba(20, 20, 20, 0.5)', borderRadius: '12px', padding: '16px' }}>
                      <CheckCircle2 style={{ width: '20px', height: '20px', color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ color: '#a3a3a3', fontSize: '14px', margin: 0 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '24px', border: '1px solid #171717' }}>
                <h3 style={{ fontWeight: '600', color: '#fafafa', marginBottom: '24px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar style={{ width: '20px', height: '20px', color: '#06b6d4' }} />
                  Payoff Timeline
                </h3>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '24px', top: '32px', bottom: '32px', width: '2px', background: 'linear-gradient(180deg, #10b981, #06b6d4, #3b82f6)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {payoffTimeline.map((item, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 10, backgroundColor: index === 0 ? '#10b981' : '#141414', border: index === 0 ? '2px solid #34d399' : '2px solid #262626' }}>
                          {index === 0 ? <Target style={{ width: '20px', height: '20px', color: '#ffffff' }} /> : <span style={{ fontSize: '14px', fontWeight: '700', color: '#525252' }}>{index + 1}</span>}
                        </div>
                        <div style={{ flex: 1, backgroundColor: '#141414', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <h4 style={{ fontWeight: '600', color: '#fafafa', margin: 0 }}>{item.debt}</h4>
                            <p style={{ fontSize: '14px', color: '#525252', marginTop: '4px', marginBottom: 0 }}>{item.month}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontFamily: 'ui-monospace, monospace', fontWeight: '700', fontSize: '18px', color: '#fafafa', margin: 0 }}>{formatCurrency(item.amount)}</p>
                            <p style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', marginBottom: 0 }}>✓ Paid off</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '24px', border: '1px solid #171717' }}>
                <h3 style={{ fontWeight: '600', color: '#fafafa', marginBottom: '16px', marginTop: 0 }}>Debt Reduction Projection</h3>
                <div style={{ height: '256px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectedPayoff}>
                      <defs>
                        <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="month" stroke="#404040" axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(v) => `$${v/1000}k`} stroke="#404040" axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px', color: '#fafafa' }} />
                      <Area type="monotone" dataKey="balance" stroke="#ef4444" fill="url(#balanceGradient)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.08), rgba(139, 92, 246, 0.05), rgba(6, 182, 212, 0.08))', borderRadius: '16px', padding: '20px', border: '1px solid rgba(124, 58, 237, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Sparkles style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
                  <p style={{ color: '#a3a3a3', fontSize: '14px', margin: 0 }}>
                    These insights are automatically generated based on your debt and expense data. They update as you make changes.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {aiTips.map((tip, index) => (
                  <div key={index} style={{
                    borderRadius: '16px',
                    padding: '24px',
                    border: `1px solid ${tip.type === 'urgent' ? 'rgba(239, 68, 68, 0.15)' : tip.type === 'strategy' ? 'rgba(16, 185, 129, 0.15)' : tip.type === 'opportunity' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)'}`,
                    backgroundColor: tip.type === 'urgent' ? 'rgba(239, 68, 68, 0.03)' : tip.type === 'strategy' ? 'rgba(16, 185, 129, 0.03)' : tip.type === 'opportunity' ? 'rgba(245, 158, 11, 0.03)' : 'rgba(59, 130, 246, 0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        backgroundColor: tip.type === 'urgent' ? 'rgba(239, 68, 68, 0.1)' : tip.type === 'strategy' ? 'rgba(16, 185, 129, 0.1)' : tip.type === 'opportunity' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                      }}>
                        {tip.type === 'urgent' ? <AlertCircle style={{ width: '24px', height: '24px', color: '#ef4444' }} />
                        : tip.type === 'strategy' ? <Target style={{ width: '24px', height: '24px', color: '#10b981' }} />
                        : tip.type === 'opportunity' ? <TrendingUp style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
                        : <Lightbulb style={{ width: '24px', height: '24px', color: '#3b82f6' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontWeight: '600', color: '#fafafa', margin: 0 }}>{tip.title}</h3>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '10px',
                            fontWeight: '500',
                            backgroundColor: tip.type === 'urgent' ? 'rgba(239, 68, 68, 0.15)' : tip.type === 'strategy' ? 'rgba(16, 185, 129, 0.15)' : tip.type === 'opportunity' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                            color: tip.type === 'urgent' ? '#ef4444' : tip.type === 'strategy' ? '#10b981' : tip.type === 'opportunity' ? '#f59e0b' : '#3b82f6'
                          }}>
                            {tip.type.toUpperCase()}
                          </span>
                        </div>
                        <p style={{ color: '#a3a3a3', fontSize: '14px', marginBottom: '12px', lineHeight: '1.6', marginTop: 0 }}>{tip.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <DollarSign style={{ width: '16px', height: '16px', color: '#10b981' }} />
                          <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '500' }}>{tip.savings}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: '#0a0a0a', borderRadius: '16px', padding: '24px', border: '1px solid #171717' }}>
                <h3 style={{ fontWeight: '600', color: '#fafafa', marginBottom: '20px', marginTop: 0 }}>Quick Wins</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  {[
                    { title: 'Round up payments', desc: 'Round your $700 USAA payment to $750' },
                    { title: 'Bi-weekly payments', desc: 'Pay half every 2 weeks = 1 extra payment/year' },
                    { title: 'Windfall rule', desc: 'Apply 50%+ of any bonus/tax refund to debt' },
                    { title: 'Balance transfer check', desc: 'Look for 0% APR cards to move high-interest debt' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', backgroundColor: '#141414', borderRadius: '12px', border: '1px solid #262626' }}>
                      <CheckCircle2 style={{ width: '20px', height: '20px', color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <p style={{ fontWeight: '500', fontSize: '14px', color: '#fafafa', margin: 0 }}>{item.title}</p>
                        <p style={{ color: '#525252', fontSize: '12px', marginTop: '4px', marginBottom: 0 }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            width: 100% !important;
            max-width: 280px !important;
          }
          .main-content {
            margin-left: 0 !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .hide-mobile {
            display: none !important;
          }
          .content-padding {
            padding: 16px !important;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
