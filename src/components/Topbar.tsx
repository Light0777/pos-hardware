import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { checkmarkCircle, exit, barbellOutline, personCircleOutline, settingsOutline, logOutOutline, notifications, notificationsOutline, menuOutline, closeCircleOutline, warningOutline } from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import { useState, useRef, useEffect } from "react";
import { getSettings } from "../renderer/services/settingsApi";
import { getStock } from "../renderer/services/stockApi";

interface TopbarProps {
    onMenuClick?: () => void;
}

function getPageTitle(path: string, t: (key: string) => string) {
    if (path.includes("/dashboard")) return t('topbar.pageTitles.dashboard');
    if (path.includes("/products")) return t('topbar.pageTitles.products');
    if (path.includes("/stock")) return t('topbar.pageTitles.stock');
    if (path.includes("/sales")) return t('topbar.pageTitles.sales');
    if (path.includes("/reports")) return t('topbar.pageTitles.reports');
    if (path.includes("/staff")) return t('topbar.pageTitles.staff');
    if (path.includes("/settings")) return t('topbar.pageTitles.settings');
    if (path.includes("/customer")) return t('topbar.pageTitles.customer');
    if (path.includes("/supplier")) return t('topbar.pageTitles.supplier');
    if (path.includes("/purchase")) return t('topbar.pageTitles.purchase');
    if (path.includes("/profile")) return t('topbar.pageTitles.profile');
    return t('topbar.pageTitles.admin');
}

