-- 1. Insert 4 premium mock PG listings
INSERT INTO listings (title, price, image_url, location, is_verified) 
VALUES 
('Premium Boys PG in Knowledge Park', 8500, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800', 'Knowledge Park III', true),
('Cozy Girls Apartment', 10000, 'https://images.unsplash.com/photo-1502672260266-1c1de2d1d0e1?auto=format&fit=crop&q=80&w=800', 'Alpha 1', true),
('Budget Shared Room', 6000, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800', 'Beta 2', false),
('Luxury Studio with AC & Food', 14000, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800', 'Knowledge Park III', true);
