-- Seed mock exam results
-- Uses a fixed test user UUID (not a real auth user — for local dev only)

do $$
declare
  test_user_id uuid := 'USER_ID_PLACEHOLDER';
begin

insert into public.exam_results (user_id, exam_id, skill, level, score, total_score, answers, completed_at) values

-- KNM
(test_user_id, 'knm-exam-1', 'knm', null, 32, 40,
  '{"q1":1,"q2":1,"q3":2,"q4":1,"q5":1,"q6":1,"q7":1,"q8":1,"q9":1,"q10":1,"q11":1,"q12":1,"q13":1,"q14":1,"q15":1,"q16":1,"q17":1,"q18":1,"q19":1,"q20":1,"q21":1,"q22":1,"q23":1,"q24":1,"q25":1,"q26":2,"q27":1,"q28":1,"q29":1,"q30":1,"q31":1,"q32":1,"q33":1,"q34":1,"q35":1,"q36":1,"q37":1,"q38":1,"q39":1,"q40":1}',
  now() - interval '3 days'),

(test_user_id, 'knm-exam-2', 'knm', null, 38, 40,
  '{"q1":2,"q2":1,"q3":2,"q4":1,"q5":1,"q6":1,"q7":1,"q8":1,"q9":1,"q10":1,"q11":1,"q12":1,"q13":1,"q14":1,"q15":1,"q16":1,"q17":1,"q18":1,"q19":1,"q20":1,"q21":1,"q22":1,"q23":1,"q24":1,"q25":1,"q26":1,"q27":1,"q28":1,"q29":1,"q30":1,"q31":1,"q32":1,"q33":1,"q34":1,"q35":1,"q36":1,"q37":1,"q38":1,"q39":1,"q40":1}',
  now() - interval '1 day'),

-- Reading A2
(test_user_id, 'reading-a2-exam-1', 'reading', 'A2', 20, 25,
  '{"q1":1,"q2":1,"q3":0,"q4":1,"q5":1,"q6":2,"q7":1,"q8":2,"q9":1,"q10":1,"q11":1,"q12":2,"q13":1,"q14":1,"q15":2,"q16":1,"q17":1,"q18":1,"q19":1,"q20":1,"q21":1,"q22":1,"q23":2,"q24":2,"q25":1}',
  now() - interval '5 days'),

(test_user_id, 'reading-a2-exam-2', 'reading', 'A2', 23, 25,
  '{"q1":1,"q2":1,"q3":1,"q4":1,"q5":1,"q6":2,"q7":1,"q8":2,"q9":1,"q10":1,"q11":1,"q12":2,"q13":1,"q14":1,"q15":2,"q16":1,"q17":1,"q18":1,"q19":1,"q20":1,"q21":1,"q22":1,"q23":1,"q24":1,"q25":1}',
  now() - interval '2 days'),

-- Listening A2
(test_user_id, 'listening-a2-exam-1', 'listening', 'A2', 18, 25,
  '{"q1":0,"q2":0,"q3":0,"q4":1,"q5":0,"q6":0,"q7":1,"q8":1,"q9":1,"q10":0,"q11":0,"q12":2,"q13":0,"q14":1,"q15":1,"q16":2,"q17":2,"q18":2,"q19":0,"q20":0,"q21":1,"q22":0,"q23":0,"q24":0,"q25":1}',
  now() - interval '6 days'),

(test_user_id, 'listening-a2-exam-2', 'listening', 'A2', 22, 25,
  '{"q1":0,"q2":0,"q3":0,"q4":1,"q5":0,"q6":0,"q7":1,"q8":1,"q9":1,"q10":0,"q11":0,"q12":2,"q13":0,"q14":1,"q15":1,"q16":2,"q17":2,"q18":2,"q19":0,"q20":0,"q21":1,"q22":0,"q23":0,"q24":0,"q25":1}',
  now() - interval '4 hours'),

-- Writing A2 (no score — assessed by AI)
(test_user_id, 'writing-a2-exam-1', 'writing', 'A2', 0, 4,
  '{"q1":"Beste baas, Ik ben helaas ziek en kan vandaag niet komen werken. Ik heb koorts en moet rust houden van de dokter. Ik denk dat ik morgen of overmorgen weer beter ben. Kunt u mij zeggen wat ik moet doen? Met vriendelijke groet","q2":"Voornaam: Ahmed\nAchternaam: El Amrani\nAdres: Hoofdstraat 12\nPostcode: 1234 AB\nWoonplaats: Amsterdam\nGeboortedatum: 15-03-1990\nTelefoonnummer: 0612345678\nE-mailadres: ahmed@email.nl\nHuidig taalniveau: A2\nBeschikbare dagdelen: maandagochtend, woensdagmiddag, vrijdagochtend","q3":"Geachte verhuurder, Ik schrijf u omdat mijn buurman elke nacht harde muziek speelt. Dit is erg lastig voor mij en mijn kinderen. Wij kunnen niet slapen. Kunt u dit probleem oplossen? Ik hoop op een snelle reactie. Met vriendelijke groet","q4":"Hallo, mijn naam is Fatima en ik kom uit Marokko. Ik woon nu al drie jaar in Nederland. Ik wil graag lid worden van de sportclub omdat ik graag wil bewegen en nieuwe mensen wil ontmoeten. Ik speel graag tennis en zwem ook veel."}',
  now() - interval '7 days'),

-- Speaking A2 (no score — assessed by AI)
(test_user_id, 'speaking-a2-exam-1', 'speaking', 'A2', 0, 16,
  '{"q1":"recorded","q2":"recorded","q3":"recorded","q4":"recorded","q5":"recorded","q6":"recorded","q7":"recorded","q8":"recorded","q9":"recorded","q10":"recorded","q11":"recorded","q12":"recorded","q13":"recorded","q14":"recorded","q15":"recorded","q16":"recorded"}',
  now() - interval '8 days');

end $$;
