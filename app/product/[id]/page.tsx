import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
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

async function getProduct(id: string) {
  const res = await fetch(`https://fakestoreapi.com/products/${id}`, {
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }
  return res.json() as Promise<Product>;
}

async function getRecommendedProducts(category: string, currentId: string) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const res = await fetch(
    `https://fakestoreapi.com/products/category/${encodeURIComponent(
      category
    )}`,
    {
      cache: "force-cache",
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch recommended products");
  }
  const products = (await res.json()) as Product[];

  return products.filter((product) => product.id.toString() !== currentId);
}

function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 w-1/3 mb-8 rounded"></div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-1">
          <div className="h-24 w-24 bg-gray-200 rounded mb-4"></div>
        </div>

        <div className="col-span-5">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>

        <div className="col-span-4 space-y-4">
          <div className="h-10 bg-gray-200 w-3/4 rounded"></div>
          <div className="h-6 bg-gray-200 w-1/2 rounded"></div>
          <div className="h-4 bg-gray-200 w-full rounded"></div>
          <div className="h-4 bg-gray-200 w-full rounded"></div>
        </div>

        <div className="col-span-2 space-y-4">
          <div className="h-10 bg-gray-200 w-full rounded"></div>
          <div className="h-12 bg-gray-200 w-full rounded"></div>
          <div className="h-12 bg-gray-200 w-full rounded"></div>
        </div>
      </div>
    </div>
  );
}

function RecommendedProductsSkeleton() {
  return (
    <div>
      <div className="h-8 bg-gray-200 rounded w-48 mb-6 mt-8"></div>
      <div className="grid grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
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

  cookieStore.set("cart", JSON.stringify(cart), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true, count: cart.count };
}

async function ProductDetails({ id }: { id: string }) {
  const product = await getProduct(id);

  const formatPrice = (price: number) => {
    return `${(price * 3500).toLocaleString()}₮`;
  };

  return (
    <>
      <div className="flex items-center text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-green-600">
          Бөөндөг
        </Link>
        <span className="mx-2">{">"}</span>
        <Link
          href={`/?category=${encodeURIComponent(product.category)}`}
          className="hover:text-green-600 capitalize"
        >
          {product.category}
        </Link>
        <span className="mx-2">{">"}</span>
        <span className="text-gray-400 line-clamp-1">{product.title}</span>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-1">
          <div className="border border-gray-200 rounded p-2 cursor-pointer hover:border-green-600 mb-4">
            <Image
              src={product.image}
              alt={product.title}
              width={80}
              height={80}
              className="w-full object-contain"
              style={{ aspectRatio: "1/1" }}
            />
          </div>
        </div>

        <div className="col-span-5">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <Image
              src={product.image}
              alt={product.title}
              width={400}
              height={400}
              className="w-full h-80 object-contain"
              priority
            />
          </div>
        </div>

        <div className="col-span-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {product.title}
          </h1>
          <div className="text-sm text-gray-600 mb-4">{product.category}</div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">
              Дэлгэрэнгүй мэдээлэл
            </h3>
            <p className="text-gray-600">{product.description}</p>
          </div>
        </div>

        <div className="col-span-2">
          <div className="text-3xl font-bold text-gray-900 mb-6">
            {formatPrice(product.price)}
          </div>

          <form action={addToCart} className="space-y-4">
            <input type="hidden" name="productId" value={product.id} />
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
            >
              Сагслах
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-200 text-gray-800 hover:bg-gray-100 py-3 text-lg"
            >
              Шууд авах
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

async function RecommendedProducts({
  category,
  productId,
}: {
  category: string;
  productId: string;
}) {
  const recommendedProducts = await getRecommendedProducts(category, productId);

  if (recommendedProducts.length === 0) {
    return null;
  }

  const formatPrice = (price: number) => {
    return `${(price * 3500).toLocaleString()}₮`;
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Санал болгох</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {recommendedProducts.slice(0, 4).map((product) => (
          <Link
            href={`/product/${product.id}`}
            key={product.id}
            className="group"
          >
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={200}
                  height={200}
                  className="w-full h-48 object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-lg text-gray-900">
                  {formatPrice(product.price)}
                </p>
                <h3 className="font-medium text-gray-900 group-hover:text-green-600 line-clamp-2">
                  {product.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function ProductDetail({
  params,
}: {
  params: { id: string };
}) {
  const productId = params.id;

  const cookieStore = cookies();
  const cartCookie = cookieStore.get("cart")?.value;
  const cartCount = cartCookie ? JSON.parse(cartCookie).count || 0 : 0;

  const product = await getProduct(productId);
  const productCategory = product.category;

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
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetails id={productId} />
        </Suspense>

        <Suspense fallback={<RecommendedProductsSkeleton />}>
          <RecommendedProducts
            category={productCategory}
            productId={productId}
          />
        </Suspense>
      </div>
    </div>
  );
}
