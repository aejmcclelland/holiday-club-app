// components/layout.tsx
import React from "react";
import Navigation from "@/components/Navbar"; // Adjust the path based on your actual folder structure

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="bg-white min-h-screen">
            <div className="text-gray-900">
            <Navigation />
            <div className='container mx-auto p-4'> {/* Add padding to the layout */}
            {children}
            </div>
        </div>
        </div>
    );
};

export default Layout;