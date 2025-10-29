import Link from "next/link";

export default function Home() {
  const products = [
    { id: 1, name: "후드티", price: "29,900원" },
    { id: 2, name: "신발", price: "89,000원" },
    { id: 3, name: "양말", price: "15,000원" },
    { id: 4, name: "패딩", price: "129,000원" },
    { id: 5, name: "모자", price: "49,000원" },
    { id: 6, name: "바지", price: "79,000원" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              STORE
            </Link>
            <div className="flex items-center space-x-8">
              <Link href="/products" className="text-sm hover:underline">
                PRODUCTS
              </Link>
              <Link href="/signup" className="text-sm hover:underline">
                SIGN UP
              </Link>
              <Link href="/login" className="text-sm hover:underline">
                LOGIN
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-light mb-12 tracking-tight">PRODUCTS</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-black cursor-pointer hover:bg-black hover:text-white transition"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <div className="w-3/4 h-3/4 border border-gray-300"></div>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="text-sm font-medium">{product.name}</h3>
                <p className="text-sm font-light">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-black mt-32">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex justify-between items-center text-sm">
            <p className="font-light">&copy; 2025 STORE</p>
            <div className="flex space-x-6">
              <Link href="/about" className="hover:underline">
                ABOUT
              </Link>
              <Link href="/contact" className="hover:underline">
                CONTACT
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
