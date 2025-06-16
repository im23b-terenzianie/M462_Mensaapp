'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useEffect, useState } from 'react';
import { useAccountType } from '@/lib/use-account-type';

export default function HeaderAuth() {
  const router = useRouter();
  const supabase = createClient();
  const { totalItems } = useCart();
  const [user, setUser] = useState<any>(null);
  const accountType = useAccountType();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <span className="text-sm text-muted-foreground">{accountType}</span>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          {user.user_metadata?.role === 'admin' && (
            <Link href="/admin">
              <Button variant="ghost">Admin</Button>
            </Link>
          )}
          <Link href="/orders">
            <Button variant="ghost">Vermerkt</Button>
          </Link>
          <Button variant="ghost" onClick={handleSignOut}>
            Sign Out
          </Button>
        </>
      ) : (
        <Link href="/auth">
          <Button variant="ghost">Sign In</Button>
        </Link>
      )}
    </div>
  );
}
