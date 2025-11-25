# Mental Health Sentiment Analysis

A comprehensive machine learning project that analyzes text to detect and classify mental health sentiments using both traditional and deep learning approaches. The system identifies key mental health-related emotions including anxiety, depression, bipolar disorder, stress, suicidal ideation, personality disorders, and normal sentiment states.

## Project Overview
This project implements a dual-model approach to mental health sentiment classification:

- **Baseline Model:** Logistic Regression with TF-IDF vectorization and hyperparameter tuning via GridSearchCV
- **Advanced Model:** Fine-tuned RoBERTa transformer with regularization, early stopping, and class weighting

The system includes comprehensive text preprocessing, exploratory data analysis, model evaluation, and an interactive Gradio web interface for real-time sentiment prediction.


## Detected Sentiment Categories

- Anxiety
- Bipolar Disorder
- Depression
- Normal
- Personality Disorder
- Stress
- Suicidal Ideation
