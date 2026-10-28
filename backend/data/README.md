# CPIP Phase 1 dashboard dataset

CPIP uses the public **Past FYP Data** dataset as a reference dataset for the Phase 1 analytics dashboard.

Source:
https://www.kaggle.com/datasets/nabeelqureshitiii/past-fyp-data

The dataset describes final-year projects with fields such as:
- title
- abstract
- domain
- technologies
- year
- source URL

The dataset page describes it as a curated collection of 1300+ final-year project ideas and states that it is intended for academic and research use.

## Included demo CSV

`past_fyp_demo.csv` is a small dashboard-ready snapshot following the same schema. It is included so the project can be demonstrated without requiring a Kaggle download.

For the complete dataset, download the CSV from the source above and run:

```bash
cd backend
npm run seed
node scripts/importFypDataset.js path/to/your/full.csv
```

Imported records are marked with `source: DATASET` and are separate from real campus submissions.
