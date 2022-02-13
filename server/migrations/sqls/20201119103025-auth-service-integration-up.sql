TRUNCATE TABLE organisation CASCADE;

ALTER TABLE organisation ADD COLUMN client_id TEXT NOT NULL;

DROP TABLE IF EXISTS organisation_credentials;

DROP INDEX IF EXISTS organisation_client_id_secret;

INSERT INTO organisation 
  (display_name, client_id)
VALUES 
  ('demo.dev.sardine.ai', 'e149f2c5-4fce-4aef-98fd-90967c6aef5d'),
  ('demo.sardine.ai', 'da9e843a-f2c5-4de2-bf63-a31a45c2eac6'),
  ('localhost', '616c9cea-4801-4503-bfd7-01b37167ee4f'),
  ('komparify.com', 'bb1df3d0-b726-4951-ad2c-2e2dba2ad724'),
  ('soovle.com', '27780b1a-a94b-4381-a6b1-062fefc1c03b'),
  ('sardine.ai', 'f7853b8c-990a-4279-bafc-518e0c823457'),
  ('trial.moonpay.io', 'f469f9ba-d8a0-48ad-8be9-bdf9245c2759'),
  ('trial.zabo.com', '74269d3f-507c-4f99-a8c3-8e340fdbceba'),
  ('sogosurvey.com', '39ca424f-990a-4a80-9dff-e10fabf112e6'),
  ('trial1.com', 'd06b0565-9043-422a-8287-74ea57b947b3'),
  ('trial2.com', 'f31361a6-1ff1-4ac5-b512-20d6f874c360'),
  ('trial3.com', '474af07e-0d4d-4bca-9cb8-c5f865955d2d'),
  ('letsdeel.com', '47473ac8-1754-4950-980d-831a46506207'),
  ('test-android-sdk', '36431e5f-d711-4e5c-b990-fe3cb548fbee'),
  ('test-ios-sdk', 'a40dfdff-8c80-4088-9920-f6869c4a3b9c'),
  ('dev.valiu.com', 'dfb6cc02-44df-4930-8eaf-38a34d54d5df'),
  ('trial.binance.com', 'a02042f1-caea-4c0f-b4ea-dc67e4ed95f5'),
  ('trial.honestbank.com', '98cf8669-5679-44f0-95b3-8d59001ce4e6'),
  ('trial.givecrypto.org', '05dc6668-19ec-47f6-877e-3c68d25ada9b'),
  ('alloy', '40899d8a-7cda-41ef-8d06-7a09dbe09d13'),
  ('hummingbird', 'b57e9dd1-b299-4e30-bde9-c75773945a29'),
  ('ios-demo-app', '849f84bb-c311-4312-9466-d289b80ef06a'),
  ('android-demo-app', '8f5beb52-bb63-4a0c-8e5c-4d1206a0d673'),
  ('trial.rippling.com', '61e01641-4cda-427a-bbde-12d8d9e00daa'),
  ('trial.myzeller.com', 'ca73d0e1-d73e-4a23-875b-b2a45c4e67ec'),
  ('trial.kraken.com', 'c04da165-36f4-4a6e-9237-0535d8ea8e87'),
  ('trial.btcmarkets.net', 'f8cada1f-9682-4cc5-8848-146361790403'),
  ('trial.revolut.com', '836b6949-089a-49a1-a201-17ee674df741'),
  ('trial.payfone.com', 'b6a3ba83-0834-4bf2-bd7b-dcd8f862d89d'),
  ('integration-test', '3f2dc3fa-924b-4f43-bc86-198f537b728f'),
  ('trial.jupitarbank', '4b154c47-647f-4474-bcff-864819acade8'),
  ('bureau.jupiter.money', '66c0510b-0452-4dae-b9d1-3ef010c6873f'),
  ('test.keyvalue.systems', 'e72a4414-a416-4872-8eea-6b51d6cd96e1'),
  ('valiu', '11d3993b-5fa9-4c3a-90aa-b9f49e1aef59'),
  ('trial.cuanto', '3eebab36-05c4-45c0-85ea-c1fa5083f4af'),
  ('jupiter', '4dfcddb0-9fa1-4f9a-b9ea-c73af5b44c86'),
  ('trial.dharma', 'd37ca223-5820-457a-b6b8-f7e0a586ffeb'),
  ('dev.moonpay', '98fc5a4f-9991-4ef0-bf76-3c6dc8e24491'),
  ('dev.jumio', '2674ed0f-8004-4879-a867-0798e665ccc9'),
  ('dev.telesign', 'c24c2bd7-adc9-4282-92a5-7e2ac52a4ddf');
