import { cookies } from 'next/headers';

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;

        if (!accessToken) {
            return null;
        }

        const response = await fetch('http://localhost:5000/api/v1/auth/me', {
            method: 'GET',
            headers: {
                'Cookie': `accessToken=${accessToken}`,
                'Content-Type': 'application/json',
            },
            // Add cache: 'no-store' to prevent caching if needed
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('Failed to fetch user:', response.status);
            return null;
        }

        const data = await response.json();
        return data.user;

    } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
    }
}
