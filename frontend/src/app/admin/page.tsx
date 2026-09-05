import { redirect } from 'next/navigation';

export default function AdminPage() {
  redirect('/admin/roles-and-permissions');
}
