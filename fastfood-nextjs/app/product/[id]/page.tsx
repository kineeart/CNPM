import React from "react";
import AddToCartButton from "./AddToCartButton";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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
    const res = await fetch(`${BACKEND_URL}/api/products/${id}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Metadata product fetch failed:", text);

      throw new Error(`Failed to fetch product: ${res.status}`);
    }

    const product: Product = await res.json();

    return {
      title: `${product.name} - FastFood`,
      description: product.description,
    };
  } catch (error) {
    console.error("Metadata error:", error);

    return {
      title: "Sản phẩm - FastFood",
      description: "Chi tiết sản phẩm FastFood",
    };
  }
}

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/products/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch product");
    return await res.json();
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    return null;
  }
}

export default async function ProductDetail({ params }: PageProps) {
 const { id } = await params;

  const product = await fetchProduct(id);
  if (!product) {
    return <p style={{ padding: "20px" }}>Không tìm thấy sản phẩm.</p>;
  }

  return (
    <>
      <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
        <h2>{product.name}</h2>
        <img
          src={product.imageUrl}
          alt={product.name}
          width={300}
          style={{ borderRadius: "8px" }}
        />
        <p>
          <strong>Giá:</strong> {product.price.toLocaleString()}₫
        </p>
        <p>{product.description}</p>

        <AddToCartButton productId={product.id} />

        {/* SSR Info Badge */}
        <div
          style={{
            marginTop: "60px",
            padding: "20px",
            backgroundColor: "#fff3e0",
            borderLeft: "4px solid #ff9800",
            borderRadius: "4px",
            fontSize: "14px",
            color: "#e65100",
          }}
        >
          <strong>🔄 Hybrid Rendering:</strong> Product details (name, price, image) were
          server-rendered. The Add-to-Cart button is a client component for interactivity.
          Try <code>Ctrl+U</code> to see the product data in the HTML source.
        </div>
      </div>
    </>
  );
}
