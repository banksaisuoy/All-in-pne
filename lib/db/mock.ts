export const mockProducts = [
    {
        id: '1',
        name: 'Neural Enhancer 3000',
        description: 'Boost your cognitive function with the latest in neural enhancement tech.',
        description_html: '<h3>Features</h3><ul><li>Boost memory</li><li>Enhanced focus</li></ul>',
        price: 499.99,
        currency: 'USD',
        image_url: 'https://placehold.co/400x400?text=Neural+Enhancer',
        stock_quantity: 15,
        tags: ['tech', 'neural', 'enhancement'],
        vector_embedding: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Quantum Keyboard',
        description: 'Type at the speed of thought with our quantum entanglement keys.',
        description_html: '<h3>Features</h3><ul><li>Zero latency</li><li>Thought-driven input</li></ul>',
        price: 299.99,
        currency: 'USD',
        image_url: 'https://placehold.co/400x400?text=Quantum+Keyboard',
        stock_quantity: 50,
        tags: ['tech', 'keyboard', 'quantum'],
        vector_embedding: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

export const mockOrders = [
    {
        id: 'o-1',
        userId: 'u-1',
        totalAmount: 499.99,
        status: 'pending',
        created_at: new Date().toISOString()
    },
    {
        id: 'o-2',
        userId: 'u-2',
        totalAmount: 599.98,
        status: 'shipped',
        created_at: new Date().toISOString()
    }
];
export const mockProfiles = [];
