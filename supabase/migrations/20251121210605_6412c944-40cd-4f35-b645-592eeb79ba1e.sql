-- Add Stripe Price IDs to packages
UPDATE packages 
SET stripe_price_id = 'price_1SW0ZyJcYbog46zrT4HALt9c'
WHERE slug = 'essential';

UPDATE packages 
SET stripe_price_id = 'price_1SW0fQJcYbog46zrWRn9L0kH'
WHERE slug = 'elevation';

UPDATE packages 
SET stripe_price_id = 'price_1SW0gvJcYbog46zrxwGYiDz6'
WHERE slug = 'transformation';

UPDATE packages 
SET stripe_price_id = 'price_1SW0iTJcYbog46zrFGSOMxk0'
WHERE slug = 'academy-lab';

UPDATE packages 
SET stripe_price_id = 'price_1SW0kQJcYbog46zrCVdWhqKz'
WHERE slug = 'summer-program';