// components/layout.tsx
import React from "react";
import Navigation from "@/components/Navbar"; // Adjust the path based on your actual folder structure

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div>
            <Navigation />
            {children}
        </div>
    );
};

export default Layout;