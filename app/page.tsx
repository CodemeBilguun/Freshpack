import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Suspense } from "react";
import { cookies } from "next/headers";

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

async function addToCart(formData: FormData) {
  "use server";

  const productId = formData.get("productId") as string;
  const quantity = 1;

  const cookieStore = cookies();
  const cartCookie = cookieStore.get("cart")?.value;
  const cart = cartCookie ? JSON.parse(cartCookie) : { items: [], count: 0 };

  const existingItemIndex = cart.items.findIndex(
    (item: any) => item.id === productId
  );

  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ id: productId, quantity });
  }

  cart.count = cart.items.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0
  );

  cookies().set("cart", JSON.stringify(cart), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true, count: cart.count };
}

async function getProducts(category?: string) {
  const url = category
    ? `https://fakestoreapi.com/products/category/${encodeURIComponent(
        category
      )}`
    : "https://fakestoreapi.com/products";

  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return res.json() as Promise<Product[]>;
}

async function getCategories() {
  const res = await fetch("https://fakestoreapi.com/products/categories", {
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }
  return res.json() as Promise<string[]>;
}

function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="bg-gray-200 w-full h-48 mb-4 rounded"></div>
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white rounded-lg p-6">
        <div className="h-6 bg-gray-200 w-24 mb-4 rounded"></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function Products({ category }: { category?: string }) {
  const products = await getProducts(category);

  const formatPrice = (price: number) => {
    return `${(price * 3500).toLocaleString()}₮`;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {category
              ? category.charAt(0).toUpperCase() + category.slice(1)
              : "Бүх бараа"}
          </h1>
          <p className="text-gray-600">{products.length} бараа</p>
        </div>
        <select className="border border-gray-300 rounded-md px-3 py-2">
          <option>Шинэ нь эхэндээ</option>
          <option>Үнэ өсөхөөр </option>
          <option>Үнэ буурахаар</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className="group hover:shadow-lg transition-shadow flex flex-col h-full"
          >
            <CardContent className="p-4 flex flex-col h-full">
              <div className="relative mb-4 h-48 flex items-center justify-center">
                <Link
                  href={`/product/${product.id}`}
                  className="h-full w-full flex items-center justify-center"
                >
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={200}
                    height={200}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                  />
                </Link>
              </div>

              <div className="flex flex-col flex-grow">
                <p className="font-bold text-lg text-gray-900">
                  {formatPrice(product.price)}
                </p>

                <Link href={`/product/${product.id}`} className="h-12 mb-2">
                  <h3 className="font-medium text-gray-900 hover:text-green-600 line-clamp-2">
                    {product.title}
                  </h3>
                </Link>

                <p className="text-sm text-gray-600 line-clamp-1 mb-4 h-5">
                  {product.category}
                </p>

                <form action={addToCart} className="mt-auto">
                  <input type="hidden" name="productId" value={product.id} />
                  <Button
                    type="submit"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-black border border-gray-200"
                  >
                    Сагслах
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

async function CategoriesSidebar({
  selectedCategory,
}: {
  selectedCategory?: string;
}) {
  const categories = await getCategories();

  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Ангилал</h3>
        <ul className="space-y-3">
          <li>
            <Link
              href="/"
              className={`text-left w-full capitalize block ${
                !selectedCategory
                  ? "text-green-600 font-medium"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              Бүх бараа
            </Link>
          </li>
          {categories.map((category, index) => (
            <li key={index}>
              <Link
                href={`/?category=${encodeURIComponent(category)}`}
                className={`text-left w-full capitalize block ${
                  selectedCategory === category
                    ? "text-green-600 font-medium"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                {category}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default async function ProductList({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  // Fix 1: Properly await searchParams
  const categoryParam = searchParams?.category;

  // Fix 2: Properly await cookies
  const cookieStore = cookies();
  const cartCookie = cookieStore.get("cart")?.value;
  const cartCount = cartCookie ? JSON.parse(cartCookie).count || 0 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/freshpack.png"
                alt="FreshPack Logo"
                width={150}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <Link
              href="/cart"
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              <span className="font-medium text-gray-700">{cartCount}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <Suspense fallback={<CategoriesSkeleton />}>
            <CategoriesSidebar selectedCategory={categoryParam} />
          </Suspense>

          <div className="flex-1">
            <Suspense fallback={<ProductsSkeleton />}>
              <Products category={categoryParam} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
