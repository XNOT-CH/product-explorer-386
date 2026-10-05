import { auth } from "@/auth";
import ProductExplorer from "@/components/ProductExplorer";
import { AuthButtons } from "./auth-buttons";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);

  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>เข้าสู่ระบบ</h1>
          <p>กรุณาเข้าสู่ระบบด้วยบัญชี Google ก่อนจัดการสินค้า</p>
          <AuthButtons isLoggedIn={false} />
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="auth-bar">
        <AuthButtons isLoggedIn userName={session?.user?.name} />
      </header>
      <ProductExplorer />
    </>
  );
}
