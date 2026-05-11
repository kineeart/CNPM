import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AddToCartButtonStore from "./AddToCartButtonStore";
import "@/app/styles/StoreDetail.css";
import "@/app/styles/index.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface Store {
  id: number;
  name: string;
  avatar: string;
  description: string;
  address: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  try {
    const res = await fetch(`${BACKEND_URL}/api/stores/${id}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch store: ${res.status}`);
    }

    const store: Store = await res.json();

    return {
      title: `${store.name} - FastFood`,
      description: store.description,
    };
  } catch (error) {
    console.error("Metadata fetch error:", error);

    return {
      title: "Cửa hàng - FastFood",
      description: "Chi tiết cửa hàng FastFood",
    };
  }
}



async function fetchStore(id: string): Promise<Store | null> {
  try {
    const url = `${BACKEND_URL}/api/stores/${id}`;

    console.log("Fetching store from:", url);

    const res = await fetch(url, {
      next: { revalidate: 60 },
    });

    console.log("Store response status:", res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error("Store fetch failed response:", text);
      return null;
    }

    const data = await res.json();

    console.log("Store data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching store:", error);
    return null;
  }
}

async function fetchStoreProducts(id: string): Promise<Product[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/products/store/${id}/public`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function StoreDetail({ params }: PageProps) {
  const { id } = await params;

  const [store, products] = await Promise.all([
    fetchStore(id),
    fetchStoreProducts(id),
  ]);

  if (!store) {
    return <p style={{ padding: "20px" }}>Không tìm thấy cửa hàng.</p>;
  }

  return (
    <>
      <div className="store-detail-container">
        <div className="store-detail-wrapper">
          {/* Left Column */}
          <div className="store-left">
            {store.avatar && (
              <div
                className="store-avatar"
                style={{ backgroundImage: `url(${store.avatar})` }}
              />
            )}
            <div className="store-description">
              <h2>{store.name}</h2>
              <p>{store.description}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="store-right">
            <h3>Sản phẩm</h3>
            {products.length === 0 ? (
              <p className="loading-text">Chưa có sản phẩm nào.</p>
            ) : (
              <div className="product-grid">
                {products.map((prod) => (
                  <div key={prod.id} className="product-card">
                    <Link href={`/product/${prod.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div
                        className="product-image"
                        style={{ backgroundImage: `url(${prod.imageUrl})` }}
                      />
                    </Link>
                    <div className="product-info">
                      <h3>{prod.name}</h3>
                      <p>{prod.description}</p>
                      <strong>{prod.price.toLocaleString()}₫</strong>
                      <AddToCartButtonStore productId={prod.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SSR Info Badge */}
      <div
        style={{
          margin: "40px",
          padding: "20px",
          backgroundColor: "#f3e5f5",
          borderLeft: "4px solid #9c27b0",
          borderRadius: "4px",
          fontSize: "14px",
          color: "#6a1b9a",
        }}
      >
        <strong>📦 Full Server-Rendering (SSR):</strong> Store details and all product listings
        were pre-rendered on the server. Try <code>Ctrl+U</code> to see the complete store data
        and product list in the HTML source.
      </div>
    </>
  );
}
