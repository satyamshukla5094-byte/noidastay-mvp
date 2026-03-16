import { COLLEGES, LANDMARKS } from "@/lib/constants/geo";
import slugify from "slugify";

export const AREA_SLUGS = [
  ...COLLEGES.map(c => ({
    slug: slugify(c.name, { lower: true }),
    name: c.name,
    type: 'College',
    lat: c.lat,
    lng: c.lng
  })),
  ...LANDMARKS.map(l => ({
    slug: slugify(l.name, { lower: true }),
    name: l.name,
    type: 'Landmark',
    lat: l.lat,
    lng: l.lng
  }))
];

export function getAreaBySlug(slug: string) {
  return AREA_SLUGS.find(a => a.slug === slug);
}
