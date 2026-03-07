import './globals.css';

export const metadata = {
  title: 'Pocket Hash | Private Commerce OS',
  description: 'Private delivery, pickup, and in-store commerce software with loyalty, POS controls, and owner-managed deployment.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-zinc-950">{children}</body>
    </html>
  );
}
