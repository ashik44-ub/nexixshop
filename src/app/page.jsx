import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import Link from "next/link";
import Image from "next/image";

async function getData() {
  await dbConnect();
  const [featured, latest, categories] = await Promise.all([
    Product.find({ isFeatured: true, isActive: true }).limit(8).lean(),
    Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(8).lean(),
    Category.find().limit(6).lean(),
  ]);
  return {
    featured: JSON.parse(JSON.stringify(featured)),
    latest: JSON.parse(JSON.stringify(latest)),
    categories: JSON.parse(JSON.stringify(categories)),
  };
}

export default async function HomePage() {
  const { featured, latest, categories } = await getData();

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                Everything you need, <br /> delivered to your door.
              </h1>
              <p className="mt-4 text-primary-100 max-w-md">
                Discover thousands of products at unbeatable prices — with fast, reliable shipping.
              </p>
              <Link href="/shop" className="inline-block mt-6 bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors">
                Shop Now
              </Link>
            </div>
            <div className="flex-1 relative h-64 w-full">
              <Image
                src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80"
                alt="Shopping"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-10">
            <h2 className="text-xl font-bold mb-4">Shop by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/shop?category=${cat._id}`}
                  className="card p-4 text-center hover:shadow-lg transition-shadow"
                >
                  <p className="text-sm font-medium">{cat.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Featured Products</h2>
              <Link href="/shop" className="text-primary-600 text-sm font-medium">View all →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Latest */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">New Arrivals</h2>
            <Link href="/shop" className="text-primary-600 text-sm font-medium">View all →</Link>
          </div>
          {latest.length === 0 ? (
            <p className="text-gray-500 text-sm">No products yet. Check back soon, or log in as admin to add some.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {latest.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
