    "use client";
    import React, { useEffect, useState } from "react";
    import { useDispatch, useSelector } from "react-redux";
    import { addItemToCart } from "../../app/store/cartSlice"; // Adjust path as needed
    import { useRouter } from "next/navigation";
    import { 
    Heart, 
    ShoppingCart, 
    Eye, 
    Filter, 
    Grid3X3, 
    List, 
    Search,
    SlidersHorizontal,
    ChevronDown,
    Star,
    ArrowLeft,
    X
    } from "lucide-react";
import Image from "next/image";

    function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [viewMode, setViewMode] = useState("grid"); // grid or list
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const productsPerPage = 12;

    // Filter states
    const [filters, setFilters] = useState({
        category: [],
        priceRange: [0, 100000],
        discount: [],
        inStock: false
    });

    const dispatch = useDispatch();
    const cart = useSelector(
        (state) => state.cart || { items: [], totalQuantity: 0, totalAmount: 0 }
    );
    const cartItems = cart.items;

    // Categories for filtering
    useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

    // Fetch all products
    useEffect(() => {
        const fetchProducts = async () => {
        try {
            const res = await fetch("/api/productsUserside");
            const data = await res.json();
            if (data.products) {
            setProducts(data.products);
            setFilteredProducts(data.products);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
        };
        fetchProducts();
    }, []);

    // Filter and search products
    useEffect(() => {
        let filtered = [...products];

        // Search filter
        if (searchQuery) {
        filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        }

        // Category filter
      // Category filter
if (filters.category.length > 0) {
  filtered = filtered.filter(product =>
    filters.category.includes(product.categoryId) // ✅ match by id, not name
  );
}


        // Price range filter
        filtered = filtered.filter(product =>
        Number(product.price) >= filters.priceRange[0] &&
        Number(product.price) <= filters.priceRange[1]
        );

        // Discount filter
        if (filters.discount.length > 0) {
        filtered = filtered.filter(product =>
            filters.discount.includes(product.isDiscounted)
        );
        }

        // Sort products
        filtered.sort((a, b) => {
        switch (sortBy) {
            case "price-low":
            return Number(a.price) - Number(b.price);
            case "price-high":
            return Number(b.price) - Number(a.price);
            case "name":
            return a.name.localeCompare(b.name);
            case "newest":
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            default:
            return 0;
        }
        });

        setFilteredProducts(filtered);
        setCurrentPage(1);
    }, [products, searchQuery, filters, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const currentProducts = filteredProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    // Handle add to cart
    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        dispatch(
        addItemToCart({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.images?.[0]?.url || "/api/placeholder/300/250",
        })
        );
    };

    // Check if product is in cart
    const isInCart = (productId) => {
        return Array.isArray(cartItems) && cartItems.some((item) => item.id === productId);
    };

    // Handle filter changes
    const handleFilterChange = (type, value) => {
  setFilters((prev) => {
    const updated = prev[type].includes(value)
      ? prev[type].filter((v) => v !== value) // remove if already selected
      : [...prev[type], value];              // add if not selected
    return { ...prev, [type]: updated };
  });
};


    // Clear all filters
    const clearAllFilters = () => {
        setFilters({
        category: [],
        priceRange: [0, 100000],
        discount: [],
        inStock: false
        });
        setSearchQuery("");
    };

    if (loading) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Loading all products...</p>
            </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header */}
        <div className="bg-white shadow-lg sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
                {/* Back Button & Title */}
                <div className="flex items-center space-x-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    All Products
                    </h1>
                    <p className="text-gray-600">
                    {filteredProducts.length} products found
                    </p>
                </div>
                </div>

                {/* View Mode Toggle */}
                <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid" ? "bg-white shadow text-amber-600" : "text-gray-600"
                    }`}
                >
                    <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list" ? "bg-white shadow text-amber-600" : "text-gray-600"
                    }`}
                >
                    <List className="w-5 h-5" />
                </button>
                </div>
            </div>
            </div>
        </div>

        <div className="container mx-auto px-4 py-8">
            <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className={`lg:w-64 ${showFilters ? 'fixed inset-0 z-50 lg:relative' : 'hidden lg:block'}`}>
                <div className={`bg-white rounded-2xl shadow-lg p-6 ${showFilters ? 'mt-20 mx-4 h-fit max-h-[calc(100vh-120px)] overflow-y-auto' : ''}`}>
                {/* Mobile Filter Header */}
                {showFilters && (
                    <div className="flex items-center justify-between mb-6 lg:hidden">
                    <h3 className="text-lg font-bold">Filters</h3>
                    <button
                        onClick={() => setShowFilters(false)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    </div>
                )}

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold hidden lg:block">Filters</h3>
                    <button
                    onClick={clearAllFilters}
                    className="text-sm text-amber-600 hover:text-amber-700 font-semibold"
                    >
                    Clear All
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">Search</label>
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">Categories</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                   {categories.map((category) => (
  <label key={category.id} className="flex items-center">
  <input
  type="checkbox"
  checked={filters.category.includes(category.id)} 
  onChange={() => handleFilterChange("category", category.id)}
/>
<span>{category.name}</span>

  </label>
))}

                    </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">Price Range</label>
                    <div className="flex items-center space-x-2">
                    <input
                        type="number"
                        value={filters.priceRange[0]}
                        onChange={(e) => handleFilterChange("priceRange", [Number(e.target.value), filters.priceRange[1]])}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Min"
                    />
                    <span>-</span>
                    <input
                        type="number"
                        value={filters.priceRange[1]}
                        onChange={(e) => handleFilterChange("priceRange", [filters.priceRange[0], Number(e.target.value)])}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Max"
                    />
                    </div>
                </div>

                {/* Discount */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">Discount</label>
                    <div className="space-y-2">
                    {["PERCENT_20", "PERCENT_30"].map((discount) => (
                        <label key={discount} className="flex items-center">
                        <input
                            type="checkbox"
                            checked={filters.discount.includes(discount)}
                            onChange={() => handleFilterChange("discount", discount)}
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="ml-2 text-sm">
                            {discount === "PERCENT_20" ? "20% OFF" : "30% OFF"}
                        </span>
                        </label>
                    ))}
                    </div>
                </div>

                {/* Apply Filters Button (Mobile) */}
                {showFilters && (
                    <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden w-full bg-amber-500 text-white py-2 rounded-lg font-semibold"
                    >
                    Apply Filters
                    </button>
                )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {/* Toolbar */}
                <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                    {/* Mobile Filter Button */}
                    <button
                        onClick={() => setShowFilters(true)}
                        className="lg:hidden flex items-center space-x-2 bg-amber-500 text-white px-4 py-2 rounded-lg"
                    >
                        <Filter className="w-4 h-4" />
                        <span>Filters</span>
                    </button>

                    {/* Active Filters */}
                    <div className="hidden md:flex items-center space-x-2">
                    {filters.category.map(categoryId => {
  const cat = categories.find(c => c.id === categoryId);
  return (
    <span key={categoryId} className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
      {cat ? cat.name : categoryId}
      <button
        onClick={() => handleFilterChange("category", categoryId)}
        className="ml-1 hover:text-amber-600"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
})}

                    </div>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="name">Name (A-Z)</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="newest">Newest First</option>
                    </select>
                    </div>
                </div>
                </div>

                {/* Products Grid/List */}
                {currentProducts.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">No products found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                    <button
                    onClick={clearAllFilters}
                    className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                    >
                    Clear All Filters
                    </button>
                </div>
                ) : (
                <>
                    <div className={
                    viewMode === "grid" 
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        : "space-y-6"
                    }>
                    {currentProducts.map((product, index) => {
                        const discountText =
                        product.isDiscounted === "PERCENT_20"
                            ? "20% OFF"
                            : product.isDiscounted === "PERCENT_30"
                            ? "30% OFF"
                            : "";
                        const imageUrl = product.images?.[0]?.url || "/api/placeholder/300/250";
                        const productInCart = isInCart(product.id);

                        if (viewMode === "list") {
                        return (
                            <div
                            key={product.id}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex cursor-pointer"
                            onClick={() => router.push(`/ProductDetailsPage/${product.id}`)}
                            >
                            <div className="relative w-48 h-48 flex-shrink-0">
                                <Image
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                />
                                {discountText && (
                                <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-2 py-1 text-xs rounded-full font-bold">
                                    {discountText}
                                </div>
                                )}
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div>
                                <h3 className="font-bold text-xl mb-2 text-gray-900 hover:text-amber-600 transition-colors">{product.name}</h3>
                                <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p> 
                                <div className="flex items-center mb-2">
                                    <div className="flex text-yellow-400 mr-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                    </div>
                                    <span className="text-sm text-gray-600">(4.8)</span>
                                </div>
                                </div>
                                <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                    ₹{Number(product.price).toLocaleString()}
                                    </span>
                                    {discountText && (
                                    <span className="text-sm text-gray-400 line-through">
                                        ₹{Math.round(Number(product.price) * 1.25).toLocaleString()}
                                    </span>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => handleAddToCart(e, product)}
                                    disabled={productInCart}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                                    productInCart
                                        ? "bg-green-500 text-white cursor-not-allowed"
                                        : "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 hover:shadow-lg transform hover:scale-105"
                                    }`}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>{productInCart ? "In Cart" : "Add to Cart"}</span>
                                </button>
                                </div>
                            </div>
                            </div>
                        );
                        }

                        return (
                        <div
                            key={product.id}
                            className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                            onClick={() => router.push(`/ProductDetailsPage/${product.id}`)}
                        >
                            <div className="relative overflow-hidden">
                          <Image
  src={product.image}        // URL of your image
  alt={product.name}         // Alt text for accessibility
  width={400}                // Optional: set width
  height={256}               // Optional: set height
  className="h-64 w-full object-cover group-hover:scale-110 transition-transform duration-500"
/>
                            {discountText && (
                                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 text-sm font-bold rounded-full shadow-lg">
                                {discountText}
                                </div>
                            )}
                            <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                <div className="flex space-x-3 transform translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <button className="p-3 bg-white rounded-full text-gray-700 hover:text-red-500 transition-colors shadow-lg">
                                    <Heart className="w-5 h-5" />
                                </button>
                                <button className="p-3 bg-white rounded-full text-gray-700 hover:text-amber-600 transition-colors shadow-lg">
                                    <Eye className="w-5 h-5" />
                                </button>
                                </div>
                            </div>
                            </div>
                            <div className="p-6">
                            <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1">{product.name}</h3>
                            <div className="flex gap-1 items-center mb-2">
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{product.description}</p><p className="text-gray-600 mb-4 line-clamp-2">{product.categoryName}</p>
                                </div>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                    ₹{Number(product.price).toLocaleString()}
                                </span>
                                {discountText && (
                                    <span className="text-sm text-gray-400 line-through">
                                    ₹{Math.round(Number(product.price) * 1.25).toLocaleString()}
                                    </span>
                                )}
                                </div>
                                <button
                                onClick={(e) => handleAddToCart(e, product)}
                                disabled={productInCart}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                                    productInCart
                                    ? "bg-green-500 text-white cursor-not-allowed"
                                    : "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 hover:shadow-lg transform hover:scale-105"
                                }`}
                                >
                                <ShoppingCart className="w-4 h-4" />
                                <span className="text-sm">{productInCart ? "In Cart" : "Add to Cart"}</span>
                                </button>
                            </div>
                            </div>
                        </div>
                        );
                    })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-12">
                        <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                        Previous
                        </button>
                        
                        {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                            pageNumber = index + 1;
                        } else if (currentPage <= 3) {
                            pageNumber = index + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + index;
                        } else {
                            pageNumber = currentPage - 2 + index;
                        }
                        
                        return (
                            <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`px-4 py-3 rounded-xl font-semibold transition-colors ${
                                currentPage === pageNumber
                                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg"
                                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                            }`}
                            >
                            {pageNumber}
                            </button>
                        );
                        })}
                        
                        <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                        Next
                        </button>
                    </div>
                    )}

                    {/* Results Summary */}
                    <div className="text-center mt-8 text-gray-600">
                    <p>
                        Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                    </p>
                    </div>
                </>
                )}
            </div>
            </div>
        </div>

        {/* Mobile Filter Overlay */}
        {showFilters && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setShowFilters(false)} />
        )}

        <style jsx>{`
            .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
            }
            .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            }
        `}</style>
        </div>
    );
    }

    export default ProductsPage;