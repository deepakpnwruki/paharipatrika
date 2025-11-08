// lib/submitMobileToWP.ts

export async function submitMobileToWP(mobile: string) {
  // Replace with your actual WordPress site URL
  const WP_API_URL = 'https://your-wordpress-site.com/wp-json/apmc/v1/mobile';

  // Validate mobile number (10 digits, India)
  if (!/^\d{10}$/.test(mobile)) {
    return { success: false, error: 'Invalid mobile number' };
  }

  try {
    const res = await fetch(WP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || 'Failed to submit' };
    }
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
}
