'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Meal {
    name: string;
    price: number;
    image_url: string;
}

interface Order {
    id: string;
    meal: Meal;
    quantity: number;
    order_time: string;
    status: string;
}

interface OrderWithMeal {
    id: string;
    quantity: number;
    order_time: string;
    status: string;
    meal_id: string;
    meals: {
        name: string;
        portion_sizes: {
            medium: {
                price: number;
            };
        };
    }[];
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const supabase = createClient();
                
                // Get the current user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    throw new Error('User not authenticated');
                }

                // Fetch orders with meal details, excluding deleted orders
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        id,
                        quantity,
                        order_time,
                        status,
                        meal_id,
                        meals!inner (
                            name,
                            portion_sizes
                        )
                    `)
                    .eq('user_id', user.id)
                    .neq('status', 'deleted')
                    .order('order_time', { ascending: false });

                if (error) throw error;

                // Transform the data to match our Order interface
                const transformedOrders: Order[] = (data as OrderWithMeal[]).map(order => {
                    const meal = Array.isArray(order.meals) ? order.meals[0] : order.meals;
                    return {
                        id: order.id,
                        meal: {
                            name: meal?.name ?? '',
                            price: meal?.portion_sizes?.medium?.price ?? 0,
                            image_url: '' // We'll need to add image_url to the meals table if needed
                        },
                        quantity: order.quantity,
                        order_time: order.order_time,
                        status: order.status
                    };
                });

                setOrders(transformedOrders);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load orders. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Loading orders...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4 text-red-500">{error}</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
            <div className="grid gap-4">
                {orders.map((order) => (
                    <Card key={order.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{order.meal.name}</CardTitle>
                                <Badge variant={order.status === 'pending' ? 'default' : 'outline'}>
                                    {order.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Ordered on {format(new Date(order.order_time), 'PPP', { locale: de })}
                                    </p>
                                    <p className="text-sm">Quantity: {order.quantity}</p>
                                    <p className="font-semibold">
                                        Total: CHF {(order.meal.price * order.quantity).toFixed(2)}
                                    </p>
                                </div>
                                {order.meal.image_url && (
                                    <img
                                        src={order.meal.image_url}
                                        alt={order.meal.name}
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {orders.length === 0 && (
                    <p className="text-center text-gray-500">No orders found.</p>
                )}
            </div>
        </div>
    );
}