export default function Topbar({ onMenuClick }: TopbarProps) {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const title = getPageTitle(location.pathname, t); // kept for potential future use
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentDate = new Date().toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

    const [shopName, setShopName] = useState<string>(t('topbar.myShopFallback'));

    useEffect(() => {
        getSettings().then(res => {
            const name = res?.data?.shop_name || res?.shop_name;
            if (name) setShopName(name);
        });
    }, [t]);

    const [lowStockCount, setLowStockCount] = useState(0);
    const notifRef = useRef<HTMLDivElement>(null);
    const notifButtonRef = useRef<HTMLButtonElement>(null);
    const [showNotifMenu, setShowNotifMenu] = useState(false);
    const [lowStockItems, setLowStockItems] = useState<any[]>([]);

    useEffect(() => {
        getStock().then((data: any[]) => {
            const count = Array.isArray(data)
                ? data.filter(item => item && item.stock < 10).length
                : 0;
            setLowStockCount(count);
        }).catch(() => setLowStockCount(0));
    }, []);

    useEffect(() => {
        getStock().then((data: any[]) => {
            const low = Array.isArray(data)
                ? data.filter(item => item && item.stock < 10)
                : [];
            setLowStockItems(low);
        }).catch(() => setLowStockItems([]));
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showNotifMenu &&
                notifRef.current &&
                !notifRef.current.contains(event.target as Node) &&
                notifButtonRef.current &&
                !notifButtonRef.current.contains(event.target as Node)
            ) {
                setShowNotifMenu(false);
            }
        };
        if (showNotifMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifMenu]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showUserMenu &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu]);

    const handleNavigation = (path: string) => {
        setShowUserMenu(false);
        navigate(path);
    };

    const handleMenuClick = (e: React.MouseEvent, callback: () => void) => {
        e.preventDefault();
        e.stopPropagation();
        callback();
    };

    // ✅ FIX: Handle undefined role
    const getRoleTranslation = (role?: string) => {
        switch (role) {
            case 'owner': return t('topbar.roles.owner');
            case 'manager': return t('topbar.roles.manager');
            case 'cashier': return t('topbar.roles.cashier');
            default: return t('topbar.roles.user');
        }
    };

    return (
        <div className="bg-[#222] px-6 flex items-center justify-between shadow-sm sticky top-0 z-30">
            {/* LEFT - Page Title & Breadcrumb */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                >
                    <IonIcon icon={menuOutline} className="text-xl" />
                </button>

                <div className="grid">
                    <h1 className="text-2xl font-bold text-white">
                        {shopName}
                    </h1>
                </div>
            </div>

            {/* RIGHT - User & Actions */}
            <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end bg-[#212121] hover:bg-white px-4 py-1 rounded-full">
                    <div className="text-sm font-semibold text-gray-500">{currentTime}</div>
                    <div className="text-xs text-gray-400">{currentDate}</div>
                </div>

                <div className="relative">
                    <button
                        ref={notifButtonRef}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowNotifMenu(!showNotifMenu);
                        }}
                        className="relative px-3 py-2 bg-[#333333] text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                        title={t('topbar.notifications')}
                    >
                        <IonIcon icon={notificationsOutline} className="text-xl top-0.5 relative" />
                        {lowStockItems.length > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                                {lowStockItems.length > 99 ? '99+' : lowStockItems.length}
                            </span>
                        )}
                    </button>

                    {showNotifMenu && (
                        <div
                            ref={notifRef}
                            className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                        >
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-800">{t('topbar.notifTitle')}</h3>
                                {lowStockItems.length > 0 && (
                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                                        {lowStockItems.length} {lowStockItems.length > 1 ? t('topbar.notifAlerts') : t('topbar.notifAlert')}
                                    </span>
                                )}
                            </div>

                            {/* Body */}
                            <div className="max-h-72 overflow-y-auto">
                                {lowStockItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                            <IonIcon icon={checkmarkCircle} className="text-2xl text-green-500" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">{t('topbar.notifAllGood')}</p>
                                        <p className="text-xs text-gray-400 mt-1">{t('topbar.notifAllGoodSub')}</p>
                                    </div>
                                ) : (
                                    <div className="py-1">
                                        {lowStockItems.map((item) => (
                                            <div
                                                key={item.product_uuid}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
                                            >
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${item.stock === 0 ? 'bg-red-100' : 'bg-orange-100'
                                                    }`}>
                                                    <IonIcon
                                                        icon={item.stock === 0 ? closeCircleOutline : warningOutline}
                                                        className={`text-lg ${item.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0 text-start">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                                                    <p className={`text-xs mt-0.5 ${item.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                                                        {item.stock === 0
                                                            ? t('topbar.notifOutOfStock')
                                                            : t('topbar.notifLowStock', { count: item.stock })}
                                                    </p>
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${item.stock === 0
                                                        ? 'bg-red-100 text-red-600'
                                                        : 'bg-orange-100 text-orange-600'
                                                    }`}>
                                                    {item.stock}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {lowStockItems.length > 0 && (
                                <div className="border-t border-gray-100 px-4 py-2">
                                    <button
                                        onClick={() => {
                                            setShowNotifMenu(false);
                                            navigate('/admin/stock');
                                        }}
                                        className="w-full text-xs text-center text-blue-600 hover:text-blue-700 font-medium py-1"
                                    >
                                        {t('topbar.notifViewAll')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative">
                    <button
                        ref={buttonRef}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowUserMenu(!showUserMenu);
                        }}
                        className="flex items-center gap-3 focus:outline-none group"
                    >
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center rounded-full shadow-md">
                                <span className="text-sm font-semibold">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>

                        <div className="hidden lg:flex justify-center items-center gap-4 py-1 px-3 rounded-full text-left bg-[#212121]">
                            <div>
                                <div className="text-sm font-semibold text-gray-500">{user?.name}</div>
                                <div className="text-xs text-gray-500 capitalize">{getRoleTranslation(user?.role)}</div>
                            </div>
                            <div className="bg-white p-2 rounded-full">
                                <svg className={`hidden lg:block w-4 h-4 text-[#141414] transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </button>

                    {showUserMenu && (
                        <div
                            ref={menuRef}
                            className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                            style={{ position: 'absolute', top: '100%', right: 0 }}
                        >
                            <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                                <div className="text-sm font-semibold text-gray-800">{user?.name}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{user?.email}</div>
                                <div className="inline-block mt-1.5 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full capitalize">
                                    {getRoleTranslation(user?.role)}
                                </div>
                            </div>

                            <div className="py-1">
                                <button
                                    onClick={(e) => handleMenuClick(e, () => handleNavigation("/admin/profile"))}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                                >
                                    <IonIcon icon={personCircleOutline} className="text-lg text-gray-400" />
                                    <span>{t('topbar.yourProfile')}</span>
                                </button>
                                <button
                                    onClick={(e) => handleMenuClick(e, () => handleNavigation("/admin/settings"))}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                                >
                                    <IonIcon icon={settingsOutline} className="text-lg text-gray-400" />
                                    <span>{t('topbar.settingsDropdown')}</span>
                                </button>
                            </div>

                            <div className="border-t border-gray-100"></div>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowUserMenu(false);
                                    logout();
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition"
                            >
                                <IonIcon icon={logOutOutline} className="text-lg text-red-500" />
                                <span>{t('topbar.logout')}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}