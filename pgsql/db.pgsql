-- create role quesstuser with password quesst
do
$body$
declare
  num_users integer;
begin
   SELECT count(*)
     into num_users
   FROM pg_user
   WHERE usename = 'sardineadmin';

   IF num_users = 0 THEN
      CREATE ROLE sardineadmin LOGIN PASSWORD 'Yn(Y)Q7mWZC4}>qC';
   END IF;
end
$body$
;
ALTER ROLE sardineadmin CREATEDB;

-- create db bk2 with owner bk
CREATE DATABASE sardinedb WITH OWNER=sardineadmin;
GRANT ALL PRIVILEGES ON DATABASE sardinedb TO sardineadmin;
