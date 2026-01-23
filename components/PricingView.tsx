
import React, { useState } from 'react';

interface PricingViewProps {
    onLogin: (token: string) => void;
    onRegisterClick: () => void;
    t: (key: string, replacements?: { [key: string]: string }) => string;
    loginError: string | null;
}

export const PricingView: React.FC<PricingViewProps> = ({ onLogin, onRegisterClick, t, loginError: initialError }) => {

    // Using username instead of phone for default django auth, but let's keep the UI variable name 'phone' for now 
    // or map it to username. The backend expects 'username'.
    // Let's assume user enters username in the "Phone" field for now, or we update label.
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin123'); // Default for easy testing
    const [agreed, setAgreed] = useState(false);
    const [localError, setLocalError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (agreed && username.trim() && password.trim()) {
            setLoading(true);
            setLocalError('');
            try {
                const res = await fetch('https://advokatapi.aiproduct.uz/api/auth/login/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (!res.ok) throw new Error("Login yoki parol noto'g'ri");

                const data = await res.json();
                onLogin(data.access);
            } catch (err: any) {
                setLocalError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const plans = [
        { nameKey: 'pricing_plan_one_time', priceKey: 'pricing_price_one_time', recommended: false },
        { nameKey: 'pricing_plan_1_month', priceKey: 'pricing_price_1_month', recommended: false },
        { nameKey: 'pricing_plan_3_month', priceKey: 'pricing_price_3_month', recommended: true },
        { nameKey: 'pricing_plan_6_month', priceKey: 'pricing_price_6_month', recommended: false },
        { nameKey: 'pricing_plan_12_month', priceKey: 'pricing_price_12_month', recommended: false },
    ];

    return (
        <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 sm:p-6 bg-[#0f172a] text-[var(--text-primary)]">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-4xl z-10 animate-assemble-in">
                <div className="polished-pane p-6 md:p-12 rounded-3xl backdrop-blur-3xl border-white/5 shadow-2xl">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter animated-gradient-text">
                            {t('app_name')}
                        </h1>
                        <p className="text-slate-400 mt-4 leading-relaxed max-w-lg mx-auto text-sm md:text-base px-4">
                            {t('auth_welcome_desc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        {/* Left Column: Pricing - HIDDEN ON MOBILE */}
                        <div className="hidden md:block">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                {t('pricing_title')}
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {plans.map((plan) => (
                                    <div key={plan.nameKey} className={`relative ${plan.recommended ? 'pt-3' : ''}`}>
                                        <a
                                            href="https://t.me/adolatAI_bot"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`w-full h-full block polished-pane interactive-hover p-4 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 border ${plan.recommended ? 'border-indigo-500/50 bg-indigo-500/5 shadow-xl shadow-indigo-500/10' : 'border-white/5'
                                                }`}
                                        >
                                            <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">{t(plan.nameKey)}</div>
                                            <div className="text-2xl font-black text-white mt-1">{t(plan.priceKey)}</div>
                                            <span className={`mt-3 text-[10px] font-bold px-3 py-1 rounded-full uppercase ${plan.recommended ? 'bg-indigo-500 text-white' : 'bg-slate-700/50 text-slate-400'}`}>
                                                {t('login_buy_plan')}
                                            </span>
                                        </a>
                                        {plan.recommended && (
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest z-10">
                                                {t('pricing_recommended')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Login - FULL WIDTH ON MOBILE */}
                        <div className="md:border-l border-white/5 md:pl-10">
                            <h2 className="text-2xl font-bold text-white mb-8 text-center md:text-left flex items-center justify-center md:justify-start gap-2">
                                <div className="md:hidden w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                {t('login_title')}
                            </h2>
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('login_username_label') || "Foydalanuvchi nomi"}</label>
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="w-full p-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 outline-none placeholder-slate-600"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="token" className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('login_password_label') || "Parol"}</label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full p-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 outline-none placeholder-slate-600"
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-3 p-1">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={e => setAgreed(e.target.checked)}
                                        className="h-5 w-5 rounded-lg border-white/10 bg-slate-900 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                                    />
                                    <label htmlFor="terms" className="text-xs text-slate-400 leading-tight">
                                        {t('login_terms_agree')} <a href="#" className="font-bold text-indigo-400 hover:underline">{t('terms_of_service')}</a>
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!agreed || loading}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black py-4 px-4 rounded-2xl transition-all duration-300 transform active:scale-95 shadow-xl shadow-indigo-500/20 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                                >
                                    {loading ? "..." : t('login_button').toUpperCase()}
                                </button>
                                <div className="text-center mt-4">
                                    <p className="text-sm text-slate-400">
                                        Hisobingiz yo'qmi? <button type="button" onClick={onRegisterClick} className="text-indigo-400 hover:underline font-bold">Ro'yxatdan o'tish</button>
                                    </p>
                                </div>
                                {(localError || initialError) && <p className="text-red-400 text-xs font-bold text-center mt-4 bg-red-500/10 py-2 rounded-lg border border-red-500/20">{localError || initialError}</p>}
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-12 text-center text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] z-10 px-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                    <span>© 2025 <a href="https://cdcgroup.uz" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors">CDCGroup</a>. {t('footer_rights')}</span>
                    <span className="hidden md:inline opacity-30">|</span>
                    <span>{t('footer_supporter')} <a href="https://cdcgroup.uz" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors">CraDev company</a></span>
                </div>
            </footer>
        </div>
    );
};
