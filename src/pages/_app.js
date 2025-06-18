import { PickupProvider } from '@/context/PickupContext';
import ActivePickupBanner from '@/components/ActivePickupBanner';
import "@/styles/index.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function App({ Component, pageProps }) {
  return (
    // MEMBUNGKUS SELURUH APLIKASI DENGAN PROVIDER
    <PickupProvider>
      <main className={`${poppins.variable} font-poppins`}>
        <Component {...pageProps} />
        {/* Banner ini akan kita ubah nanti, untuk sekarang biarkan */}
        <ActivePickupBanner />
      </main>
    </PickupProvider>
  );
}