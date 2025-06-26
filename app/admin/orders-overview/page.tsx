'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Meal } from '@/types/meal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, CheckCircle } from 'lucide-react';

interface OrderItem {
    id: string;
    meal: Meal;
    order_time: string;
    quantity: number;
    user_name?: string;
    status: string;
}

interface OrderWithMeal {
    id: string;
    quantity: number;
    order_time: string;
    status: string;
    user_id: string;
    meals: {
        id: string;
        name: string;
        description: string;
        ingredients: string[];
        allergens: string[];
        country_of_origin: string;
        image_url: string;
        portion_sizes: {
            [key: string]: {
                price: number;
                description?: string;
            };
        };
        created_at: string;
        updated_at: string;
    }[];
}

export default function OrdersOverviewPage() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTodayOrders = async () => {
        try {
            const supabase = createClient();
            
            // Get today's date range
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
            
            // Fetch today's orders (not deleted)
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    quantity,
                    order_time,
                    status,
                    user_id,
                    meals!inner (
                        id,
                        name,
                        description,
                        ingredients,
                        allergens,
                        country_of_origin,
                        image_url,
                        portion_sizes,
                        created_at,
                        updated_at
                    )
                `)
                .neq('status', 'deleted')
                .gte('order_time', startOfDay.toISOString())
                .lte('order_time', endOfDay.toISOString())
                .order('order_time', { ascending: true });

            if (error) {
                console.error('Error fetching orders:', error);
                return;
            }

            // Transform the data
            const transformedOrders: OrderItem[] = (data as unknown as OrderWithMeal[]).map(order => {
                const meal = Array.isArray(order.meals) ? order.meals[0] : order.meals;
                // Ensure portion_sizes has description fallback
                const portionSizesWithDescription = Object.fromEntries(
                    Object.entries(meal.portion_sizes).map(([key, value]) => {
                        const v = value as { price: number; description?: string };
                        return [
                            key,
                            {
                                price: v.price,
                                description: v.description ?? ''
                            }
                        ];
                    })
                );
                return {
                    id: order.id,
                    meal: {
                        id: meal.id,
                        name: meal.name,
                        description: meal.description,
                        ingredients: meal.ingredients,
                        allergens: meal.allergens,
                        country_of_origin: meal.country_of_origin,
                        image_url: meal.image_url,
                        portion_sizes: portionSizesWithDescription,
                        created_at: meal.created_at,
                        updated_at: meal.updated_at
                    },
                    order_time: order.order_time,
                    quantity: order.quantity,
                    status: order.status
                };
            });

            setOrders(transformedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) {
                console.error('Error updating order status:', error);
                return;
            }

            // Refresh the orders list
            await fetchTodayOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const deleteOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to delete this order?')) {
            return;
        }

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) {
                console.error('Error deleting order:', error);
                return;
            }

            // Refresh the orders list
            await fetchTodayOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    useEffect(() => {
        fetchTodayOrders();

        // Set up real-time subscription for new orders
        const supabase = createClient();
        const channel = supabase
            .channel('orders_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders'
                },
                () => {
                    // Refetch orders when there are changes
                    fetchTodayOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <h1 className="text-3xl font-bold mb-8">Live Orders Overview</h1>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">Live Orders Overview</h1>
            
            {orders.length === 0 ? (
                <p className="text-gray-600">No orders for today.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orders.map((order) => (
                        <div 
                            key={order.id} 
                            className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xl font-semibold">{order.meal.name}</h2>
                                <span className="text-sm text-gray-500">
                                    {new Date(order.order_time).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="space-y-1 mb-4">
                                <p className="text-gray-600">
                                    Quantity: <span className="font-medium">{order.quantity}</span>
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600">Status:</span>
                                    <Badge variant={order.status === 'pending' ? 'default' : 'outline'} className="capitalize">{order.status}</Badge>
                                </div>
                                <p className="text-gray-600">
                                    Price: <span className="font-medium">
                                        CHF {(order.meal.portion_sizes.medium.price * order.quantity).toFixed(2)}
                                    </span>
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {order.status === 'pending' && (
                                    <Button 
                                        size="sm" 
                                        onClick={() => updateOrderStatus(order.id, 'completed')}
                                        className="flex-1"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Complete
                                    </Button>
                                )}
                                {order.status === 'completed' && (
                                    <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={() => deleteOrder(order.id)}
                                        className="flex-1"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </Button>
                                )}
                                {order.status === 'pending' && (
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 