# Grading models

The AI grader in `src/lib/exam/grader.ts` follows the official DUO assessment models for the A2
inburgeringsexamen. Change the grader only to match these documents, and replace them when DUO
publishes a new version.

| File                                                                       | Used for                                  | Max points |
| -------------------------------------------------------------------------- | ----------------------------------------- | ---------- |
| `duo-beoordelingsmodel-schrijven-a2-vrij-schrijven-en-correspondentie.pdf` | Writing: messages, letters and open texts | 10         |
| `duo-beoordelingsmodel-schrijven-a2-formulier.pdf`                         | Writing: the form task (`"form": true`)   | 7          |
| `duo-beoordelingsmodel-spreken-a2.pdf`                                     | Speaking, every answer                    | 12         |

Source: [DUO Zakelijk, beoordelingsmodellen en eindtermen](https://duo.nl/zakelijk/inburgering-ketenpartners/examens/inburgeringsexamen/beoordelingsmodellen-en-eindtermen.jsp),
downloaded 2026-10-11. DUO publishes no B1 models and no other grading documents for these exams.
The PDFs are DUO's and are not in this repository; download them from that page into this folder.

## Not used

`beoordelingsmodel_schrijven_a2-b1.pdf` and `beoordelingsmodel_spreken_a2-b1.pdf` are the
_Driepunts-beoordelingsmodel MVT_ (moderne vreemde talen): the model Dutch schools use to grade
foreign-language exams, not the inburgeringsexamen. It differs from DUO's models: every aspect is
scored 0 to 2, and the speaking model fails a candidate for speaking Dutch. The grader does not
follow it.
