
import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';

interface RegisterViewProps {
    onLoginClick: () => void;
    onRegisterSuccess: (token: string) => void;
    t: (key: string) => string;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onLoginClick, onRegisterSuccess, t }) => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError(t('error_passwords_do_not_match') || "Parollar mos kelmadi");
            return;
        }

        setLoading(true);
        try {
            // 1. Register
            const res = await fetch('http://localhost:8000/api/auth/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.username || data.password || "Ro'yxatdan o'tishda xatolik");
            }

            // 2. Auto Login (get token)
            const loginRes = await fetch('http://localhost:8000/api/auth/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })
            });

            if (!loginRes.ok) throw new Error("Avtomatik kirishda xatolik");

            const loginData = await loginRes.json();
            onRegisterSuccess(loginData.access); // JWT access token

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title={t('register_title') || "Ro'yxatdan o'tish"} subtitle={t('register_subtitle') || "Yangi hisob yarating"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('username') || "Foydalanuvchi nomi"}</label>
                    <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                        className="w-full p-3 bg-slate-900/50 border border-white/10 rounded-xl text-white outline-none focus:border-[var(--accent-primary)] transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('email') || "Email"}</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-3 bg-slate-900/50 border border-white/10 rounded-xl text-white outline-none focus:border-[var(--accent-primary)] transition-all"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('password') || "Parol"}</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full p-3 bg-slate-900/50 border border-white/10 rounded-xl text-white outline-none focus:border-[var(--accent-primary)] transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('confirm_password') || "Tasdiqlash"}</label>
                        <input
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full p-3 bg-slate-900/50 border border-white/10 rounded-xl text-white outline-none focus:border-[var(--accent-primary)] transition-all"
                        />
                    </div>
                </div>

                {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--accent-primary)] text-black font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                >
                    {loading ? "..." : (t('register_button') || "Ro'yxatdan o'tish")}
                </button>

                <p className="text-center text-slate-400 text-sm mt-4">
                    {t('have_account') || "Hisobingiz bormi?"}{" "}
                    <button type="button" onClick={onLoginClick} className="text-[var(--accent-primary)] font-bold hover:underline">
                        {t('login_link') || "Kirish"}
                    </button>
                </p>
            </form>
        </AuthLayout>
    );
};
