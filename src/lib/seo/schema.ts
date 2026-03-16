import { Review } from "@/components/ReviewSection";

export function generatePropertySchema(property: any, reviews: any[]) {
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 5;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": property.title,
    "image": property.images?.[0],
    "description": property.description,
    "sku": property.id,
    "brand": {
      "@type": "Brand",
      "name": "NoidaStay"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://noidastay.com/property/${property.id}`,
      "priceCurrency": "INR",
      "price": property.price,
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": avgRating.toFixed(1),
      "reviewCount": Math.max(reviews.length, 1)
    }
  };
}

export function generateLocalBusinessSchema(property: any) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": property.title,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Greater Noida",
      "addressRegion": "UP",
      "addressCountry": "IN",
      "streetAddress": property.sector
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": property.lat,
      "longitude": property.lng
    },
    "url": `https://noidastay.com/property/${property.id}`,
    "telephone": "+919999999999",
    "priceRange": "₹₹"
  };
}
