import './globals.css';

export const metadata = {

  title: "Pocket Hash",
  description: "Members-only delivery service. Same-day drops.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-zinc-950">{children}</body>
    </html>
  );
}
