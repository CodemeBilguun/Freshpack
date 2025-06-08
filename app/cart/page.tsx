import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
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
  const res = await fetch(`https://fakestoreapi.com/products/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch product with ID: ${id}`);
  }
  return res.json() as Promise<Product>;
}

async function updateCartQuantity(formData: FormData) {
  "use server";

  const productId = formData.get("productId") as string;
  const action = formData.get("action") as string;

  const cartCookie = cookies().get("cart")?.value;
  if (!cartCookie) return { success: false };

  const cart = JSON.parse(cartCookie);

  const itemIndex = cart.items.findIndex((item: any) => item.id === productId);
  if (itemIndex < 0) return { success: false };

  if (action === "increase") {
    cart.items[itemIndex].quantity += 1;
  } else if (action === "decrease") {
    if (cart.items[itemIndex].quantity > 1) {
      cart.items[itemIndex].quantity -= 1;
    } else {
      cart.items.splice(itemIndex, 1);
    }
  } else if (action === "remove") {
    cart.items.splice(itemIndex, 1);
  }

  cart.count = cart.items.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0
  );

  cookies().set("cart", JSON.stringify(cart), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true };
}

export default async function Cart() {
  const cartCookie = cookies().get("cart")?.value;
  const cart = cartCookie ? JSON.parse(cartCookie) : { items: [], count: 0 };
  const cartCount = cart.count;

  const cartItemsWithDetails = await Promise.all(
    cart.items.map(async (item: any) => {
      const product = await getProduct(item.id);
      return {
        ...product,
        quantity: item.quantity,
        totalPrice: product.price * item.quantity * 3500,
      };
    })
  );

  const subtotal = cartItemsWithDetails.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const total = subtotal;

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
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              <span className="font-medium text-gray-700">{cartCount}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItemsWithDetails.length === 0 ? (
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Таны сагс хоосон байна
            </h1>
            <p className="text-gray-600 mb-6">
              Бараа нэмэхийн тулд дэлгүүр рүү буцаж бараа сонгоно уу.
            </p>
            <Link href="/">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Дэлгүүр рүү буцах
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Сагс{" "}
                <span className="text-gray-500 font-normal">
                  ({cart.count} бараа)
                </span>
              </h1>

              <div className="space-y-4">
                {cartItemsWithDetails.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-contain"
                        />

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {item.category}
                          </p>
                          <p className="font-bold text-lg text-gray-900 mt-1">
                            {(item.price * 3500).toLocaleString()}₮
                          </p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <form action={updateCartQuantity}>
                            <input
                              type="hidden"
                              name="productId"
                              value={item.id}
                            />
                            <input
                              type="hidden"
                              name="action"
                              value="decrease"
                            />
                            <Button
                              type="submit"
                              variant="outline"
                              size="icon"
                              className="w-8 h-8 rounded-full"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          </form>

                          <span className="font-medium w-8 text-center">
                            {item.quantity}
                          </span>

                          <form action={updateCartQuantity}>
                            <input
                              type="hidden"
                              name="productId"
                              value={item.id}
                            />
                            <input
                              type="hidden"
                              name="action"
                              value="increase"
                            />
                            <Button
                              type="submit"
                              size="icon"
                              className="w-8 h-8 rounded-full bg-green-600 hover:bg-green-700"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </form>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <p className="font-bold text-lg text-gray-900">
                            {item.totalPrice.toLocaleString()}₮
                          </p>
                          <form action={updateCartQuantity}>
                            <input
                              type="hidden"
                              name="productId"
                              value={item.id}
                            />
                            <input type="hidden" name="action" value="remove" />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </form>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Захиалах
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Захиалгын дүн {cart.count} бүтээгдэхүүн
                      </span>
                      <span className="font-medium">
                        {subtotal.toLocaleString()}₮
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Төлөх дүн</span>
                      <span>{total.toLocaleString()}₮</span>
                    </div>
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg">
                    Захиалах
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
