// Base de datos de productos
const products = [
    // Laptops (2)
    {
        id: 1,
        name: "MacBook Pro 14 pulgadas",
        brand: "Apple",
        category: "laptops",
        price: 1999,
        originalPrice: 2299,
        discount: 13,
        rating: 4.8,
        reviews: 127,
        images: ["images/Mac Book.webp"],
        description: "MacBook Pro de 14 pulgadas con chip M3 Pro, 18GB de memoria unificada y SSD de 512GB.",
        features: ["Chip Apple M3 Pro","18GB de memoria unificada","SSD de 512GB","Pantalla Liquid Retina XDR"],
        inStock: true,
        stock: 10
    },
    {
        id: 2,
        name: "Dell XPS 13 Plus",
        brand: "Dell",
        category: "laptops",
        price: 1299,
        originalPrice: 1499,
        discount: 13,
        rating: 4.6,
        reviews: 95,
        images: ["images/Dellxps.jpg"],
        description: "Dell XPS 13 Plus con procesador Intel y pantalla OLED.",
        features: ["Intel Core i7","16GB LPDDR5","SSD de 512GB"],
        inStock: true,
        stock: 6
    },

    // Smartphones (2)
    {
        id: 3,
        name: "iPhone 15 Pro Max",
        brand: "Apple",
        category: "smartphones",
        price: 1199,
        originalPrice: 1299,
        discount: 8,
        rating: 4.9,
        reviews: 243,
        images: [
           "images/iphone15-front.webp",
        ],
        description: "iPhone 15 Pro Max con titanio y cámara avanzada de 48MP.",
        features: ["Chip A17 Pro","Cámara 48MP","Titanio"],
        inStock: true,
        stock: 8
    },
    {
        id: 4,
        name: "Google Pixel 8 Pro",
        brand: "Google",
        category: "smartphones",
        price: 999,
        originalPrice: 1099,
        discount: 9,
        rating: 4.7,
        reviews: 134,
        images: [
            "images/Google_Pixel.webp",
        ],
        description: "Google Pixel 8 Pro con chip Tensor G3 y fotografía computacional.",
        features: ["Chip Tensor G3","Cámara avanzada","Actualizaciones por años"],
        inStock: true,
        stock: 12
    },

    // Tablets (2)
    {
        id: 5,
        name: "iPad Pro 12.9 pulgadas",
        brand: "Apple",
        category: "tablets",
        price: 1099,
        originalPrice: 1199,
        discount: 8,
        rating: 4.8,
        reviews: 156,
        images: ["images/iPad Pro 12.9 pulgadas.jpg"],
        description: "iPad Pro de 12.9 pulgadas con chip M2 y pantalla Liquid Retina XDR.",
        features: ["Chip M2","Pantalla Liquid Retina XDR","Compatible con Apple Pencil"],
        inStock: true,
        stock: 14
    },
    {
        id: 6,
        name: "Samsung Galaxy Tab S9+",
        brand: "Samsung",
        category: "tablets",
        price: 899,
        originalPrice: 999,
        discount: 10,
        rating: 4.6,
        reviews: 87,
        images: ["images/Samsung Galaxy Tab S9+.webp"],
        description: "Galaxy Tab S9+ con S Pen y pantalla AMOLED.",
        features: ["S Pen","Pantalla AMOLED","Batería duradera"],
        inStock: true,
        stock: 10
    },

    // Accessories (sin stock)
    {
        id: 7,
        name: "Sony WH-1000XM5",
        brand: "Sony",
        category: "accessories",
        price: 399,
        originalPrice: 449,
        discount: 11,
        rating: 4.9,
        reviews: 312,
        images: ["images/Sony WH-1000XM5.jpg"],
        description: "Auriculares inalámbricos con cancelación de ruido.",
        features: ["Cancelación de ruido","Hasta 30 horas de batería"],
        inStock: false,
        stock: 0
    },

    // Gaming (sin stock)
    {
        id: 8,
        name: "PlayStation 5",
        brand: "Sony",
        category: "gaming",
        price: 499,
        originalPrice: 559,
        discount: 11,
        rating: 4.7,
        reviews: 401,
        images: ["images/PlayStation 5.webp"],
        description: "PlayStation 5 con SSD ultrarrápido y audio 3D.",
        features: ["SSD ultrarrápido","Audio 3D","DualSense"],
        inStock: false,
        stock: 0
    }
];

// Función para obtener todos los productos
function getAllProducts() {
    return products;
}

// Función para obtener productos por categoría
function getProductsByCategory(category) {
    if (category === 'all') {
        return products;
    }
    return products.filter(product => product.category === category);
}

// Función para buscar productos
function searchProducts(query) {
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
}

// Función para filtrar productos por precio
function filterProductsByPrice(products, priceRange) {
    if (priceRange === 'all') return products;
    
    const ranges = {
        '0-500': [0, 500],
        '500-1000': [500, 1000],
        '1000-1500': [1000, 1500],
        '1500+': [1500, Infinity]
    };
    
    const [min, max] = ranges[priceRange];
    return products.filter(product => product.price >= min && product.price <= max);
}

// Función para filtrar productos por marca
function filterProductsByBrand(products, brand) {
    if (brand === 'all') return products;
    return products.filter(product => product.brand.toLowerCase() === brand.toLowerCase());
}

// Función para ordenar productos
function sortProducts(products, sortBy) {
    const sortedProducts = [...products];
    
    switch (sortBy) {
        case 'price-low':
            return sortedProducts.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sortedProducts.sort((a, b) => b.price - a.price);
        case 'rating':
            return sortedProducts.sort((a, b) => b.rating - a.rating);
        case 'name':
        default:
            return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
}

// Función para obtener un producto por ID
function getProductById(id) {
    return products.find(product => product.id === parseInt(id));
}

// Función para obtener productos relacionados
function getRelatedProducts(productId, limit = 4) {
    const product = getProductById(productId);
    if (!product) return [];
    
    const related = products
        .filter(p => p.id !== productId && p.category === product.category)
        .slice(0, limit);
    
    // Si no hay suficientes productos de la misma categoría, completar con otros
    if (related.length < limit) {
        const additional = products
            .filter(p => p.id !== productId && p.category !== product.category)
            .slice(0, limit - related.length);
        related.push(...additional);
    }
    
    return related;
}

// Función para obtener productos en oferta
function getFeaturedProducts(limit = 6) {
    return products
        .filter(product => product.discount > 0)
        .sort((a, b) => b.discount - a.discount)
        .slice(0, limit);
}

// Función para generar estrellas de rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    // Estrellas completas
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star star"></i>';
    }
    
    // Media estrella
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt star"></i>';
    }
    
    // Estrellas vacías
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star star"></i>';
    }
    
    return starsHTML;
}

// Función para formatear precio
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Función para verificar si un producto está en stock
function isInStock(productId) {
    const product = getProductById(productId);
    return product && product.inStock && product.stock > 0;
}

// Función para reducir stock (simulación)
function reduceStock(productId, quantity = 1) {
    const product = getProductById(productId);
    if (product && product.stock >= quantity) {
        product.stock -= quantity;
        if (product.stock === 0) {
            product.inStock = false;
        }
        return true;
    }
    return false;
}

// Exportar funciones (para usar en otros archivos)
if (typeof window !== 'undefined') {
    window.productUtils = {
        getAllProducts,
        getProductsByCategory,
        searchProducts,
        filterProductsByPrice,
        filterProductsByBrand,
        sortProducts,
        getProductById,
        getRelatedProducts,
        getFeaturedProducts,
        generateStars,
        formatPrice,
        isInStock,
        reduceStock
    };
}