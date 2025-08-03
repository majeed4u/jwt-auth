import { cookies } from 'next/headers';
const url = 'http://localhost:5000/api/v1/auth/sign-out'
export async function signOut() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to sign out');
        }
    } catch (error) {
        console.error('Error signing out:', error);
    }
}
