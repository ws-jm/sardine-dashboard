INSERT INTO organisation 
(id, display_name) 
VALUES 
('1', 'sardine');

INSERT INTO organisation_credentials 
(organisation_id, client_id, client_secret)
VALUES 
('1', 'f469f9ba-d8a0-48ad-8be9-bdf9245c2759', 'cd786d0066637fd0a596f55bc4528349a9a433858c640c35837410f3fbaaa2b791fde896da85b3e882eb6e3522364515c8621dd9a066752c7fac0074658cce7edc5931f3dacb6fb883aac047b9ebb1caf2d2dc2db6f0a148d336aef84626e3c0c3ac07c13d3be9a7498dcdb93f7150fec7345b8c66ef7d786b6d109a3a3eea9966cbd1a3aaa795c57634e69b92caffe9eb486ad3747a2ced93063079ec62306e6edff647c311f3b4203cceaf4700ee3830163bcbd1ed59163aacfd4b910438a74fc5180bc1ee8d0049df14c67580e5c691e4f85352d514959ddabf291ca597525557f567aeed339d7f0809f0fba64809371ae374068e1fa46121704d96eced6f');


INSERT INTO superadmin_emails (id, email)
VALUES (1, 'gaurav@codalyze.com'),
(2, 'sid@codalyze.com'),
(3, 'andrei@sardine.ai'),
(4, 'divakar@sardine.ai');

-- UPDATE the serial_sequence for tables
DO
$do$
DECLARE tablename text;
BEGIN
    FOR tablename
    IN SELECT table_name
    FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE' AND
    table_name != '__EFMigrationsHistory' AND table_name != 'sessions'
        LOOP
            EXECUTE format('SELECT setval(pg_get_serial_sequence(''"%s"'', ''id''), (SELECT MAX("id") + 1 from "%s"))', tablename, tablename);
    END LOOP;
END
$do$
;
