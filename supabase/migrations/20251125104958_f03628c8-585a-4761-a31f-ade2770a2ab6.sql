-- Update packages with TEST MODE Stripe Price IDs
UPDATE packages 
SET stripe_price_id = 'price_1SXJntJcYbog46zrmkYe1q1p'
WHERE slug = 'essential';

UPDATE packages 
SET stripe_price_id = 'price_1SXJoGJcYbog46zrRRyHXmyi'
WHERE slug = 'elevation';

UPDATE packages 
SET stripe_price_id = 'price_1SXJoNJcYbog46zrHWeKx0Hg'
WHERE slug = 'transformation';

UPDATE packages 
SET stripe_price_id = 'price_1SXJoPJcYbog46zr92zbw3R0'
WHERE slug = 'academy-lab';

UPDATE packages 
SET stripe_price_id = 'price_1SXJoQJcYbog46zrUfFDXRcq'
WHERE slug = 'summer-program';