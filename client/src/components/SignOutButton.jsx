'use client';

import { Button } from "@/components/ui/button";

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      // Your route works perfectly here! Browser sends cookies automatically
      const response = await fetch('http://localhost:5000/api/v1/auth/sign-out', {
        method: 'POST',
        credentials: 'include', // Browser automatically sends cookies
      });
      
      if (response.ok) {
        window.location.href = '/sign-in';
      }
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/sign-in'; // Redirect anyway
    }
  };

  return <Button onClick={handleSignOut}>Sign Out</Button>;
}