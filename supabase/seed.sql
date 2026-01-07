-- Seed data for Real Estate Agent Portal
-- Run this after schema.sql

-- Insert sample agents
INSERT INTO agents (id, full_name, email, phone, brokerage_name, license_number, address, status) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Sarah Johnson', 'sarah.johnson@realty.com', '(555) 123-4567', 'Premier Realty Group', 'RE-2024-001', '123 Main Street, Suite 100, New York, NY 10001', 'active'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'Michael Chen', 'michael.chen@homefinders.com', '(555) 234-5678', 'HomeFinders Inc.', 'RE-2024-002', '456 Oak Avenue, Los Angeles, CA 90001', 'active'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'Emily Rodriguez', 'emily.rodriguez@luxuryhomes.com', '(555) 345-6789', 'Luxury Homes International', 'RE-2024-003', '789 Palm Drive, Miami, FL 33101', 'active'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'David Thompson', 'david.thompson@cityproperties.com', '(555) 456-7890', 'City Properties LLC', 'RE-2024-004', '321 Urban Way, Chicago, IL 60601', 'active'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'Jennifer Williams', 'jennifer.williams@coastalrealty.com', '(555) 567-8901', 'Coastal Realty Partners', 'RE-2024-005', '654 Beach Boulevard, San Diego, CA 92101', 'inactive');

-- Insert sample inspections
INSERT INTO inspections (agent_id, inspection_date, property_address, status, inspector_name, notes) VALUES
  -- Sarah Johnson's inspections
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '2026-01-15', '100 Park Avenue, Apt 5A, New York, NY 10017', 'scheduled', 'Robert Martinez', 'Pre-purchase inspection for luxury condo'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '2025-12-20', '250 West 57th Street, Unit 12B, New York, NY 10019', 'completed', 'Lisa Anderson', 'Inspection completed. Minor repairs needed.'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '2025-11-10', '88 Greenwich Street, New York, NY 10006', 'completed', 'James Wilson', 'Full building inspection. All systems operational.'),
  
  -- Michael Chen's inspections
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '2026-01-20', '1234 Sunset Boulevard, Los Angeles, CA 90028', 'scheduled', 'Maria Garcia', 'New construction final inspection'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '2025-12-15', '5678 Hollywood Hills Drive, Los Angeles, CA 90068', 'completed', 'Kevin Brown', 'Pool and spa inspection included'),
  
  -- Emily Rodriguez's inspections
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', '2026-01-25', '900 Brickell Bay Drive, Miami, FL 33131', 'scheduled', 'Carlos Hernandez', 'Waterfront property - hurricane shutters inspection'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', '2025-12-28', '1500 Ocean Drive, Miami Beach, FL 33139', 'completed', 'Ana Santos', 'Excellent condition. Ready for closing.'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', '2025-10-05', '2200 Collins Avenue, Miami Beach, FL 33140', 'canceled', 'Carlos Hernandez', 'Buyer withdrew offer'),
  
  -- David Thompson's inspections
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', '2026-02-01', '333 North Michigan Avenue, Chicago, IL 60601', 'scheduled', 'Thomas Wright', 'Commercial property inspection'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', '2025-12-10', '1000 Lake Shore Drive, Chicago, IL 60611', 'completed', 'Patricia Lee', 'Lakefront condo - HVAC needs service'),
  
  -- Jennifer Williams's inspections
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', '2025-09-15', '4500 La Jolla Village Drive, San Diego, CA 92122', 'completed', 'Daniel Kim', 'Standard residential inspection'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', '2025-08-20', '7890 Mission Beach, San Diego, CA 92109', 'completed', 'Rachel Green', 'Beach property - foundation check requested');

-- Note: Documents would typically be added through the application
-- when actual PDF files are uploaded. The storage_path would reference
-- the Supabase Storage location.

-- Sample audit log entries
INSERT INTO audit_logs (actor_role, action, entity_type, metadata) VALUES
  ('admin', 'CREATE_AGENT', 'agent', '{"agentName": "Sarah Johnson", "email": "sarah.johnson@realty.com"}'),
  ('admin', 'CREATE_AGENT', 'agent', '{"agentName": "Michael Chen", "email": "michael.chen@homefinders.com"}'),
  ('admin', 'CREATE_AGENT', 'agent', '{"agentName": "Emily Rodriguez", "email": "emily.rodriguez@luxuryhomes.com"}'),
  ('admin', 'CREATE_AGENT', 'agent', '{"agentName": "David Thompson", "email": "david.thompson@cityproperties.com"}'),
  ('admin', 'CREATE_AGENT', 'agent', '{"agentName": "Jennifer Williams", "email": "jennifer.williams@coastalrealty.com"}'),
  ('admin', 'CREATE_INSPECTION', 'inspection', '{"propertyAddress": "100 Park Avenue, Apt 5A, New York, NY 10017"}'),
  ('admin', 'CREATE_INSPECTION', 'inspection', '{"propertyAddress": "1234 Sunset Boulevard, Los Angeles, CA 90028"}');
