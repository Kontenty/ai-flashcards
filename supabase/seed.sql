SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: flashcards; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."flashcards" ("id", "user_id", "front", "back", "source", "ease_factor", "interval", "next_review_date", "created_at", "updated_at") VALUES
	('d009e72f-0491-4c17-8402-905c400e13e8', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Jakie organizmy przeprowadzają fotosyntezę?', 'Fotosyntezę przeprowadzają rośliny, glony oraz niektóre bakterie.', NULL, 2.50, 6, '2025-08-11', '2025-08-04 22:12:48.089886+00', '2025-08-05 02:13:48.443096+00'),
	('26750a2e-09ca-4b13-b11b-143e4697d88e', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Jakie surowce są potrzebne do fotosyntezy?', 'Do fotosyntezy potrzebne są woda i dwutlenek węgla.', NULL, 2.60, 6, '2025-08-11', '2025-08-04 22:12:48.089886+00', '2025-08-05 02:14:04.944245+00'),
	('8a86d496-4d15-4929-b5d9-2a31541b328b', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Jakie są efekty uboczne fotosyntezy?', 'Efektem ubocznym fotosyntezy jest tlen, który jest uwalniany do atmosfery.', NULL, 2.60, 6, '2025-08-11', '2025-08-04 22:12:48.089886+00', '2025-08-05 02:14:17.953217+00'),
	('a9c13423-c99d-4044-be2a-4176ab6d18f7', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Dlaczego fotosynteza jest kluczowa dla życia na Ziemi?', 'Fotosynteza dostarcza pokarmu większości organizmów i reguluje skład atmosfery, co jest kluczowe dla życia na Ziemi.', NULL, 2.60, 6, '2025-08-11', '2025-08-04 22:12:48.089886+00', '2025-08-05 02:14:25.70592+00'),
	('301e451f-be30-4ae9-924d-d3c54fdc7ce8', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Jak rośliny pobierają wodę i dwutlenek węgla potrzebne do fotosyntezy?', 'Rośliny pobierają wodę przez korzenie, a dwutlenek węgla z powietrza przez aparaty szparkowe w liściach.', NULL, 2.60, 6, '2025-08-11', '2025-08-04 22:12:48.089886+00', '2025-08-05 02:14:42.729009+00'),
	('d03afef9-4e1c-4b37-962a-b93b1c7b31b2', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Co dzieje się w fazie świetlnej fotosyntezy?', 'W fazie świetlnej energia słoneczna jest absorbowana przez chlorofil w chloroplastach i przekształcana w energię chemiczną, a woda jest rozkładana na tlen i wodór.', NULL, 2.36, 6, '2025-08-11', '2025-08-04 22:12:48.089886+00', '2025-08-05 02:14:59.061727+00'),
	('b623f3ba-aab8-4889-86d2-d55ea962d93a', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Co to jest chlorofil i gdzie się znajduje?', 'Chlorofil to zielony pigment znajdujący się w chloroplastach – specjalnych organellach w komórkach roślinnych, który absorbuje energię słoneczną podczas fotosyntezy.', NULL, 2.18, 1, '2025-08-06', '2025-08-04 22:12:48.089886+00', '2025-08-05 02:15:24.837376+00'),
	('57241e83-b375-4721-99e6-730bec0146bc', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Na czym polega faza ciemna fotosyntezy?', 'Faza ciemna wykorzystuje energię z fazy świetlnej do przekształcenia dwutlenku węgla w glukozę, proces ten może zachodzić niezależnie od światła.', NULL, 1.96, 1, '2025-08-06', '2025-08-04 22:12:48.089886+00', '2025-08-05 02:15:44.946705+00'),
	('2aa4d256-5319-4be5-acf9-6949c561f098', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Co jest produktem końcowym fazy ciemnej fotosyntezy?', 'Produktem końcowym fazy ciemnej jest glukoza – cukier, który służy jako źródło pożywienia dla roślin.', NULL, 2.18, 1, '2025-08-06', '2025-08-04 22:12:48.089886+00', '2025-08-05 02:16:05.823263+00'),
	('ba9a51d8-f2d2-4707-991a-b605467f1d88', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Jak tlen powstaje i jest uwalniany podczas fotosyntezy?', 'Tlen powstaje podczas rozkładu wody w fazie świetlnej i jest uwalniany do atmosfery przez aparaty szparkowe.', NULL, 2.36, 6, '2025-08-11', '2025-08-04 22:12:48.089886+00', '2025-08-05 02:16:25.867206+00'),
	('db746cef-5cdf-4576-a1bf-3a0b8c7dbba0', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Jakie są inne nazwy cyklu Krebsa?', 'Cykl Krebsa jest również nazywany cyklem kwasu cytrynowego oraz cyklem kwasów trójkarboksylowych.', NULL, 1.96, 1, '2025-08-06', '2025-08-04 22:45:18.746409+00', '2025-08-05 02:16:40.491491+00'),
	('5f04c582-9c3f-4c01-88bb-e660ab99e6df', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Jakie jest główne wejście do cyklu Krebsa?', 'Do cyklu Krebsa wchodzi acetylo-CoA, który łączy się ze szczawiooctanem, tworząc cytrynian.', NULL, 1.70, 1, '2025-08-06', '2025-08-04 22:45:18.746409+00', '2025-08-05 02:17:00.634859+00'),
	('8f4cb6be-f51a-477e-abeb-067cabc423ab', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Co to jest fotosynteza?', 'Fotosynteza to proces, w którym rośliny, glony i niektóre bakterie przekształcają energię świetlną w energię chemiczną, wykorzystując wodę i dwutlenek węgla, a efektem ubocznym jest tlen.', NULL, 2.60, 6, '2025-08-11', '2025-08-04 22:12:48.089886+00', '2025-08-05 02:13:37.540703+00'),
	('5d5c3639-e9b3-42e1-8aff-e5afba5e4e0a', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Co to jest cykl Krebsa?', 'Cykl Krebsa, znany również jako cykl kwasu cytrynowego lub cykl kwasów trójkarboksylowych, to kluczowy etap oddychania komórkowego, w którym zachodzi utlenianie acetylo-CoA do dwutlenku węgla, dostarczając energię w postaci ATP oraz zredukowanych przenośników elektronów.', NULL, 2.18, 1, '2025-08-06', '2025-08-04 22:45:18.746409+00', '2025-08-05 02:16:32.289338+00'),
	('ffccf2ef-2c0a-4071-92d7-06cbf0d8062b', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Jakie reakcje enzymatyczne zachodzą w cyklu Krebsa?', 'W cyklu Krebsa zachodzą reakcje izomeryzacji, dehydrogenacji, hydratacji oraz dekarboksylacji, prowadzące do przekształcenia cytrynianu z powrotem do szczawiooctanu.', NULL, 2.18, 1, '2025-08-06', '2025-08-04 22:45:18.746409+00', '2025-08-05 02:17:09.349955+00'),
	('989e922d-34c5-4ae0-ba14-a76ce20a5db1', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Jakie produkty powstają podczas cyklu Krebsa?', 'Podczas cyklu Krebsa powstają dwutlenek węgla, ATP oraz zredukowane przenośniki elektronów NADH i FADH2.', NULL, 1.96, 1, '2025-08-06', '2025-08-04 22:45:18.746409+00', '2025-08-05 02:17:13.212668+00'),
	('cddcedeb-5e6c-4346-bba3-30146838b3a1', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Jaką rolę pełnią zredukowane przenośniki elektronów (NADH i FADH2) powstałe w cyklu Krebsa?', 'NADH i FADH2 dostarczają elektrony do łańcucha oddechowego, gdzie są wykorzystywane do syntezy ATP w procesie fosforylacji oksydacyjnej.', NULL, 1.96, 1, '2025-08-06', '2025-08-04 22:45:18.746409+00', '2025-08-05 02:17:16.327772+00'),
	('3a6e4be7-ac79-479a-be25-f98fbace4aac', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Jakie znaczenie metaboliczne ma cykl Krebsa?', 'Cykl Krebsa jest centralnym szlakiem metabolicznym, integrującym utlenianie węglowodanów, tłuszczów i aminokwasów oraz dostarczającym energię i prekursory do syntezy ważnych związków.', NULL, 2.36, 6, '2025-08-11', '2025-08-04 22:45:18.746409+00', '2025-08-05 02:17:22.112863+00'),
	('012fc5c9-83b8-4317-9381-bcf7552c7022', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'Jakie prekursory do syntezy innych związków dostarcza cykl Krebsa?', 'Produkty pośrednie cyklu Krebsa są wykorzystywane do syntezy aminokwasów, kwasów tłuszczowych, puryn i pirymidyn.', NULL, 2.18, 1, '2025-08-06', '2025-08-04 22:45:18.746409+00', '2025-08-05 02:17:33.500418+00'),
	('f56d0ace-e09f-4378-bf6e-94c9642ed98e', 'a367f81b-1971-4e34-8584-e9d243d75e12', 'W jaki sposób regulowany jest cykl Krebsa?', 'Cykl Krebsa jest ściśle regulowany zgodnie z komórkowym zapotrzebowaniem na energię, co pozwala dostosować jego aktywność do potrzeb metabolicznych komórki.', NULL, 2.36, 6, '2025-08-11', '2025-08-04 22:45:18.746409+00', '2025-08-05 02:17:41.31562+00');


--
-- Data for Name: flashcard_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."flashcard_reviews" ("id", "flashcard_id", "user_id", "quality", "reviewed_at", "interval", "ease_factor") VALUES
	('292b5d83-7eb6-4fb7-832c-ee1eb24875f2', '8f4cb6be-f51a-477e-abeb-067cabc423ab', 'a367f81b-1971-4e34-8584-e9d243d75e12', 5, '2025-08-05 02:13:37.540703+00', 6, 2.60),
	('362bdd85-079a-4e94-a723-0ad6123a9cbe', 'd009e72f-0491-4c17-8402-905c400e13e8', 'a367f81b-1971-4e34-8584-e9d243d75e12', 4, '2025-08-05 02:13:48.443096+00', 6, 2.50),
	('2fe4d3d8-bcf5-4e56-9c5c-91cf98936e68', '26750a2e-09ca-4b13-b11b-143e4697d88e', 'a367f81b-1971-4e34-8584-e9d243d75e12', 5, '2025-08-05 02:14:04.944245+00', 6, 2.60),
	('066cdd91-73c1-460f-abe7-a7d6935a0a08', '8a86d496-4d15-4929-b5d9-2a31541b328b', 'a367f81b-1971-4e34-8584-e9d243d75e12', 5, '2025-08-05 02:14:17.953217+00', 6, 2.60),
	('9355c722-1cf9-4134-9627-21e331dfc467', 'a9c13423-c99d-4044-be2a-4176ab6d18f7', 'a367f81b-1971-4e34-8584-e9d243d75e12', 5, '2025-08-05 02:14:25.70592+00', 6, 2.60),
	('2f68a352-258f-41b7-a464-b980d5d6393d', '301e451f-be30-4ae9-924d-d3c54fdc7ce8', 'a367f81b-1971-4e34-8584-e9d243d75e12', 5, '2025-08-05 02:14:42.729009+00', 6, 2.60),
	('2b519201-bdee-433c-80b8-80be15c12346', 'd03afef9-4e1c-4b37-962a-b93b1c7b31b2', 'a367f81b-1971-4e34-8584-e9d243d75e12', 3, '2025-08-05 02:14:59.061727+00', 6, 2.36),
	('3ec13032-6a14-4efb-96cc-837f95c957b8', 'b623f3ba-aab8-4889-86d2-d55ea962d93a', 'a367f81b-1971-4e34-8584-e9d243d75e12', 2, '2025-08-05 02:15:24.837376+00', 1, 2.18),
	('26f5d6c6-6409-46bb-83a6-003f900ba9af', '57241e83-b375-4721-99e6-730bec0146bc', 'a367f81b-1971-4e34-8584-e9d243d75e12', 1, '2025-08-05 02:15:44.946705+00', 1, 1.96),
	('bbf5a94a-0943-46cb-8b7b-0c902e3c98b7', '2aa4d256-5319-4be5-acf9-6949c561f098', 'a367f81b-1971-4e34-8584-e9d243d75e12', 2, '2025-08-05 02:16:05.823263+00', 1, 2.18),
	('469b7859-7e38-4a5d-96f1-0379cc91229f', 'ba9a51d8-f2d2-4707-991a-b605467f1d88', 'a367f81b-1971-4e34-8584-e9d243d75e12', 3, '2025-08-05 02:16:25.867206+00', 6, 2.36),
	('563dfa87-1d5b-4bc2-b753-97d153442d2b', '5d5c3639-e9b3-42e1-8aff-e5afba5e4e0a', 'a367f81b-1971-4e34-8584-e9d243d75e12', 2, '2025-08-05 02:16:32.289338+00', 1, 2.18),
	('30128234-4a8a-4624-a45d-24b9ff70d2bd', 'db746cef-5cdf-4576-a1bf-3a0b8c7dbba0', 'a367f81b-1971-4e34-8584-e9d243d75e12', 1, '2025-08-05 02:16:40.491491+00', 1, 1.96),
	('d62a7366-8d49-4fdd-8f04-f0ab4465d3fa', '5f04c582-9c3f-4c01-88bb-e660ab99e6df', 'a367f81b-1971-4e34-8584-e9d243d75e12', 0, '2025-08-05 02:17:00.634859+00', 1, 1.70),
	('e91df991-df13-4d2e-b3ac-c88fbc51e724', 'ffccf2ef-2c0a-4071-92d7-06cbf0d8062b', 'a367f81b-1971-4e34-8584-e9d243d75e12', 2, '2025-08-05 02:17:09.349955+00', 1, 2.18),
	('7d4faf98-fe5c-46b1-953e-7cd360eec4bc', '989e922d-34c5-4ae0-ba14-a76ce20a5db1', 'a367f81b-1971-4e34-8584-e9d243d75e12', 1, '2025-08-05 02:17:13.212668+00', 1, 1.96),
	('6fb034f3-4e63-4255-9f25-eb84442bdbae', 'cddcedeb-5e6c-4346-bba3-30146838b3a1', 'a367f81b-1971-4e34-8584-e9d243d75e12', 1, '2025-08-05 02:17:16.327772+00', 1, 1.96),
	('87dfb689-91a8-4b7f-9b65-1a6d69f7774c', '3a6e4be7-ac79-479a-be25-f98fbace4aac', 'a367f81b-1971-4e34-8584-e9d243d75e12', 3, '2025-08-05 02:17:22.112863+00', 6, 2.36),
	('b079ffaf-d7df-4052-8e26-2f232b23d3e7', '012fc5c9-83b8-4317-9381-bcf7552c7022', 'a367f81b-1971-4e34-8584-e9d243d75e12', 2, '2025-08-05 02:17:33.500418+00', 1, 2.18),
	('16b77391-dd3e-4d05-8485-700f6bd5a2b5', 'f56d0ace-e09f-4378-bf6e-94c9642ed98e', 'a367f81b-1971-4e34-8584-e9d243d75e12', 3, '2025-08-05 02:17:41.31562+00', 6, 2.36);


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tags" ("id", "name", "created_at", "user_id") VALUES
	('84be2eac-520d-44bd-8501-aa4949a3e4dc', 'nauka', '2025-08-04 22:15:31.892797+00', 'a367f81b-1971-4e34-8584-e9d243d75e12'),
	('3a8973b2-07d8-4154-9acb-0a19f01fda13', 'biologia', '2025-08-04 22:15:21.285726+00', 'a367f81b-1971-4e34-8584-e9d243d75e12'),
	('ad8f830c-dfb5-4920-84a8-2ff6229ebf06', 'informatyka', '2025-08-04 23:17:48.427346+00', 'a367f81b-1971-4e34-8584-e9d243d75e12');


--
-- Data for Name: flashcard_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- PostgreSQL database dump complete
--

RESET ALL;
