import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'

export async function getSummaryStats(startDate?: string, endDate?: string) {
    try {
        const session = await getSession('session')
        const cookieStore = await cookies()
        const token = (await cookieStore).get('token')?.value

        if (!session || session.user.role !== 'ROLE_SUPERADMIN' || !token) {
            throw new Error('Unauthorized')
        }

        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const end = endDate || new Date().toISOString().split('T')[0]

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'
        const response = await fetch(`${apiUrl}/admin/summary?start=${start}&end=${end}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            cache: 'no-store'
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch stats: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching summary stats:', error)
        return {
            pageViews: 0,
            newUsers: 0,
            totalPayments: 0,
            paymentsAmount: '0',
            totalOrders: 0,
            ordersAmount: '0',
            contactMessages: 0,
            dateRange: {
                start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end: endDate || new Date().toISOString().split('T')[0]
            }
        }
    }
}
