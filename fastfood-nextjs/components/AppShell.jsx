"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

const FULL_CHROME_PATHS = ["/home", "/store", "/product"];
const NAV_ONLY_PATHS = ["/cart", "/checkout", "/my-orders"];
const HIDDEN_PATHS = ["/", "/register", "/dashboard", "/dashboard-bigadmin", "/orders", "/customers", "/products", "/stores", "/drone", "/zalopay-test"];

function matchesPath(pathname, path) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isHidden = HIDDEN_PATHS.some((path) => matchesPath(pathname, path));
  const showNavbar = !isHidden && (FULL_CHROME_PATHS.some((path) => matchesPath(pathname, path)) || NAV_ONLY_PATHS.some((path) => matchesPath(pathname, path)));
  const showFooter = !isHidden && FULL_CHROME_PATHS.some((path) => matchesPath(pathname, path));

  return (
    <>
      {showNavbar ? <Navbar /> : null}
      <main style={{ marginTop: showNavbar ? 70 : 0, flex: 1 }}>{children}</main>
      {showFooter ? <Footer /> : null}
    </>
  );
}
