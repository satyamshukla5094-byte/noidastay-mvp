import { Metadata } from 'next';
import { getAreaBySlug, AREA_SLUGS } from '@/lib/constants/areas';
import DiscoveryEngine from '@/components/DiscoveryEngine';
import { notFound } from 'next/navigation';

interface Props {
  params: { landmark: string };
}

export async function generateStaticParams() {
  return AREA_SLUGS.map((area) => ({
    landmark: area.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const area = getAreaBySlug(params.landmark);
  if (!area) return { title: 'Not Found' };

  return {
    title: `Best PGs near ${area.name} Greater Noida | Verified & Zero Brokerage`,
    description: `Looking for a room? Find the top rated PGs near ${area.name} in Knowledge Park, Greater Noida. Verified listings, student reviews, and secure escrow deposits.`,
    keywords: [`PG near ${area.name}`, `Hostel in Greater Noida`, `Knowledge Park 2 PG`, `Student housing Greater Noida`],
    openGraph: {
      title: `Top Rated PGs near ${area.name} | NoidaStay`,
      description: `Verified student housing near ${area.name} with digital agreements and escrow protection.`,
    }
  };
}

export default function AreaPage({ params }: Props) {
  const area = getAreaBySlug(params.landmark);
  if (!area) notFound();

  return (
    <main className="min-h-screen bg-slate-50">
      <DiscoveryEngine initialCenter={{ lat: area.lat, lng: area.lng }} areaName={area.name} />
    </main>
  );
}
