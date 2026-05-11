import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import "../styles/HomePage.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const metadata = {
  title: "FastFood - Danh sách cửa hàng",
  description: "Khám phá danh sách cửa hàng FastFood",
};

interface Store {
  id: number;
  name: string;
  address: string;
  avatar: string;
}

interface FeaturedProduct {
  id: number;
  name: string;
  price: number;
}

async function fetchStores(): Promise<Store[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/stores`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });
    if (!res.ok) throw new Error("Failed to fetch stores");
    return await res.json();
  } catch (error) {
    console.error("Error fetching stores:", error);
    return [];
  }
}

async function fetchFeaturedProducts(): Promise<FeaturedProduct[]> {
  try {
    // Backend doesn't have /products/featured, so fetch all products instead
    const res = await fetch(`${BACKEND_URL}/api/products`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch featured products");
    return await res.json();
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export default async function Home() {
  const [stores, featuredProducts] = await Promise.all([
    fetchStores(),
    fetchFeaturedProducts(),
  ]);

  return (
    <>

      {/* Banner */}
      <div className="home-banner">
        <img src="/icons/banner.png" alt="Banner" />
      </div>

      <div className="homepage-container">
        {/* Cửa hàng Section */}
        <h2 className="section-title">Danh sách cửa hàng</h2>
        {stores.length === 0 ? (
          <p className="loading-text">Đang tải hoặc chưa có cửa hàng...</p>
        ) : (
          <div className="store-list">
            {stores.map((store) => (
              <Link key={store.id} href={`/store/${store.id}`} style={{ textDecoration: "none" }}>
                <div className="store-card">
                  <div
                    className="store-image"
                    style={{ backgroundImage: `url(${store.avatar})` }}
                  ></div>
                  <div className="store-info">
                    <h3>{store.name}</h3>
                    <p>{store.address}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* SSR Info Badge */}
        <div style={{
          marginTop: "60px",
          padding: "20px",
          backgroundColor: "#e3f2fd",
          borderLeft: "4px solid #2196f3",
          borderRadius: "4px",
          fontSize: "14px",
          color: "#1565c0",
        }}>
          <strong>📦 Server-Rendered (SSR):</strong> This page was rendered on the server. 
          Try <code>Ctrl+U</code> (View Page Source) to see the complete store list in the HTML.
        </div>
      </div>
    </>
  );
}
