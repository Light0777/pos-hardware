import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Topbar from "../components/Topbar";
import {
  home,
  cubeOutline,
  documentTextOutline,
  peopleOutline,
  barChartOutline,
  cartOutline,
  walletOutline,
  peopleCircleOutline,
  settingsOutline,
  personCircleOutline,
  logOutOutline,
  checkmarkCircle,
  closeOutline
} from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import { useState } from "react";

// ============================================
// NAVIGATION ITEM COMPONENT
// ============================================
// Renders a single menu item in the sidebar
// Shows active state with blue background and checkmark icon
// ============================================
interface NavItemProps {
  label: string;           // Display text for the menu item
  path: string;           // Route path to navigate to
  currentPath: string;    // Current active route path
  icon: string;           // Icon name from ionicons
  onClick: () => void;    // Click handler function
}

function NavItem({ label, path, currentPath, icon, onClick }: NavItemProps) {
  // Check if this menu item is currently active
  const active = currentPath === path;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
        active
          ? "bg-green-500 text-white shadow-lg"  // Active: blue background
          : "text-gray-300 hover:bg-[#212121] hover:text-white"  // Inactive: dark hover
      }`}
    >
      {/* Menu Icon */}
      <IonIcon icon={icon} className={`text-xl ${active ? "text-white" : "text-gray-400"}`} />
      
      {/* Menu Label */}
      <span className="text-sm font-medium">{label}</span>
      
      {/* Active Indicator - Checkmark icon appears only on active item */}
      {active && (
        <IonIcon icon={checkmarkCircle} className="text-white text-sm ml-auto" />
      )}
    </button>
  );
}

// ============================================
// NAVIGATION SECTION COMPONENT
// ============================================
// Groups related menu items under a section header
// Example: "MANAGEMENT" section contains Products, Stock, Sales, etc.
// ============================================
interface NavSectionProps {
  title: string;          // Section header text (e.g., "MANAGEMENT", "BUSINESS")
  children: React.ReactNode;  // NavItem components inside this section
}

function NavSection({ title, children }: NavSectionProps) {
  return (
    <div className="space-y-1 font-inter">
      {/* Section Header - Uppercase, small, gray text */}
      <div className="p-3 text-xs font-semibold text-start text-gray-500 uppercase tracking-wider">
        {title}
      </div>
      {/* All menu items in this section */}
      {children}
    </div>
  );
}

// ============================================
// MAIN ADMIN LAYOUT COMPONENT
// ============================================
// This is the main layout wrapper for all admin pages
// Structure: Topbar at top, Sidebar on left, Content area on right
// ============================================
export default function AdminLayout() {
  const navigate = useNavigate();      // Hook for programmatic navigation
  const location = useLocation();      // Hook to get current URL path
  const { user } = useAuth();          // Get logged-in user data from auth context
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);  // Mobile sidebar state

  // ============================================
  // LOADING STATE
  // ============================================
  // Show loading message while user data is being fetched
  if (!user) {
    return <div className="p-4">Loading user...</div>;
  }

  // Get current path to determine active menu item
  const currentPath = location.pathname;

  // ============================================
  // SIDEBAR CONTENT COMPONENT
  // ============================================
  // Contains all the sidebar UI - Header, Navigation, Footer
  // Reused for both desktop and mobile sidebars
  // ============================================
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      
      {/* ========== SIDEBAR HEADER ========== */}
      {/* Shows "Admin Panel" title and user role (owner/manager) */}
      <div className="p-4">
        <div className="text-start">
          <div className="text-lg font-bold text-white">
            Admin Panel
          </div>
          <div className="text-xs text-gray-400 capitalize mt-1">
            {user.role}  {/* Displays: owner, manager, etc. */}
          </div>
        </div>
      </div>

      {/* ========== SIDEBAR NAVIGATION ========== */}
      {/* Scrollable area containing all menu items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
        
        {/* DASHBOARD SECTION - Only visible to 'owner' role */}
        {user.role === "owner" && (
          <NavItem
            label="Dashboard"
            path="/admin/dashboard"
            currentPath={currentPath}
            icon={home}
            onClick={() => navigate("/admin/dashboard")}
          />
        )}

        {/* MANAGEMENT SECTION - Visible to 'owner' and 'manager' roles */}
        {/* Contains: Products, Stock, Sales, Customer */}
        {["owner", "manager"].includes(user.role) && (
          <NavSection title="MANAGEMENT">
            <NavItem
              label="Products"
              path="/admin/products"
              currentPath={currentPath}
              icon={cubeOutline}
              onClick={() => navigate("/admin/products")}
            />

            <NavItem
              label="Stock"
              path="/admin/stock"
              currentPath={currentPath}
              icon={documentTextOutline}
              onClick={() => navigate("/admin/stock")}
            />

            <NavItem
              label="Sales"
              path="/admin/sales"
              currentPath={currentPath}
              icon={documentTextOutline}
              onClick={() => navigate("/admin/sales")}
            />

            <NavItem
              label="Customer"
              path="/admin/customer"
              currentPath={currentPath}
              icon={peopleOutline}
              onClick={() => navigate("/admin/customer")}
            />
          </NavSection>
        )}

        {/* BUSINESS SECTION - Only visible to 'owner' role */}
        {/* Contains: Reports, Supplier, Purchase, Purchases, Staff, Settings */}
        {user.role === "owner" && (
          <NavSection title="BUSINESS">
            <NavItem
              label="Reports"
              path="/admin/reports"
              currentPath={currentPath}
              icon={barChartOutline}
              onClick={() => navigate("/admin/reports")}
            />

            <NavItem
              label="Supplier"
              path="/admin/supplier"
              currentPath={currentPath}
              icon={peopleCircleOutline}
              onClick={() => navigate("/admin/supplier")}
            />

            <NavItem
              label="Purchase"
              path="/admin/purchase"
              currentPath={currentPath}
              icon={cartOutline}
              onClick={() => navigate("/admin/purchase")}
            />

            <NavItem
              label="Purchases"
              path="/admin/purchases"
              currentPath={currentPath}
              icon={documentTextOutline}
              onClick={() => navigate("/admin/purchases")}
            />

            <NavItem
              label="Staff"
              path="/admin/staff"
              currentPath={currentPath}
              icon={peopleCircleOutline}
              onClick={() => navigate("/admin/staff")}
            />

            <NavItem
              label="Settings"
              path="/admin/settings"
              currentPath={currentPath}
              icon={settingsOutline}
              onClick={() => navigate("/admin/settings")}
            />
          </NavSection>
        )}

        {/* ACCOUNT SECTION - Visible to all roles */}
        {/* Contains: Profile */}
        <NavSection title="ACCOUNT">
          <NavItem
            label="Profile"
            path="/admin/profile"
            currentPath={currentPath}
            icon={personCircleOutline}
            onClick={() => navigate("/admin/profile")}
          />
        </NavSection>
      </div>

      {/* ========== SIDEBAR FOOTER ========== */}
      {/* Fixed at bottom, contains button to navigate to POS page */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={() => navigate("/pos")}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
        >
          <IonIcon icon={logOutOutline} className="text-lg" />
          <span>Go to POS</span>
        </button>
      </div>
    </div>
  );

  // ============================================
  // MAIN LAYOUT RENDER
  // ============================================
  return (
    <div className="h-screen flex flex-col font-inter bg-[#222]">
      
      {/* ========== TOPBAR ========== */}
      {/* Fixed at top, contains: Company name, Time, Notifications, User profile */}
      {/* Passes mobile menu toggle function to Topbar */}
      <Topbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* ========== MAIN CONTENT AREA ========== */}
      {/* Contains Sidebar + Page Content */}
      <div className="flex overflow-hidden">
        
        {/* ========== DESKTOP SIDEBAR ========== */}
        {/* Hidden on mobile (md:hidden), visible on tablet/desktop */}
        {/* Fixed width of 64 (256px), dark background */}
        <aside className="hidden md:block w-64 bg-[#222] text-white overflow-y-auto rounded-tl-2xl rounded-bl-2xl">
          <SidebarContent />
        </aside>

        {/* ========== MOBILE SIDEBAR (OVERLAY) ========== */}
        {/* Only appears when hamburger menu is clicked on mobile */}
        {/* Rendered as an overlay on top of the content */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop - dark semi-transparent background */}
            {/* Clicking this closes the mobile sidebar */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Mobile Sidebar Panel */}
            {/* Slides in from left, same content as desktop sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#141414] text-white z-50 md:hidden overflow-y-auto">
              {/* Close button at top of mobile sidebar */}
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <div className="text-lg font-bold text-blue-500">Admin Panel</div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <IonIcon icon={closeOutline} className="text-xl" />
                </button>
              </div>
              {/* Same sidebar content as desktop */}
              <SidebarContent />
            </aside>
          </>
        )}

        {/* ========== MAIN PAGE CONTENT ========== */}
        {/* Right side content area where actual page components render */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#141414] rounded-2xl rounded-br-2xl mr-2 mb-2 scrollbar-hide">
          {/* Outlet renders the current route's component (child route) */}
          {/* Examples: Products page, Sales page, Customer page, etc. */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}