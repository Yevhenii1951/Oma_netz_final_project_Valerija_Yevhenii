// Redirect root to actual landing - landing is served from (marketing)/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/landing');
}