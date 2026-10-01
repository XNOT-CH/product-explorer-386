"use client";

import { useState, useEffect } from "react";
import { defaultQuery, fetchProducts } from "@/lib/products";
import type {
  Product,
  ProductDraft,
  ProductList,
  SearchQuery,
} from "@/lib/products";
import ProductSearchForm from "./ProductSearchForm";
import ProductForm from "./ProductForm";

// เอา idle ออก เพราะเราไม่ใช้สถานะนี้แล้ว
type LoadState = "loading" | "error" | "ready";

export default function ProductExplorer() {
  const [products, setProducts] = useState<Product[]>([]);
  // เปลื่ยนจาก "idle" เป็น "loading" เพื่อให้เริ่มโหลดข้อมูลทันที
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // ② จำว่ากำลังแก้สินค้าตัวไหน (null = ยังไม่ได้แก้)
  const [editing, setEditing] = useState<Product | null> (null)

  function showResult(list: ProductList) {
    setProducts(list.products);
    setStatus("ready");
  }

  function showError(error: unknown) {
    setErrorMessage(
      error instanceof Error ? error.message : "เรียกข้อมูลไม่สำเร็จ",
    );
    setStatus("error");
  }

  async function loadProducts(query: SearchQuery) {
    setStatus("loading");
    setErrorMessage("");
    try {
      showResult(await fetchProducts(query));
    } catch (error) {
      showError(error);
    }
  }

  // บันทึกจากฟอร์ม: แก้ไข = เปลี่ยนแถวเดิม / เพิ่ม = ต่อท้ายรายการ
  function saveProduct(draft: ProductDraft) {
    if (editing) {
      // map สร้าง Array ใหม่ เปลี่ยนเฉพาะตัวที่ id ตรง (draft ทับข้อมูลเดิม id เดิมยังอยู่)
      const newData = products.map((item) => {
        if (item.id === editing.id) {
          return { ...item, ...draft };
        }
        return item;
      });
      setProducts(newData);
      setEditing(null); // ฟอร์มกลับโหมดเพิ่ม
    } else {
      setProducts([...products, { ...draft, id: Date.now() }]);
    }
  }

  // ลบสินค้า: filter สร้าง Array ใหม่ที่ไม่มีตัวที่ id ตรง
  function removeProduct(id: number) {
    const newData = products.filter((item) => item.id !== id);
    setProducts(newData);
    // ถ้าลบตัวที่กำลังแก้อยู่ ให้ฟอร์มกลับโหมดเพิ่ม
    if (editing?.id === id) {
      setEditing(null);
    }
  }

  // โหลดข้อมูลสินค้า 1 แบบแรกเมื่อคอมโพเนนต์ถูกเรนเดอร์ครั้งแรก
  //  ทำงาน useEffect เพื่อโหลดข้อมูลสินค้า 1 แบบแรกเมื่อคอมโพเนนต์ถูกเรนเดอร์ครั้งแรก
  //  เริ่มโหลดข้อมูลทันทีเมื่อ component ถูก mount
  useEffect(() => {
    fetchProducts(defaultQuery).then(showResult).catch(showError);
  }, []);

  return (
    <main>
      <h1>รายการสินค้า</h1>
      <button
        type="button"
        onClick={() => loadProducts(defaultQuery)}
        disabled={status === "loading"}
      >
        {status === "loading" ? "กำลังโหลด" : "โหลดข้อมูล"}
      </button>

      <ProductSearchForm onSearch={loadProducts} />

      {/* ③ ส่งสินค้าที่กำลังแก้ให้ฟอร์ม
          key={editing?.id} → ป้ายชื่อฟอร์ม: id เปลี่ยน = สร้างฟอร์มใหม่ ช่องกรอกจึงอัปเดต
          editing={editing} → ส่งสินค้าให้ฟอร์มเอาไปเติมในช่องกรอก 
          editing?.id:เช็คก่อนว่า editing มีข้อมูลไหม ถ้าไม่มี (เป็น null/undefined) 
          จะคืนค่ากลับมาเป็น undefined  รันต่อ ได้ 
          key={editing?.id} แปลว่า key = id ของสินค้าที่กำลังแก้ */}
      <ProductForm key={editing?.id} editing={editing} onSave={saveProduct} onCancel={() => setEditing(null)} />

      <section aria-live="polite">
        {/* // ลบบรรทัดข้อความของสถานะ idle */}
        {status === "loading" && <p>กำลังโหลดข้อมูล</p>}
        {status === "error" && <p role="alert">{errorMessage}</p>}
        {status === "ready" && products.length === 0 && (
          <p>ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
        )}
        {status === "ready" && products.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>ชื่อสินค้า</th>
                <th>ราคา</th>
                <th>คงเหลือ</th>
                <th>หมวดหมู่</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.price}</td>
                  <td>{item.stock}</td>
                  <td>{item.category}</td>
                  <td>
                    {/* ① กดแล้วเก็บสินค้าแถวนี้ลง editing */}
                    <button type="button" onClick={() => setEditing(item)}>แก้ไข</button>

                    <button type="button" onClick={() => removeProduct(item.id)}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
