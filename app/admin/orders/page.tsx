'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

interface Order {
    id: string;
    user_id: string;
    meal_id: string;
    quantity: number;
    order_time: string;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
    meal?: {
        name: string;
        portion_sizes: {
            medium: {
                price: number;
            };
        };
    };
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const supabase = createClient();

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    meal:meals(name, portion_sizes)
                `)
                .order('order_time', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
            await fetchOrders();
        } catch (err) {
            console.error('Error updating order status:', err);
            alert('Failed to update order status');
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

            if (error) throw error;
            await fetchOrders();
        } catch (err) {
            console.error('Error deleting order:', err);
            alert('Failed to delete order');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <h1 className="text-3xl font-bold mb-8">Orders Overview</h1>
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-10">
                <h1 className="text-3xl font-bold mb-8">Orders Overview</h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">Orders Overview</h1>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order Time</TableHead>
                            <TableHead>Meal</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Total Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>
                                    {new Date(order.order_time).toLocaleString()}
                                </TableCell>
                                <TableCell>{order.meal?.name}</TableCell>
                                <TableCell>{order.quantity}</TableCell>
                                <TableCell>
                                    <span className="font-medium">{order.meal?.portion_sizes?.medium?.price ? (order.meal.portion_sizes.medium.price * order.quantity).toFixed(2) : '0.00'} CHF</span>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        defaultValue={order.status}
                                        onValueChange={(value: Order['status']) => 
                                            updateOrderStatus(order.id, value)
                                        }
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="preparing">Preparing</SelectItem>
                                            <SelectItem value="ready">Ready</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="space-x-2">
                                    {order.status === 'completed' && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteOrder(order.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {order.status !== 'completed' && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteOrder(order.id)}
                                        >
                                            Done
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
} 