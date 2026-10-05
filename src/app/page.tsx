import { auth } from "@/auth";
import ProductExplorer from "@/components/ProductExplorer";
import { AuthButtons } from "./auth-buttons";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);

  if (!isLoggedIn) {
    return (
      <main>
        <h1>กรุณาเข้าสู่ระบบก่อนใช้งาน</h1>
        <AuthButtons isLoggedIn={false} />
      </main>
    );
  }

  return (
    <>
      <header>
        <AuthButtons isLoggedIn userName={session?.user?.name} />
      </header>
      <ProductExplorer />
    </>
  );
}
