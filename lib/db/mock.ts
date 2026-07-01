export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}

export const mockProducts: Product[] = [
    {
        id: "1",
        name: "Premium Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation.",
        price: 299.99,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    },
    {
        id: "2",
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with tactile switches.",
        price: 149.99,
        imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80",
    },
    {
        id: "3",
        name: "Smart Watch Series 7",
        description: "Latest generation smartwatch with health tracking features.",
        price: 399.99,
        imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
    },
    {
        id: "4",
        name: "4K Action Camera",
        description: "Waterproof action camera capable of recording in 4K resolution.",
        price: 249.99,
        imageUrl: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=800&q=80",
    },
];

export interface Order {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
}

export let mockOrders: Order[] = [
    {
        id: "101",
        totalAmount: 299.99,
        status: "pending",
        createdAt: new Date().toISOString(),
    }
];

export const mockAuthUser = {
    id: "user_123",
    email: "test@example.com",
};

export const addMockOrder = (order: Order) => {
    mockOrders.push(order);
}
